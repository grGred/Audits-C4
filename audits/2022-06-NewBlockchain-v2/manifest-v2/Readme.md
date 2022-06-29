# Manifest
## Description
- Manifest is a Layer 1 blockchain built using Cosmos SDK and Tendermint Consensus with an EVM execution layer ([Ethermint](https://github.com/tharsis/ethermint) Module) and network owned/incentivized defi primitives(stablecoin, dex, lending market).
- Manifest's blockchain infrastructure is forked from [Evmos](https://github.com/tharsis/evmos) (Standard Cosmos SDK modules + Ethermint Module + ERC20 Module). 
- Manifest includes a new additional functionality in the form of a novel cross-runtime governance mechanism via the unigov (unified governance) module. The unigov module allows Manifest Network stakeholders to vote on proposals which are read and executed by smart contracts deployed on the EVM.

## Running a Node
1. Install [go](https://go.dev/doc/install)
2. Install [jq](https://stedolan.github.io/jq/download/)
3. run `./init_testnode.sh`

You will see blocks printing if your node is successfully running. 

## To Use Unigov
1. Submit a proposal while the testnode is running
    - `Manifestd tx gov submit-proposal lending-market ./proposal/metadata.json --from mykey --title="title" --description="desc" --chain-id=$(Manifestd config "chain-id") --from mykey --deposit=40aManifest --gas=auto --fees=250aManifest --broadcast-mode=block`
2. Within 1 minute of submitting the proposal, vote on it (voting period is lowered to make testing easier)
    - `Manifestd tx gov vote 1 yes --from mykey --fees=100aManifest --gas=auto --chain-id=$(Manifestd config "chain-id") --broadcast-mode=block`
3. Proposal will pass. You can now query this proposal on the EVM. 
    - Address of proposal contract is `0x30E20d0A642ADB85Cb6E9da8fB9e3aadB0F593C0`
    - You can query any proposal at this contract using the QueryProp(propID) function

## How it works
- Proposals are added to the proposal store contract using the `AppendLendingMarketProposal` function in `x/unigov/keeper/proposals.go`
- The proposal store contract (also called the map contrat) can be found in `contracts/Proposal-Store.sol`
- The `QueryProp` method in the ProposalStore contract is used to query the proposal from the EVM using the proposal ID generated from the Cosmos SDK governance module. 


<div align="center">
  <h1> Evmos </h1>
</div>

<!-- TODO: add banner -->
<!-- ![banner](docs/ethermint.jpg) -->

<div align="center">
  <a href="https://github.com/tharsis/evmos/releases/latest">
    <img alt="Version" src="https://img.shields.io/github/tag/tharsis/evmos.svg" />
  </a>
  <a href="https://github.com/tharsis/evmos/blob/main/LICENSE">
    <img alt="License: Apache-2.0" src="https://img.shields.io/github/license/tharsis/evmos.svg" />
  </a>
  <a href="https://pkg.go.dev/github.com/tharsis/evmos">
    <img alt="GoDoc" src="https://godoc.org/github.com/tharsis/evmos?status.svg" />
  </a>
  <a href="https://goreportcard.com/report/github.com/tharsis/evmos">
    <img alt="Go report card" src="https://goreportcard.com/badge/github.com/tharsis/evmos"/>
  </a>
  <a href="https://bestpractices.coreinfrastructure.org/projects/5018">
    <img alt="Lines of code" src="https://img.shields.io/tokei/lines/github/tharsis/evmos">
  </a>
</div>
<div align="center">
  <a href="https://discord.gg/evmos">
    <img alt="Discord" src="https://img.shields.io/discord/809048090249134080.svg" />
  </a>
  <a href="https://github.com/tharsis/evmos/actions?query=branch%3Amain+workflow%3ALint">
    <img alt="Lint Status" src="https://github.com/tharsis/evmos/actions/workflows/lint.yml/badge.svg?branch=main" />
  </a>
  <a href="https://codecov.io/gh/tharsis/evmos">
    <img alt="Code Coverage" src="https://codecov.io/gh/tharsis/evmos/branch/main/graph/badge.svg" />
  </a>
  <a href="https://twitter.com/EvmosOrg">
    <img alt="Twitter Follow Evmos" src="https://img.shields.io/twitter/follow/EvmosOrg"/>
  </a>
</div>

Evmos is a scalable, high-throughput Proof-of-Stake blockchain that is fully compatible and
interoperable with Ethereum. It's built using the [Cosmos SDK](https://github.com/cosmos/cosmos-sdk/) which runs on top of [Tendermint Core](https://github.com/tendermint/tendermint) consensus engine.

**Note**: Requires [Go 1.17.5+](https://golang.org/dl/)

## Installation

For prerequisites and detailed build instructions please read the [Installation](https://evmos.dev/quickstart/installation.html) instructions. Once the dependencies are installed, run:

```bash
make install
```

Or check out the latest [release](https://github.com/tharsis/evmos/releases).

## Quick Start

To learn how the Evmos works from a high-level perspective, go to the [Introduction](https://evmos.dev/intro/overview.html) section from the documentation. You can also check the instructions to [Run a Node](https://evmos.dev/quickstart/run_node.html).

## Community

The following chat channels and forums are a great spot to ask questions about Evmos:

- [Evmos Twitter](https://twitter.com/EvmosOrg)
- [Evmos Discord](https://discord.gg/evmos)
- [Evmos Forum](https://commonwealth.im/evmos)
- [Tharsis Twitter](https://twitter.com/TharsisHQ)

## Contributing

Looking for a good place to start contributing? Check out some [`good first issues`](https://github.com/tharsis/evmos/issues?q=is%3Aopen+is%3Aissue+label%3A%22good+first+issue%22).

For additional instructions, standards and style guides, please refer to the [Contributing](./CONTRIBUTING.md) document.

## Careers

See our open positions on [Cosmos Jobs](https://jobs.cosmos.network/project/evmos-d0sk1uxuh-remote/), [Notion](https://tharsis.notion.site), or feel free to [reach out](mailto:careers@thars.is) via email.
