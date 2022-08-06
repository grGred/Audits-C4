# Audit
This was my first submissions, don't judge strictly

Contest update:

https://github.com/code-423n4/code423n4.com/pull/3192/commits/b27aa168626a0b4c7b99d12d9d2378d1d06073bc

**Gas Optimization**

1) Change `constant` to `immutable`
Use of constant keccak variables results in extra hashing (and so gas). This results in the keccak operation being performed whenever the variable is used, increasing gas costs relative to just storing the output hash. Changing to immutable will only perform hashing on contract deployment which will save gas. You should use immutables until the referenced issues are implemented, then you only pay the gas costs for the computation at deploy time.

Example:
```Solidity

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
  ```
As you can see on the compiler version 0.8.15 and with optimizator on 200 runs immutables are cheaper, and saves you about 30 gas.

See: [(ethereum/solidity#9232 (comment))](https://github.com/ethereum/solidity/issues/9232#issuecomment-646131646)

Line References:

https://github.com/code-423n4/2022-06-illuminate/blob/main/lender/Lender.sol#L23

2) ++i costs less gas compared to `i++` or `i += 1`
`++i` costs less gas compared to `i++` or `i += 1` for unsigned integer, as pre-increment is cheaper (about 5 gas per iteration). This statement is true even with the optimizer enabled.

Example: `i++` increments i and returns the initial value of i. Which means:
```Solidity
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
```Solidity

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
```Solidity
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
```Solidity
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

**QA (Quality Assurance)**

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


# Illuminate contest details
- $50,000 USDC main award pot
- $5,000 USDC gas optimization award pot
- Join [C4 Discord](https://discord.gg/EY5dvm3evD) to register
- Submit findings [using the C4 form](https://code4rena.com/contests/2022-06-illuminate-contest/submit) -- Update link
- [Read our guidelines for more details](https://docs.code4rena.com/roles/wardens)
- Starts June 21, 2022 20:00 UTC
- Ends June 26, 2022 19:59 UTC

| **Contracts**    | **Link** | **LOC** | **LIBS** | **External** |
|--------------|------|------|------|------|
| Marketplace |[Link](https://github.com/code-423n4/2022-06-illuminate/blob/main/marketplace/MarketPlace.sol)| 253 | [Safe.sol](https://github.com/code-423n4/2022-06-illuminate/blob/main/marketplace/Safe.sol) | [External.md](https://github.com/code-423n4/2022-06-illuminate/blob/main/external.md) |
| Lender |[Link](https://github.com/code-423n4/2022-06-illuminate/blob/main/lender/Lender.sol)| 738 | [Safe.sol](https://github.com/code-423n4/2022-06-illuminate/blob/main/lender/Safe.sol) | [External.md](https://github.com/code-423n4/2022-06-illuminate/blob/main/external.md)
| Redeemer |[Link](https://github.com/code-423n4/2022-06-illuminate/blob/main/redeemer/Redeemer.sol)| 306 | [Safe.sol](https://github.com/code-423n4/2022-06-illuminate/blob/main/redeemer/Safe.sol) | [External.md](https://github.com/code-423n4/2022-06-illuminate/blob/main/external.md) |


# Introduction
Illuminate is a fixed-rate lending protocol designed to aggregate other fixed-rate protocols' guaranteed yields (in the form of principal tokens), providing Illuminate's users a loose guarantee of the best rate, and deepening liquidity across the fixed-rate space.

Most simply described, Illuminate aggregates and wraps principal tokens with similar maturities and underlying assets into one single (meta) principal token (iPT).

A front-end interface provides an aggregated _best rate_ by purchasing and wrapping external tokens.

While the wrapped / meta principal token (iPT) is traded on a secondary market through a YieldSpace AMM (out of scope for this audit) providing an on-chain guarantee of the _best rate_. 

As arbitrageurs can easily purchase external PTs -> mint & sell iPTs, variance in external principal token prices is reduced, while a secondary market for iPTs can be confident it provides the best rate and depth.

## Main Participant Interactions

**On-Chain lenders:** Purchase iPTs through Marketplace.sol which serves as a router for a secondary market's YieldSpace AMM.

**Off-Chain lenders:** `lend` on Lender.sol, with the assumption an off-chain interface can identify which principal token to directly purchase and then input the correct parameters.

**Arbitrageurs:** Purchase external principal tokens, `mint` iPTs on Lender.sol, and then sell iPTs through the Marketplace.sol which acts as a router.

**Redemption:** 

iPT redemption itself is straightforward as users redeem 1 iPT for 1 underlying token upon maturity.

This first requires the redemption of any externally wrapped PTs that Lender.sol may hold. These external PT `redeem` methods are public, however it is expected that the admins will likely execute these leaving the users solely responsible for redeeming their iPTs.

iPTs can be redeemed either with a `redeem` method on Redeemer.sol, or through the authorized iPT [EIP-5095](https://github.com/ethereum/EIPs/pull/5095) `redeem` method.

**Admins:**
- Set up contracts
- Create markets
- Retain emergency withdraw privileges (72 hr delay)
- Set fees

-----------------------------------

## Links:

General Project Docs: https://docs.illuminate.finance

Contract Docs: https://docs.illuminate.finance/smart-contracts

-----------------------------------

## Important Note:

When it comes to input sanitization, we err on the side of having external interfaces validate their input, rather than socializing costs to do checks such as:
- Checking for address(0)
- Checking for input amounts of 0
- Checking to ensure the protocol enum matches the parameters provided
- Any similar input sanitization

-----------------------------------

## Other Information / Interaction Paths 

#### Setting Up Markets
A market, defined by an underlying asset (`address`) and a maturity (`uint256`) is created by the admin via the MarketPlace contract. 

After deploying a market there are a number of necessary approvals:
- Lender.sol approves all external protocols to take underlying.
- Lender.sol approves Aave to take underlying (for APWine's deposits)
- Lender.sol approves Redeemer.sol to take all external principal tokens.

#### Redemption Specifics
As external principal tokens mature, the admin (or others) `redeem` the principal tokens using `Redeemer.sol`.

`redeem` methods transfer held PTs from `Lender.sol` to `Redeemer.sol` and then operate the appropriate external redemption methods. Should the iPT mature _after_ all external PTs mature, each iPT will then have equivalent backing of underlying tokens.

As the iPT then matures, lenders can redeem their capital with a `redeem` method on Redeemer.sol, or through the authorized iPT [EIP-5095](https://github.com/ethereum/EIPs/pull/5095) `redeem` method.

-----------------------------------

# Contract Descriptions / Areas of Concern

## **Lender:**

`Lender.sol` facilitates all lending and minting via an overloaded `lend` method and generic `mint` method. Off-chain interfaces identify an external principal token to purchase/wrap and then provide corresponding parameters to the `lend` method. 

When `lend` is called, underlying assets are transferred to `Lender.sol`. From there, `Lender.sol` purchases an external protocol's principal tokens and mints the user (msg.sender) an equivalent amount of wrapped/meta principal tokens (iPTs).

The admin is given privilages to pause specific external principal token wrapping. This may be important in the event of external protocol insolvency or bugs. In addition, the admin is able to able to withdraw fees.

### Areas of Concern

- The admin must not be able to withdraw more fees than what he is entitled to and fee calculation is correct
- There are no ways to abuse the parameters for external contracts or pools, mismatching and allowing the wrapping of either:
        - An external PT with a maturity > that of the iPT
        - An external PT with a different underlying than that of the iPT
- There are no adverse effects from calling the wrong principal for a given `lend` function to other users.
- The approval process is sound. Once `createMarket` is executed, users are not able to mint meta-principal tokens until `approve` has approved the Lender for all principal tokens in that market.
-----------------------------------

## **Marketplace:**

`Marketplace.sol` acts as the central hub for creating new `markets` (defined as an asset-matury pair), and the initial contract creation for iPTs which conform to the ERC5095 interface. The `markets` mapping is stored and admins are the only ones that can create markets.

In addition, `MarketPlace.sol` acts as a "Router" contract for our YieldSpace markets and the secondary market purchase/sale of iPTs. The router simply tracks live pools alongside their underlying <-> maturity via the `pools` mapping that can only be changed by the admin.

### Areas of Concern

- Users are able to swap between their meta-principal tokens and the underlying using YieldSpace pools.
- There are no oversights in the creation of new markets

-----------------------------------

## **Redeemer:**

Redemption can generally be split into two categories, the redemption of external principal tokens currently held on `Lender.sol`, and then the redemption of underlying tokens to those holding currently matured iPTs. Both of these redemptions are covered under various overloaded `redeem` methods.

As external principal tokens mature, anyone can call the corresponding public `redeem` methods. This transfers external principal tokens from `Lender.sol` to `Redeemer.sol` at which point external principal tokens are redeemed with their corresponding protocol unique methods, and underlying tokens then sit in `Redeemer.sol`.

As iPTs mature, users can can call the corresponding public `redeem` method with an enum of 0 to then burn their iPT balance and claim a 1-1 amount of the underlying that sits in `Redeemer.sol`.

In order to comply with ERC-5095, we have also included an `authRedeem` method which can be called solely by the iPT itself, similarly burning and claiming underlying.

### Areas of Concern

- Ensure that something out-of-order would not enable a user to redeem more or less tokens than they are entitled to.
- The `authRedeem` methods could not be used to incorrectly redeem funds to another user or steal funds in some manner.
-----------------------------------
