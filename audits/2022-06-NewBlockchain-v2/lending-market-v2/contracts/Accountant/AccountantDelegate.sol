pragma solidity ^0.8.10;

import "./AccountantInterfaces.sol";
import "../ExponentialNoError.sol";
import "../ErrorReporter.sol";
import "../Treasury/TreasuryInterfaces.sol";
import "hardhat/console.sol"; // @audit-non remove hardhat/console.sol from imports

contract AccountantDelegate is AccountantInterface, ExponentialNoError, TokenErrorReporter, ComptrollerErrorReporter, AccountantErrors{
		
	/**
      * @notice Method used to initialize the contract during delegator contructor
      * @param cnoteAddress_ The address of the CNoteDelegator
	  * @param noteAddress_ The address of the note contract
	  * @param comptrollerAddress_ The address of the comptroller contract
      */
	function initialize( address treasury_, address cnoteAddress_, address noteAddress_, address comptrollerAddress_) external {
		//AccountantDelegate can only be initialized once
		if (msg.sender != admin) {
			revert SenderNotAdmin(msg.sender);
		}
		
		if(address(treasury) != address(0) || address(note) != address(0) || address(cnote) != address(0)) {
			revert AccountantInitializedAgain();
		}
		
		treasury = treasury_; // set the current treasury address (address of TreasuryDelegator)	
		address[] memory MarketEntered = new address[](1); // first entry into lending market
		MarketEntered[0] = cnoteAddress_;
		
		comptroller = ComptrollerInterface(comptrollerAddress_);
		note = Note(noteAddress_);
		cnote = CNote(cnoteAddress_);

		uint[] memory err = comptroller.enterMarkets(MarketEntered); // check if market entry returns without error
		if (err[0] != 0) {
			revert ErrorMarketEntering(err[0]);
		}
		emit AcctInit(cnoteAddress_);

		note.approve(cnoteAddress_, type(uint).max); // approve lending market, to transferFrom Accountant as needed
	}
    
	/**
	 * @notice Method to supply markets
	 * @param amount the amount to supply
	 * @return uint error code from CNote mint()
	 */
    function supplyMarket(uint amount) external override returns(uint) {
		if (msg.sender != address(cnote)) {
			revert SenderNotCNote(address(cnote));
		}
		uint err =  cnote.mint(amount);
		emit AcctSupplied(amount, uint(err));
		return err;
     }

    /**
	 * @notice Method to redeem account CNote from lending market 
	 * @param amount Amount to redeem (Note)
	 * @return uint Amount of cnote redeemed (amount * exchange rate)
	 */
    function redeemMarket(uint amount) external override returns(uint) {
		if (msg.sender != address(cnote)) {
			revert SenderNotCNote(address(cnote));
		}
		emit AcctRedeemed(amount);
		return cnote.redeemUnderlying(amount); // redeem the amount of Note calculated via current CNote -> Note exchange rate
    }


	/**
	 * @notice Method to sweep interest earned from accountant depositing note in lending market to the treasury
	 */
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
}
