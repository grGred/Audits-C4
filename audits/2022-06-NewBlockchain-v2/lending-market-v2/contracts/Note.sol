pragma solidity ^0.8.10;

import "./ERC20.sol";

contract Note is ERC20 {
    address public accountant;
    address public admin;

    constructor() ERC20("Note", "NOTE", 0) {
        admin = msg.sender;
    }

    function _mint_to_Accountant(address accountantDelegator) internal {
        _mint(accountantDelegator, type(uint).max);
    }

    function RetAccountant() public view returns(address) {
	    return accountant;
    }
    
    function _setAccountantAddress(address accountant_) external {
        require(msg.sender == admin);
        require(address(accountant) == address(0)); // @audit-gas no need to do type conversion since an accountant is already an address
        accountant = accountant_;
        if (balanceOf(accountant) != type(uint).max) {
            _mint_to_Accountant(accountant);
            admin = accountant;
        }
    }
}
