# Lending Market and Stableswap
## Overview
- The Lending Market is a Compound fork with modified governance. 

# General Functionality of Lending Markets in Compound

[https://compound.finance/docs/ctokens](https://compound.finance/docs/ctokens) (Please refer here for detailed documentation regarding the functionality of the lending market)

In entirety, the lending market is composed of 

- CTokens- Contractual representation of money markets (Issuance of cTokens, mint/redeem borrow/repayBorrow). cTokens may be broken into
    - CErc20 Tokens - Any pool attached to a generic token that implements the EIP20Interface.
        - CErc20 Tokens are accessed via a proxy mechanism (CErc20Delegator/CErc20Delegate) that is explained further
    - CEther Tokens - The pool attached to the native token of the EVM on which the lending market is deployed.
- Comptroller - Controls the general accounting required for basic functionality within CToken markets (accountLiquidities, supportedMarkets, etc. ), **compound docs**: ([https://compound.finance/docs/comptroller](https://compound.finance/docs/comptroller))
- PriceOracle - The Comptroller contains a reference to a user-specified price oracle, in our case this oracle the stableswap oracle.

## Modifications to Compound
- Removed Comp Token.
- Removed Comp token references in GovernorBravo and Comptroller.
- Dripping of Wrapped-Canto (ERC-20 version of native token Canto) to Suppliers of Lending. Market instead of Comp token.
- Governance Modifications
- Created custom Unigov Interface with Proposal struct and function that takes in a proposal ID and returns the correctly mapped Proposal struct.

```
interface UnigovInterface{
    struct Proposal {
        // @notice Unique id for looking up a proposal
        uint id;
        string title;
        
        string desc;
        // @notice the ordered list of target addresses for calls to be made
        address[] targets;
	
        uint[] values;
        // @notice The ordered list of function signatures to be called
        string[] signatures;
        // @notice The ordered list of calldata to be passed to each call
        bytes[] calldatas;
    }
  function QueryProp(uint propId) external view returns(Proposal memory);
}
```

- Modified Queue function to query a proposal from the Map Contract and call queueOrRevertInternal on the queried proposal to send to TimeLock.

```
function queue(uint proposalId) external {
	    // address of map contract; used to query proposals from cosmos SDK
        address mapContractAddress = 0x30E20d0A642ADB85Cb6E9da8fB9e3aadB0F593C0;
        // attach to contract using interface defined above
        UnigovInterface unigov = UnigovInterface(mapContractAddress);
        
        // call QueryProp method here
        UnigovInterface.Proposal memory prop = unigov.QueryProp(proposalId);
	
        // TODO: need to look into definition of timelock delay - make sure it meets our requirements
        uint eta = add256(block.timestamp, timelock.delay());
        for (uint i = 0; i < prop.targets.length; i++) {
            queueOrRevertInternal(prop.targets[i], prop.values[i], prop.signatures[i], prop.calldatas[i], eta);
        }
        emit ProposalQueued(proposalId, eta);
    }
```

# CNote/Note

Note is a over-collateralized stable-coin that is soft-pegged to the Dollar

Note extends the base ERC20 implementation defined in the protocol. However, Note mints type(uint).max tokens to the accountantDelegator on deployment

```solidity
function _setAccountantAddress(address accountant_) external {
        require(msg.sender == admin);
        require(address(accountant) == address(0));
        accountant = accountant_;
        if (balanceOf(accountant) != type(uint).max) {
            _mint_to_Accountant(accountant);
            admin = accountant;
        }
    }
```

The Accountant contract can be set only once, by the admin of the protocol (Timelock). The accountant is the smart contract that provides note liquidity to the lending market and ensures that no extra note is left in cNote market by redeeming its cTokens. 

The borrow and supply rates for Note are equal to each other, their calculation is defined in NoteInterest.sol as follows:

```solidity
function getBorrowRateInternal() internal view returns (uint) {
        // Gets the Note/gUSDC TWAP in a given interval, as a mantissa (scaled by 1e18)
        uint twapMantissa = oracle.getUnderlyingPrice(cNote); // returns price as mantissa
        //uint ir = (1 - twapMantissa).mul(adjusterCoefficient).add(baseRatePerYear);
        int diff = BASE - int(twapMantissa); //possible annoyance if 1e18 - twapMantissa > 2**255, differ
        int InterestAdjust = (diff * int(adjusterCoefficient))/BASE;
        int ir = InterestAdjust + int(baseRatePerYear);
        uint NewbaseRatePerYear = ir >= 0 ? uint(ir) : 0;
        // convert it to base rate per block
        uint newRatePerBlock = NewbaseRatePerYear.div(BlocksPerYear);
        return newRatePerBlock;
    }
```

Notice, the price of Note is determinted from the gUSDC/Note pool.

### The process of obtaining Note is as follows:

- User (with a positive balance of the native token/erc-20s) enters into the LendingMarket
    - user calls Comptroller.enterMarkets(address of cToken) (where Token is the asset the user wishes to use as collateral)[if the cToken contract has not been deployed, a governance proposal must be passed to support it]. The user then calls [cToken.mint](http://cToken.mint)(amtTokens) and receives amtTokens/exRate of cTokens.
    - The Comptroller’s stored accountLiquidity for user is positive, the user may now BorrowNote from the CNote lending market, using the Token it supplied to the market as collateral.

### Call Delegation Between CErc20Delegator and CNote

Depending on the version of CNote used in the protocol, an address to the CNote implementation is passed to a CErc20Delegator. As such, the method of the CNote contract are called as follows, 

```solidity
function delegateTo(address callee, bytes memory data) internal returns (bytes memory) {
        (bool success, bytes memory returnData) = callee.delegatecall(data);
        assembly {
            if eq(success, 0) {
                revert(add(returnData, 0x20), returndatasize())
            }
        }
        return returnData;
    }
```

in other words, all contracts that require a reference to the cNote contract would receive a reference to the CErc20Delegator pointing to the current CNote implementation. Please note, the storage of the CNote contract remains uninitialized, apart from the specific references to the Accountant, all other storage (borrowBalances, exchangeRate etc.) is located at the CErc20Delegator pointing to CNote.

### How CNote differs from general CErc20s

Each CErc20 contract represents a pool of CErc20 [tokens.](http://tokens.One) Supplying the CErc20 contract with amtTokens of the token desired is as follows (see CToken.sol#mintFresh for the implementation)

- User calls mint(amtTokens) on the CErc20Delegator, (it is assumed that `Token.allowance(address(CErc20Delegator)) ≥ amtTokens)`
- Control is given to the current implementation of the cErc20 contract `delegatecall(address(cErc20), abi.encodePacked(”mint(uint256)”), amtTokens);`
- the cErc20Delegator then calls doTransferIn
    - This transfers amtTokens from the user to the CErc20 contract.
- Finally, the user receives amtTokens/exRate cTokens, these are redeemable for the amtTokens + interestAccrued Tokens.

CNote’s functionality only differs in the doTransferOut method (see CNote.sol#doTransferIn)

```solidity
function doTransferIn(address from, uint amount) virtual override internal returns (uint) {
        require(address(_accountant) != address(0)); //check that the accountant has been set
        
        EIP20Interface token = EIP20Interface(underlying);
        token.transferFrom(from, address(this), amount); //allowance set before
		    
				//check that transfer is successful or revert otherwise
				
        uint balanceAfter = token.balanceOf(address(this)); // Calculate the amount that was *actually* transferred

        if (from != address(_accountant)) {
            uint err = _accountant.redeemMarket(balanceAfter); //Whatever is transferred into cNote is then redeemed by the accountant
            if (err !=0) {
                revert AccountantSupplyError(balanceAfter);
            }
            uint balanceCur = token.balanceOf(address(this));

            require(balanceCur == 0, "Accountant has not been correctly supplied");
        }

        return balanceAfter;   // underflow already checked above, just subtract
    }
```

As one can see, the tokens are transferred into the CNote contract, however, they are immediately redeemed by the Accountant, this mechanism will be elaborated in the Accountant section. The mechanism for doTransferOut works similarly (see CNote.sol#doTransferOut)

```solidity
function doTransferOut(address payable to, uint amount) virtual override internal {
        require(address(_accountant) != address(0)); //check that the accountant has been set
        EIP20Interface token = EIP20Interface(underlying);
			
        if (to != address(_accountant)) {
            uint err = _accountant.supplyMarket(amount); //Accountant redeems requisite cNote to supply this market
            if (err != 0) {
                revert AccountantRedeemError(amount);
            }
        }   

        token.transfer(to, amount);
				//check that the transfer is successful
				
        require(success, "TOKEN_TRANSFER_OUT_FAILED");
        require(token.balanceOf(address(this)) == 0, "cNote::doTransferOut: TransferOut Failed");
    }
```

Similarly for doTransferOut, the Accountant supplies the required amount of Note to the CNote market (receiving cNote in return). The Note supplied by the accountant is then sent to the to address. 

Because the Accountant itself is a participant in the cNote lending market, when the Accountant redeems or supplies cNote/Note to the contract the Note should be transferred from the contract to the Accountant, and the Note supplied from the Accountant must not be sent back to the Accountant, as such, the to address is always checked during the transferIn. 

### Interacting with the Protocol

- one may deploy the contracts over a standard hardhat node via
    - Please ensure that your node version is 14.0.0
    
    ```solidity
    npx hardhat deploy --network (network defined in harhatconfig)
    ```
    
- we use hardhat-deploy extensively, obtaining an ethers.Contract object from this deployment is as follows

```solidity
import {ethers, deployments} from "hardhat";
let contract = await ethers.getContract("CONTRACT_NAME");
//the method below is how one obtains a proxy contract that references a desired implementation
let contract2 = new ethers.Contract(
	(await deployments.get("CONTRACT_NAME(DELEGATOR CONTRACT)").address
	(await deployments.get("CONTRACT_NAME(DELEGATE")).abi,
	ethers_signer_object
); 
```

### Concerns

- Re-entrantAttacks
    - doTransferIn/Out in CNote
    - calls between CErc20Delegator/CNote

# Note/Accountant

The stable coin of the ecosystem Note is implemented as a standard ERC-20 token smart contract which has it’s full supply minted to another smart contract Accountant.sol. The only way to create new Note is to borrow it directly from the cNote lending market in the same way any other asset is borrowed. The noteInterestRateModel is a new model that has Supply Rate and Borrow Rate set to the same value. 

Since Note cannot be created, only borrowed, and the Supply Rate is the same as the Borrow Rate we needed to create a mechanism to keep track of how much of the interest paid by the market to borrow Note goes to the Accountant and eventually gets swept into the Treasury vs how much is paid to external suppliers. This is done by supplying and redeeming liquidity during every action taken by an external user of cNote. When users borrow Note or redeem cNote, the function in CNote will call another function in the Accountant to supply cNote in the exact amount required to offset the request. When Users supply or repay Note to the market, the function in CNote will call another function in Accountant to redeem exactly the same amount of Note from the market. This results in there never being any Note present in the CNote market other than during function calls, while also providing an infinite amount of Note to be borrowed or redeemed from the Market.

Any Note circulating in the market is borrowed from the Accountant, as such, in CNote.sol#doTransferIn the Note transferred into the CNote Note pool is redeemed by the Accountant as follows, (AccountantDelegate.sol#redeemMarket)

```solidity
function redeemMarket(uint amount) external override returns(uint) {
		if (msg.sender != address(cnote)) {
			revert SenderNotCNote(address(cnote));
		}
		emit AcctRedeemed(amount);
		return cnote.redeemUnderlying(amount); // redeem the amount of Note calculated via current CNote -> Note exchange rate
    }
```

A similar process is followed when a user borrows Note from the CNote contract. When a user wishes to borrow amount Note, the Accountant supplies the amount to the CNote contract, and receives the requisite amount of cNote in return. (see AccountantDelegate.sol#supplyMarket)

```solidity
function supplyMarket(uint amount) external override returns(uint) {
		if (msg.sender != address(cnote)) {
			revert SenderNotCNote(address(cnote));
		}
		uint err =  cnote.mint(amount);
		emit AcctSupplied(amount, uint(err));
		return err;
}
```

As the Accountant only supplies Note, its balance is always inflating, to account for this inflation, the Accountant sweeps the interest earned from the Note it supplies to the market, as follows, 

(see AccountantDelegate.sol#sweepInterest)

```solidity
function sweepInterest() external override {
		if (msg.sender != admin ) {
			revert SenderNotAdmin(msg.sender);
		}
		//Total balance of Treasury => Note + CNote Balance, 
		Exp memory exRate = Exp({mantissa: cnote.exchangeRateStored()}); //used stored interest rates in determining amount to sweep
		
		//underflow impossible
		uint noteDiff = sub_(note.totalSupply(), note.balanceOf(address(this))); //Note deficit in Accountant
		uint cNoteBal = cnote.balanceOf(address(this)); //current cNote Balance
		uint cNoteAmt = mul_(cNoteBal, exRate); // cNote Balance converted to Note

		require(cNoteAmt >= noteDiff, "AccountantDelegate::sweepInterest:Error calculating interest to sweep");

		uint amtToSweep = sub_(cNoteAmt, noteDiff); // amount to sweep in Note, 
		uint cNoteToSweep = div_(amtToSweep, exRate); // amount of cNote to sweep = amtToSweep(Note) / exRate

		cNoteToSweep = (cNoteToSweep > cNoteBal) ? cNoteBal :  cNoteToSweep; 
		bool success = cnote.transfer(treasury, amtToSweep);
		if (!success) {
			revert  SweepError(treasury , amtToSweep); //handles if transfer of tokens is not successful
		}

		TreasuryInterface Treas = TreasuryInterface(treasury);
		Treas.redeem(address(cnote),amtToSweep);

		require(cnote.balanceOf(treasury) == 0, "AccountantDelegate::sweepInterestError");
	}
```

The method calculates the correct amount of its balance of CNote to send to the treasury, the treasury then immediately redeems this cNote via (see TreasuryDelegator.sol#redeem)

```solidity
function redeem(address cNote, uint cTokens) external override {
        if (cNote == address(0)) {
            revert InvalidAddress();
        }
        CErc20Interface cnote = CErc20Interface(cNote); //initialize cNote
        uint err = cnote.redeem(cTokens); //
        if (err != 0) {
            revert SendFundError(cTokens);
        }
    }
```

The Treasury redeems all of the cNote it has received from the Accountant, and receives the requisite amount of Note from the market. This permits the Accountant to retain its balance of cNote so that when users mint or repayBorrow, the Accountant will be able to reclaim the Note it had previously lent to the market.

# Treasury

The Treasury is essentially a community pool of the network Token and the Note that the Accountant sweeps into it. It’s primary function is to store these tokens until a user passes a governance proposal to request funds from the TreasuryDelegate, (see TreasuryDelegate.sol#sendFund) 

```solidity
function sendFund(address recipient, uint amount, string calldata denom) external override {
        if (msg.sender != admin ) {
            revert SenderNotAdmin(msg.sender);
        }
        bool success;

        bytes32 encodeDenom = keccak256(bytes(denom));
        //sending CANTO
        if (encodeDenom == cantoDenom) {
            if (address(this).balance < amount) {
                revert InsufficientFunds(address(this).balance, amount);
            }
            (success, ) = recipient.call{value: amount}(""); //use call instead of transfer
        } 
        // sending NOTE
        else if (encodeDenom == noteDenom) {
            uint bal = note.balanceOf(address(this));
            if (bal < amount) {
                revert InsufficientFunds(bal, amount);
            } 
            note.transfer(recipient, amount);
            assembly {
                switch returndatasize()
                case 0 {success := not(0)}
                case 32 {
                    returndatacopy(0,0,32)
                    success := mload(0) //retrieve boolean return value from ERC20 transfer
                }
                default {
                    revert(0,0)
                }
            }
        }
        if (!success) {
            revert SendFundError(amount);
        }
    }
```

# LP Oracle

The standard DEX (both stable pairs and volatile pairs) is Stableswap. The Router implements the priceOracle interface defined in the LendingMarket. As such, for any price determinations, the Comptroller delegates requests to (BaseV1Core.sol#getUnderlyingPrice), a method on the stableSwap Router. (Code displayed below).

```solidity
//returns the underlying price of the assets as a mantissa (scaled by 1e18)
    function getUnderlyingPrice(CToken ctoken) external override view returns(uint price) {
        IBaseV1Pair pair;
        uint8 stable;
        bool stablePair;
        address underlying;

        if (compareStrings(ctoken.symbol(), "cCANTO")) {
            stable = 0;
            underlying = address(wcanto);
        } 
        //set price statically to 1 when the Comptroller is retrieving Price
        else if (compareStrings(ctoken.symbol(), "cNOTE") && msg.sender == Comptroller) {
            return 1; // Note price is fixed to 1
        }

        else {
            stable = ctoken.stable();
            underlying = address(ICErc20(address(ctoken)).underlying());
        }

        if (stable >= 2) { // this is an LP Token
            IBaseV1Pair pair1;
            IBaseV1Pair pair2;
            //instantiate pair and check whether or not it is stable
            pair  = IBaseV1Pair(underlying);
            stablePair = pair.stable();

            //instantiate the addresses of the tokens
            address token0 = pair.token0();
            address token1 = pair.token1();
            //determine which pairs are being referenced
            (bool stable0, bool stable1) = _returnStableBooleans(stable);
            //get prices of individual assets
            uint price0 = (token0 != USDC) ? IBaseV1Pair(pairFor(USDC, token0, stable0)).quote(token0, 1, 8) : 1;
            uint price1 = (token1 != USDC) ? IBaseV1Pair(pairFor(USDC, token1, stable1)).quote(token1, 1, 8) : 1;
            // how much of each asset is 1 LP token redeemable for
            (uint amt0, uint amt1) = quoteRemoveLiquidity(token0, token1, stablePair, 1);
            console.log("amt0: ", amt0, "amt1: ", amt1);
            price = amt0 * price0 + amt1 * price1;
        }
        // this is not an LP Token
        else {
            stablePair = (stable == 0) ? false : true;
            pair = IBaseV1Pair(pairFor(USDC, underlying, stablePair)); //get the pair for the USDC/underlying pool
            price = pair.quote(underlying, 1, 8); //how much USDC is this token redeemable for
        }
        console.log("price: ", price);
        return price * 1e18;
    }
```

# Oracle Functionality

- The getUnderlyingPrice method of the BaseV1Router01 receives a cToken as a parameter, and returns the TWAP (time-weighted average price) of the cToken’s underlying asset.
    - The price of the underlying asset is determined from the reserves of the USDC/Underlying pair.
    - The PriceOracle is able to retrieve the price of LPTokens minted from any arbitrary pair, this is determined as follows:
        - Each cToken is instantiated with a uint8 stable, The stable/volatility of the underlying assets is determined as follows:
            - 0: volatile, 1: stable, 2: LP, stable, vol, 3: LP, vol, stable, 4: vol, vol, 5: LP, stable, stable
        - The Price of an LPtoken from the (Asset1/Asset2) pool is then determined like so
            - Suppose 1LPToken is redeemable for amt1 of Asset1 and amt2 of Asset2, and the price of Asset1 (determined from the USDC/Asset1 pool) is price1, price2 is denoted similarly, then the price of the LPToken is determined accordingly
    
    ```solidity
    price  = amt1 * price1 + amt2 * price2
    ```
    
    Users are able to create markets for their LPTokens, supplying and borrowing of these tokens corresponds to higher rewards than are given from participating in non-LPMarkets.

### Comptroller Modifications
- Modified the grantCompInternal function to enable the transfer of any EIP20-Interface Token and removed reference to Comp() object.

## Testing
A full suite of unit tests using hardhat and saddle are provided for the lending Market.

### Saddle
- Ensure that node version 12 is being used, and yarn(npm) install
- Ensure that the solc 0.8.10 compiler is being natively used,
    - wget [https://github.com/ethereum/solidity/releases/download/v0.8.10/solc-static-linux](https://github.com/ethereum/solidity/releases/download/v0.8.10/solc-static-linux) -O /bin/solc && chmod +x /bin/solc
- npx saddle compile && npx saddle test

### Hardhat
- Ensure that node version 16 is being used,
- yarn/npm install
- npx hardhat test ./tests/Treasury/canto/….test.ts

### Deploy Scripts:
- Detailed deployment scripts may be found in the lending-market/deploy/ 
- These deployment scripts may be deployed via editing the hardhat.config.ts config file
- You may edit these contracts, or use the scripts we have defined
    - npx hardhat deploy —network …
