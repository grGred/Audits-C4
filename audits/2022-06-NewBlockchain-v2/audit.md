### Consider having short revert strings
Consider the following require statement:

```
// condition is boolean
// str is a string
require(condition, str)
```
The string str is split into 32-byte sized chunks and then stored in `memory` using `mstore`, then the `memory` offsets are provided to `revert(offset, length)`. For chunks shorter than 32 bytes, and for low --optimize-runs value (usually even the default value of 200), instead of `push32` val, where val is the 32 byte hexadecimal representation of the string with 0 padding on the least significant bits, the solidity compiler replaces it by `shl(value, short-value))`. Where short-value does not have any 0 padding. This saves the total bytes in the deploy code and therefore saves deploy time cost, at the expense of extra 6 gas during runtime. This means that shorter revert strings saves deploy time costs of the contract. Note that this kind of saving is not relevant for high values of --optimize-runs as `push32` value will not be replaced by a `shl(..., ...)` equivalent by the Solidity compiler.

Going back, each 32 byte chunk of the string requires an extra `mstore`. That is, additional cost for `mstore`, `memory` expansion costs, as well as stack operations. Note that, this runtime cost is only relevant when the revert condition is met.

Overall, shorter revert strings can save deploy time as well as runtime costs.

Line references:

NoteInterest.sol
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/NoteInterest.sol#L167
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/NoteInterest.sol#L180
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/NoteInterest.sol#L193

CToken.sol
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/CToken.sol#L33
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/CToken.sol#L34
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/CToken.sol#L37
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/CToken.sol#L485
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/CToken.sol#L765

Comptroller.sol
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Comptroller.sol#L183
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Comptroller.sol#L1003
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Comptroller.sol#L1021
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Comptroller.sol#L1056
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Comptroller.sol#L1057
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Comptroller.sol#L1066
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Comptroller.sol#L1067
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Comptroller.sol#L1076
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Comptroller.sol#L1085
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Comptroller.sol#L1094
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Comptroller.sol#L1100
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Comptroller.sol#L1101
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Comptroller.sol#L1416
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Comptroller.sol#L1480

CNote.sol
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/CNote.sol#L17
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/CNote.sol#L105

TreasuryDelegator.sol
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Treasury/TreasuryDelegator.sol#L31
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Treasury/TreasuryDelegator.sol#L32
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Treasury/TreasuryDelegator.sol#L121

BaseV1-periphery.sol
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Stableswap/BaseV1-periphery.sol#L104
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Stableswap/BaseV1-periphery.sol#L122
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Stableswap/BaseV1-periphery.sol#L123
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Stableswap/BaseV1-periphery.sol#L241
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Stableswap/BaseV1-periphery.sol#L246
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Stableswap/BaseV1-periphery.sol#L398
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Stableswap/BaseV1-periphery.sol#L420
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Stableswap/BaseV1-periphery.sol#L435
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Stableswap/BaseV1-periphery.sol#L448
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Stableswap/BaseV1-periphery.sol#L470

GovernorBravoDelegate.sol
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Governance/GovernorBravoDelegate.sol#L25
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Governance/GovernorBravoDelegate.sol#L26
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Governance/GovernorBravoDelegate.sol#L27
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Governance/GovernorBravoDelegate.sol#L42
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Governance/GovernorBravoDelegate.sol#L46
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Governance/GovernorBravoDelegate.sol#L47
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Governance/GovernorBravoDelegate.sol#L76
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Governance/GovernorBravoDelegate.sol#L85
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Governance/GovernorBravoDelegate.sol#L128
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Governance/GovernorBravoDelegate.sol#L129
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Governance/GovernorBravoDelegate.sol#L140
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Governance/GovernorBravoDelegate.sol#L158

AccountantDelegate.sol
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Accountant/AccountantDelegate.sol#L87
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Accountant/AccountantDelegate.sol#L101

AccountantDelegator.sol
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Accountant/AccountantDelegator.sol#L42
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Accountant/AccountantDelegator.sol#L43
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Accountant/AccountantDelegator.sol#L123

---

Note that if your contracts already allow using at least Solidity `0.8.4`, then consider using [Custom errors](https://blog.soliditylang.org/2021/04/21/custom-errors). This is more gas efficient, while allowing the developer to describe the errors in detail using [NatSpec](https://docs.soliditylang.org/en/latest/natspec-format.html). A disadvantage to this approach is that, some tooling may not have proper support for this.

Note.sol
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Note.sol#L22
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Note.sol#L23

NoteInterest.sol
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/NoteInterest.sol#L167
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/NoteInterest.sol#L180
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/NoteInterest.sol#L193

CToken.sol
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/CToken.sol#L33
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/CToken.sol#L34
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/CToken.sol#L37
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/CToken.sol#L42
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/CToken.sol#L50
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/CToken.sol#L349
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/CToken.sol#L485
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/CToken.sol#L765
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/CToken.sol#L768
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/CToken.sol#L774
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/CToken.sol#L912
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/CToken.sol#L1114
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/CToken.sol#L1154

Comptroller.sol
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Comptroller.sol#L183
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Comptroller.sol#L242
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Comptroller.sol#L348
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Comptroller.sol#L356
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Comptroller.sol#L378
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Comptroller.sol#L496
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Comptroller.sol#L561
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Comptroller.sol#L619
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Comptroller.sol#L857
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Comptroller.sol#L965
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Comptroller.sol#L1003
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Comptroller.sol#L1008
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Comptroller.sol#L1021
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Comptroller.sol#L1056
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Comptroller.sol#L1057
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Comptroller.sol#L1058
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Comptroller.sol#L1066
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Comptroller.sol#L1067
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Comptroller.sol#L1068
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Comptroller.sol#L1076
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Comptroller.sol#L1077
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Comptroller.sol#L1085
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Comptroller.sol#L1086
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Comptroller.sol#L1094
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Comptroller.sol#L1095
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Comptroller.sol#L1100
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Comptroller.sol#L1101
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Comptroller.sol#L1102
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Comptroller.sol#L1163
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Comptroller.sol#L1354
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Comptroller.sol#L1400
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Comptroller.sol#L1402
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Comptroller.sol#L1413
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Comptroller.sol#L1416
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Comptroller.sol#L1429
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Comptroller.sol#L1480

CNote.sol
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/CNote.sol#L17
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/CNote.sol#L74
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/CNote.sol#L94
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/CNote.sol#L105
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/CNote.sol#L121
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/CNote.sol#L147
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/CNote.sol#L148
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/CNote.sol#L157

TreasuryDelegator.sol
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Treasury/TreasuryDelegator.sol#L31
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Treasury/TreasuryDelegator.sol#L32
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Treasury/TreasuryDelegator.sol#L121

BaseV1-periphery.sol
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Stableswap/BaseV1-periphery.sol#L104
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Stableswap/BaseV1-periphery.sol#L106
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Stableswap/BaseV1-periphery.sol#L122
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Stableswap/BaseV1-periphery.sol#L123
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Stableswap/BaseV1-periphery.sol#L151
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Stableswap/BaseV1-periphery.sol#L241
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Stableswap/BaseV1-periphery.sol#L246
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Stableswap/BaseV1-periphery.sol#L313
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Stableswap/BaseV1-periphery.sol#L314
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Stableswap/BaseV1-periphery.sol#L405
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Stableswap/BaseV1-periphery.sol#L420
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Stableswap/BaseV1-periphery.sol#L433
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Stableswap/BaseV1-periphery.sol#L435
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Stableswap/BaseV1-periphery.sol#L446
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Stableswap/BaseV1-periphery.sol#L448
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Stableswap/BaseV1-periphery.sol#L470
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Stableswap/BaseV1-periphery.sol#L481

GovernorBravoDelegate.sol
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Governance/GovernorBravoDelegate.sol#L25
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Governance/GovernorBravoDelegate.sol#L26
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Governance/GovernorBravoDelegate.sol#L27
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Governance/GovernorBravoDelegate.sol#L42
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Governance/GovernorBravoDelegate.sol#L46
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Governance/GovernorBravoDelegate.sol#L47
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Governance/GovernorBravoDelegate.sol#L76
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Governance/GovernorBravoDelegate.sol#L85
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Governance/GovernorBravoDelegate.sol#L128
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Governance/GovernorBravoDelegate.sol#L129
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Governance/GovernorBravoDelegate.sol#L140
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Governance/GovernorBravoDelegate.sol#L158
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Governance/GovernorBravoDelegate.sol#L176
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Governance/GovernorBravoDelegate.sol#L181

AccountantDelegate.sol
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Accountant/AccountantDelegate.sol#L87
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Accountant/AccountantDelegate.sol#L101

AccountantDelegator.sol
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Accountant/AccountantDelegator.sol#L42
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Accountant/AccountantDelegator.sol#L43
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Accountant/AccountantDelegator.sol#L123

---

### No need to add an extra variable since `twapMantissa` is used only once.

I recommend changing:
```
145:            uint twapMantissa = oracle.getUnderlyingPrice(cNote); // returns price as mantissa 
146:            //uint ir = (1 - twapMantissa).mul(adjusterCoefficient).add(baseRatePerYear);
147:            int diff = BASE - int(twapMantissa); //possible annoyance if 1e18 - twapMantissa > 2**255, differ
```
To:
```
146:            //uint ir = (1 - twapMantissa).mul(adjusterCoefficient).add(baseRatePerYear);
147:            int diff = BASE - int(oracle.getUnderlyingPrice(cNote)); //possible annoyance if 1e18 - twapMantissa > 2**255, differ
```

Line references:
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/NoteInterest.sol#L145-L147

---

### No need to do type conversion since an `accountant` is already an address

I recommend changing:
```
     require(address(accountant) == address(0));
```
To:
```
    require(accountant == address(0));
```

Line references:
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Note.sol#L23

---
### Use `calldata` instead of `memory` for function parameters
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

In short, use `calldata` instead of `memory` if the function argument is only read.

Note that in older Solidity versions, changing some function arguments from `memory` to `calldata` may cause “unimplemented feature error”. This can be avoided by using a newer (`0.8.*`) Solidity compiler.

Line references:
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Comptroller.sol#L127
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Comptroller.sol#L1215
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Comptroller.sol#L1275
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Comptroller.sol#L1338
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Comptroller.sol#L1351
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Comptroller.sol#L1412
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Treasury/TreasuryDelegator.sol#L77
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Treasury/TreasuryDelegator.sol#L88
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Treasury/TreasuryDelegator.sol#L105
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Stableswap/BaseV1-periphery.sol#L150
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Stableswap/BaseV1-periphery.sol#L379
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Stableswap/BaseV1-periphery.sol#L458
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Stableswap/BaseV1-periphery.sol#L538
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Accountant/AccountantDelegator.sol#L80
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Accountant/AccountantDelegator.sol#L96
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Accountant/AccountantDelegator.sol#L107

---

### For loops improvement:
* **Caching the length in for loops**

Reading array length at each iteration of the loop takes 6 gas (3 for `mload` and 3 to place `memory_offset` ) in the stack.
Caching the array length in the stack saves around 3 gas per iteration.
I suggest storing the array’s length in a variable before the for-loop.

Example of an array arr and the following loop:
```
for (uint i = 0; i < length; i++) {
    // do something that doesn't change the value of i
}
``` 
In the above case, the solidity compiler will always read the length of the array during each iteration. 
1. If it is a storage array, this is an extra `sload` operation (100 additional extra gas ([EIP-2929](https://eips.ethereum.org/EIPS/eip-2929)) for each iteration except for the first),
2. If it is a `memory` array, this is an extra `mload` operation (3 additional gas for each iteration except for the first),
3. If it is a `calldata` array, this is an extra `calldataload` operation (3 additional gas for each iteration except for the first)
This extra costs can be avoided by caching the array length (in stack):

```
uint length = arr.length;
for (uint i = 0; i < length; i++) {
    // do something that doesn't change arr.length
}
```
In the above example, the `sload` or `mload` or `calldataload` operation is only called once and subsequently replaced by a cheap `dupN` instruction. Even though `mload`, `calldataload` and `dupN` have the same gas cost, `mload` and `calldataload` needs an additional `dupN` to put the offset in the stack, i.e., an extra 3 gas.

This optimization is especially important if it is a storage array or if it is a lengthy for loop.

* **The increment in for loop post condition can be made unchecked**

In Solidity 0.8+, there’s a default overflow check on unsigned integers. It’s possible to uncheck this in for-loops and save some gas at each iteration, but at the cost of some code readability, as this uncheck [cannot be made inline](https://github.com/ethereum/solidity/issues/10695).

Example for loop:

```
for (uint i = 0; i < length; i++) {
    // do something that doesn't change the value of i
}
```

In this example, the for loop post condition, i.e., `i++` involves checked arithmetic, which is not required. This is because the value of i is always strictly less than `length <= 2**256 - 1`. Therefore, the theoretical maximum value of i to enter the for-loop body `is 2**256 - 2`. This means that the `i++` in the for loop can never overflow. Regardless, the overflow checks are performed by the compiler.

Unfortunately, the Solidity optimizer is not smart enough to detect this and remove the checks. You should manually do this by:

```
for (uint i = 0; i < length; i = unchecked_inc(i)) {
    // do something that doesn't change the value of i
}

function unchecked_inc(uint i) returns (uint) {
    unchecked {
        return i + 1;
    }
}
```
Or just:
```
for (uint i = 0; i < length;) {
    // do something that doesn't change the value of i
    unchecked { i++; }
}
```

Note that it’s important that the call to `unchecked_inc` is inlined. This is only possible for solidity versions starting from `0.8.2`.

Gas savings: roughly speaking this can save 30-40 gas per loop iteration. For lengthy loops, this can be significant!
(This is only relevant if you are using the default solidity checked arithmetic.)

* **`++i` costs less gas compared to `i++` or `i += 1`**

`++i `costs less gas compared to `i++` or` i += 1` for unsigned integer, as pre-increment is cheaper (about 5 gas per iteration). This statement is true even with the optimizer enabled.

Example:
`i++` increments `i` and returns the initial value of `i`. Which means:
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

* **No need to explicitly initialize variables with default values**

If a variable is not set/initialized, it is assumed to have the default value (0 for uint, false for bool, address(0) for address…). Explicitly initializing it with its default value is an anti-pattern and wastes gas.
As an example:
`for (uint256 i = 0; i < numIterations; ++i) {` 
should be replaced with:
`for (uint256 i; i < numIterations; ++i) {`

* **To sum up, the best gas optimized loop will be:**
```
uint length = arr.length;
for (uint i; i < length;) {
    unchecked { ++i; }
}
```

Line references: 
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Comptroller.sol#L131
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Comptroller.sol#L211
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Comptroller.sol#L742
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Comptroller.sol#L964
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Comptroller.sol#L1010
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Comptroller.sol#L1111
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Comptroller.sol#L1352
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Comptroller.sol#L1358
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Comptroller.sol#L1364
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Comptroller.sol#L1369
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Comptroller.sol#L1418

https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Stableswap/BaseV1-core.sol#L208
// in link below you should make this block unchecked and increment via `++index;`
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Stableswap/BaseV1-core.sol#L235

https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Stableswap/BaseV1-periphery.sol#L154
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Stableswap/BaseV1-periphery.sol#L380

https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Governance/GovernorBravoDelegate.sol#L66
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Governance/GovernorBravoDelegate.sol#L88

---

### Add unchecked module

In Solidity 0.8+, there’s a default overflow check on unsigned integers. It’s possible to uncheck this and save some gas a, but at the cost of some code readability, as this uncheck [cannot be made inline](https://github.com/ethereum/solidity/issues/10695).

Line references:
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Comptroller.sol#L1121

Proof:
You even added a comment there: `// Underflow safe since amountToSubtract > currentAccrual`.

---

### No need to initialize extra storage variable

To help the optimizer, declare a `storage` type variable and use it instead of repeatedly fetching the reference in a map or an array.
The effect can be quite significant.

```
function borrow(
   Position storage position = positions[_nftIndex];
```

But in your case you have only one storage variable usage, this won't make code cheaper.

Line reference:
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Comptroller.sol#L1162
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Comptroller.sol#L1241
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Comptroller.sol#L1280

---

### Use double `require` instead of operator `&&`

```
contract Requires {
    uint256 public gas;

    function check1(uint x) public {
        gas = gasleft();    
        require(x == 0 && x < 1 ); // gas cost 22156
        gas -= gasleft();
    }

    function check2(uint x) public {
        gas = gasleft(); 
        require(x == 0); // gas cost 22148
        require(x < 1);
        gas -= gasleft();
    }
}
```

Gas savings: Usage of double require will save you around 10 gas with the optimizer enabled.

Line reference:
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Comptroller.sol#L1008
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Comptroller.sol#L1416
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Stableswap/BaseV1-periphery.sol#L123
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Stableswap/BaseV1-periphery.sol#L477
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Stableswap/BaseV1-core.sol#L291
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Stableswap/BaseV1-core.sol#L297
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Stableswap/BaseV1-core.sol#L434
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Governance/GovernorBravoDelegate.sol#L42

---

### Change `constant` to `immutable` for keccak variables
Use of constant keccak variables results in extra hashing (and so gas).
This results in the keccak operation being performed whenever the variable is used, increasing gas costs relative to just storing the output hash. Changing to `immutable `will only perform hashing on contract deployment which will save gas.
You should use `immutables` until the referenced issues are implemented, then you only pay the gas costs for the computation at deploy time.

Example:
```
contract Immutables is AccessControl {
    uint256 public gas;

    bytes32 public immutable MANAGER_ROLE_IMMUT;
    bytes32 public constant MANAGER_ROLE_CONST = keccak256('MANAGER_ROLE');

    constructor(){
        MANAGER_ROLE_IMMUT = keccak256('MANAGER_ROLE');
        _setupRole(MANAGER_ROLE_CONST, msg.sender);
        _setupRole(MANAGER_ROLE_IMMUT, msg.sender);
    }

    function immutableCheck() external {
        gas = gasleft();
        require(hasRole(MANAGER_ROLE_IMMUT, msg.sender), 'Caller is not in manager role'); // 24408 gas
        gas -= gasleft();
    }

    function constantCheck() external {
        gas = gasleft();
        require(hasRole(MANAGER_ROLE_CONST, msg.sender), 'Caller is not in manager role'); // 24419 gas
        gas -= gasleft();
    }
}
```
As you can see on the compiler version `0.8.15` and with optimizator on 200 runs immutables are cheaper, and saves you about 20 gas. For other variables, `constants` are equal to `immutables`.

See: ([ethereum/solidity#9232 (comment)](https://github.com/ethereum/solidity/issues/9232#issuecomment-646131646), [Inefficient Hash Constants](https://github.com/seen-haus/seen-contracts/issues/29))

Line reference:
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Treasury/TreasuryDelegate.sol#L12
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Treasury/TreasuryDelegate.sol#L13

https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Governance/GovernorBravoDelegate.sol#L15
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Governance/GovernorBravoDelegate.sol#L18

---

### Missed require statement in modifier

This modifier is useless since the require is commented:
```
    modifier ensure(uint deadline) {
        //require(deadline >= block.timestamp, "BaseV1Router: EXPIRED");
        _;
    }
```

I recommend removing this modifier from all functions and removing `deadline` parameter from following functions.

Line references:
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Stableswap/BaseV1-periphery.sol#L261
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Stableswap/BaseV1-periphery.sol#L277
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Stableswap/BaseV1-periphery.sol#L306
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Stableswap/BaseV1-periphery.sol#L324
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Stableswap/BaseV1-periphery.sol#L349
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Stableswap/BaseV1-periphery.sol#L368
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Stableswap/BaseV1-periphery.sol#L398
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Stableswap/BaseV1-periphery.sol#L417
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Stableswap/BaseV1-periphery.sol#L427
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Stableswap/BaseV1-periphery.sol#L441
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Stableswap/BaseV1-periphery.sol#L461

---

### No need to explicitly initialize variables with default values

If a variable is not set/initialized, it is assumed to have the default value (0 for uint, false for bool, address(0) for address…). Explicitly initializing it with its default value is an anti-pattern and wastes gas.

Line references:
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Stableswap/BaseV1-periphery.sol#L123
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Stableswap/BaseV1-core.sol#L48
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Stableswap/BaseV1-core.sol#L72

---

### Remove new bytes(0)

There is no need in additionally initialazing bytes when sending native via call().
```
(bool success,) = to.call{value:value}(new bytes(0));
```
Use `.call.value(...)("")` instead. 

See: https://swcregistry.io/docs/SWC-134

Line references:
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Stableswap/BaseV1-periphery.sol#L469

--- 

### Remove hardhat/console.sol from imports
Adding hardhat lib to your contract will make deploy more expensive.

Line references: 
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Accountant/AccountantDelegate.sol#L7
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Stableswap/BaseV1-core.sol#L4

---

### Remove `console.log` 
Remove `console.log` from contract before deploying it.

Line references:
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Stableswap/BaseV1-core.sol#L207

---

### NON

Extra space

https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Comptroller.sol#L92
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/NoteInterest.sol#L100
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Treasury/TreasuryDelegator.sol#L12
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Stableswap/BaseV1-periphery.sol#L513
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Accountant/AccountantDelegate.sol#L17

---

Add space
in comment section:
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/CNote.sol#L57
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/CNote.sol#L99
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/CNote.sol#L121
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/CNote.sol#L125

Add space there to make `(err != 0)`:
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/CNote.sol#L100

---

Extra tabulation
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/NoteInterest.sol#L144
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Treasury/TreasuryDelegator.sol#L115

---

Missed comment:
https://github.com/Plex-Engineer/lending-market-v2/blob/main/contracts/Treasury/TreasuryDelegate.sol#L12










