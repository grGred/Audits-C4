pragma solidity ^0.8.10;

import "./CErc20Delegate.sol";
import "./Accountant/AccountantInterfaces.sol";
import "./Treasury/TreasuryInterfaces.sol";
import "./ErrorReporter.sol";

contract CNote is CErc20Delegate {

    event AccountantSet(address accountant, address accountantPrior);
    error FailedTransfer(uint amount);


    AccountantInterface public _accountant; // accountant private _accountant = Accountant(address(0));
    
    function setAccountantContract(address accountant_) public {
        require(msg.sender == admin, "CNote::_setAccountantContract:Only admin may call this function"); // @audit-gas > 32 bytes error message
        
        emit AccountantSet(accountant_, address(_accountant));
	    _accountant = AccountantInterface(accountant_);
    }

    /** 
    * @dev return the current address of the Accounant
     */
    function getAccountant() external view returns(address) {
        return address(_accountant);
    }

    /** 
     * @dev getCashPrior retrieves balance of the accountant (not cNote contract)  
     */
    function getCashPrior() virtual override internal view returns(uint) {
        EIP20Interface token = EIP20Interface(underlying);
        return token.balanceOf(address(_accountant));
    }


    /**
     * @notice Calculates the exchange rate from Note to cNote
     * @dev This function does not accrue efore calculating the exchange rate
     * @return calculated exchange rate scaled by 1e18
     */
    function exchangeRateStoredInternal() virtual override internal view returns (uint) {
        uint _totalSupply = totalSupply;
        if (_totalSupply == 0) {
            /*
             * If there are no tokens minted:
             *  exchangeRate = initialExchangeRate
             */
            return initialExchangeRateMantissa;
        } else {
            /*
             * Otherwise:
             *  exchangeRate = (totalCash + totalBorrows - totalReserves) / totalSupply
             */
            uint cashPlusBorrowsMinusReserves = totalBorrows - totalReserves;// totalCash in cNote Lending Market is zero, thus it is not factored into the exchangeRate // @audit-non add space to improve code quality
            uint exchangeRate = cashPlusBorrowsMinusReserves * expScale / _totalSupply;

            return exchangeRate;
        }
    }

    /**
     * @dev Similar to EIP20 transfer, except it handles a False result from `transferFrom` and reverts in that case.
     *      This will revert due to insufficient balance or insufficient allowance.
     *      This function returns the actual amount received,
     *      which may be less than `amount` if there is a fee attached to the transfer.
     *
     *      Note: This wrapper safely handles non-standard ERC-20 tokens that do not return a value.
     *            See here: https://medium.com/coinmonks/missing-return-value-bug-at-least-130-tokens-affected-d67bf08521ca
     */
    function doTransferIn(address from, uint amount) virtual override internal returns (uint) {
        require(address(_accountant) != address(0)); //check that the accountant has been set

        EIP20Interface token = EIP20Interface(underlying);
        token.transferFrom(from, address(this), amount); //allowance set before

        //revert if transfer fails
        bool success;
        assembly {
            switch returndatasize()
                case 0 {                       // This is a non-standard ERC-20
                    success := not(0)          // set success to true
                }
                case 32 {                      // This is a compliant ERC-20
                    returndatacopy(0, 0, 32)
                    success := mload(0)        // Set `success = returndata` of override external call
                }
                default {                      // This is an excessively non-compliant ERC-20, revert.
                    revert(0, 0)
                }
        }
        require(success, "TOKEN_TRANSFER_IN_FAILED");

        uint balanceAfter = token.balanceOf(address(this)); // Calculate the amount that was *actually* transferred

        if (from != address(_accountant)) {
            uint err = _accountant.redeemMarket(balanceAfter); //Whatever is transferred into cNote is then redeemed by the accountant  // @audit-non add extra space
            if (err !=0) { // @audit-non add extra space
                revert AccountantSupplyError(balanceAfter);
            }
            uint balanceCur = token.balanceOf(address(this));

            require(balanceCur == 0, "Accountant has not been correctly supplied"); // @audit-gas > 32 bytes error message
        }
        
        return balanceAfter;   // underflow already checked above, just subtract
    }

    /**
     * @dev Similar to EIP20 transfer, except it handles a False success from `transfer` and returns an explanatory
     *      error code rather than reverting. If caller has not called checked protocol's balance, this may revert due to
     *      insufficient cash held in this contract. If caller has checked protocol's balance prior to this call, and verified
     *      it is >= amount, this should not revert in normal conditions.
     *
     *      Note: This wrapper safely handles non-standard ERC-20 tokens that do not return a value.
     *            See here: https://medium.com/coinmonks/missing-return-value-bug-at-least-130-tokens-affected-d67bf08521ca
     */
    function doTransferOut(address payable to, uint amount) virtual override internal {
        require(address(_accountant) != address(0)); //check that the accountant has been set  // @audit-non add extra space
        EIP20Interface token = EIP20Interface(underlying);

        if (to != address(_accountant)) {
            uint err = _accountant.supplyMarket(amount); //Accountant redeems requisite cNote to supply this market  // @audit-non add extra space
            if (err != 0) {
                revert AccountantRedeemError(amount);
            }
        }   

        token.transfer(to, amount);

        bool success;
        assembly {
            switch returndatasize()
                case 0 {                      // This is a non-standard ERC-20
                    success := not(0)          // set success to true
                }
                case 32 {                     // This is a compliant ERC-20
                    returndatacopy(0, 0, 32)
                    success := mload(0)        // Set `success = returndata` of override external call
                }
                default {                     // This is an excessively non-compliant ERC-20, revert.
                    revert(0, 0)
                }
        } 
        require(success, "TOKEN_TRANSFER_OUT_FAILED");
        require(token.balanceOf(address(this)) == 0, "cNote::doTransferOut: TransferOut Failed");
    }

    /*** Reentrancy Guard ***/
    /**
     * @dev Prevents a contract from calling itself, directly or indirectly.
     */
    modifier nonReentrant() override {
        if (msg.sender != address(_accountant)) {
            require(_notEntered, "re-entered");
        }
        _notEntered = false;
        _;
        _notEntered = true; // get a gas-refund post-Istanbul
    }
}