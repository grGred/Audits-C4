C4 finding submitted: (risk = QA (Quality Assurance))
 Wallet address: 0x021DbDC025001BC8c95cf60b3E601fec2A13f312

 Non critical:

1) Use `type(uint256).max)` instead of `2**256 - 1`
I suggest using `type(uint256).max)` instead of `2**256 - 1` in order to improve code readability.

Line References:
https://github.com/code-423n4/2022-06-illuminate/blob/main/lender/Lender.sol#L84
https://github.com/code-423n4/2022-06-illuminate/blob/main/lender/Lender.sol#L112

2) Change description of return in comment
Functions can't return false, they will always return true. If the transaction reverts - false wouldn't be returned.
As a proof you can check comments of your ERC20 contract:
https://github.com/code-423n4/2022-06-illuminate/blob/main/marketplace/ERC20.sol#L13

```
* We have followed general OpenZeppelin guidelines: functions revert instead
* of returning `false` on failure. This behavior is nonetheless conventional
* and does not conflict with the expectations of ERC20 applications.
```

I suggest changing:
```/// @return bool true if the address was set, false otherwise```
to just:
```/// @return bool true if the address was set```

Line References:
https://github.com/code-423n4/2022-06-illuminate/blob/main/lender/Lender.sol#L77
https://github.com/code-423n4/2022-06-illuminate/blob/main/lender/Lender.sol#L144
https://github.com/code-423n4/2022-06-illuminate/blob/main/lender/Lender.sol#L166
https://github.com/code-423n4/2022-06-illuminate/blob/main/redeemer/Redeemer.sol#L69
https://github.com/code-423n4/2022-06-illuminate/blob/main/redeemer/Redeemer.sol#L80

C4 finding submitted: (risk = G (Gas Optimization))
Wallet address: 0x021DbDC025001BC8c95cf60b3E601fec2A13f312

1) Change `constant` to `immutable`
Use of constant keccak variables results in extra hashing (and so gas). This results in the keccak operation being performed whenever the variable is used, increasing gas costs relative to just storing the output hash. Changing to immutable will only perform hashing on contract deployment which will save gas. You should use immutables until the referenced issues are implemented, then you only pay the gas costs for the computation at deploy time.

Example:

  uint256 immutable immutableUint;
  uint256 constant CONST_UINT = 999999999999999999999999999999;

  constructor(){
      immutableUint = 999999999999999999999999999999;
  }

  function retrieveUintConst() external view returns (uint256){
      return CONST_UINT; // 21244 gas
  }

  function retrieveUintImmutable() external view returns (uint256){
      return immutableUint; // 21211 gas
  }
As you can see on the compiler version 0.8.15 and with optimizator on 200 runs immutables are cheaper, and saves you about 30 gas.

See: [(ethereum/solidity#9232 (comment))](https://github.com/ethereum/solidity/issues/9232#issuecomment-646131646)

Line References:
https://github.com/code-423n4/2022-06-illuminate/blob/main/lender/Lender.sol#L23

2) ++i costs less gas compared to `i++` or `i += 1`
`++i` costs less gas compared to `i++` or `i += 1` for unsigned integer, as pre-increment is cheaper (about 5 gas per iteration). This statement is true even with the optimizer enabled.

Example: `i++` increments i and returns the initial value of i. Which means:
```
uint i = 1;
i++; // == 1 but i == 2
```
But `++i` returns the actual incremented value:
```
uint i = 1;
++i; // == 2 and i == 2 too, so no need for a temporary variable
```
In the first case, the compiler has to create a temporary variable (when used) for returning 1 instead of 2

Line References:
https://github.com/code-423n4/2022-06-illuminate/blob/main/lender/Lender.sol#L96
https://github.com/code-423n4/2022-06-illuminate/blob/main/lender/Lender.sol#L120
https://github.com/code-423n4/2022-06-illuminate/blob/main/lender/Lender.sol#L289
https://github.com/code-423n4/2022-06-illuminate/blob/main/marketplace/ERC20Permit.sol#L64

3) Type conversion `uint256` to `uint8` costs addiional gas

Example `0.8.13` with optimizator enabled on 200:
```

contract Approves {

  uint public gas;

  function approve1(address token) external returns (bool) {
      gas = gasleft();
      // max is the maximum integer value for a 256 unsighed integer
      uint256 max = 2**256 - 1;

      // approve the underlying for max per given principal
      for (uint8 i; i < 9; ) { // 73370
          // check that the token is defined for this particular market
          if (token != address(0)) {
              // max approve the token
              Safe.approve(IERC20(token), address(this), max);
          }
          unchecked {
              ++i;
          }
      }
      gas -= gasleft(); // 73370 gas (from 0 to max)
      return true;
  }

  function approve2(address token) external returns (bool) {
      gas = gasleft();
      // max is the maximum integer value for a 256 unsighed integer
      uint256 max = 2**256 - 1;

      // approve the underlying for max per given principal
      for (uint256 i; i < 9; ) {
          // check that the token is defined for this particular market
          if (token != address(0)) {
              // max approve the token
              Safe.approve(IERC20(token), address(this), max);
          }
          unchecked {
              ++i;
          }
      }
      gas -= gasleft(); // 73310 gas (from 0 to max)
      return true;
  }
}
```
In this case it's not needed to make additional type conversion. It will save additional 60 gas.

Line References:
https://github.com/code-423n4/2022-06-illuminate/blob/main/lender/Lender.sol#L87

4) Use `calldata` instead of `memory` for function parameters
In some cases, having function arguments in `calldata` instead of `memory` is more optimal. When arguments are read-only on external functions, the data location should be `calldata`.

Example:
```
contract C {
  function add(uint[] memory arr) external returns (uint sum) {
      uint length = arr.length;
      for (uint i = 0; i < arr.length;) {
          sum += arr[i];
          unchecked { ++i; }
      }
  }
}
```
In the above example, the dynamic array arr has the storage location `memory`. When the function gets called externally, the array values are kept in `calldata` and copied to `memory` during ABI decoding (using the opcode `calldataload` and `mstore`). And during the for loop, `arr[i]` accesses the value in `memory` using a `mload`. However, for the above example this is inefficient. Consider the following snippet instead:
```
contract C {
  function add(uint[] calldata arr) external returns (uint sum) {
      uint length = arr.length;
      for (uint i = 0; i < arr.length;) {
          sum += arr[i];
          unchecked { ++i; }
      }
  }
}
```
In the above snippet, instead of going via `memory`, the value is directly read from `calldata` using `calldataload`. That is, there are no intermediate `memory` operations that carries this value.

Gas savings: In the former example, the ABI decoding begins with copying value from `calldata` to `memory` in a for loop. Each iteration would cost at least 60 gas. In the latter example, this can be completely avoided. This will also reduce the number of instructions and therefore reduces the deploy time cost of the contract.

Line References:
https://github.com/code-423n4/2022-06-illuminate/blob/main/lender/Lender.sol#L251
https://github.com/code-423n4/2022-06-illuminate/blob/main/marketplace/MarketPlace.sol#L70