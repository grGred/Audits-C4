import "@nomiclabs/hardhat-ethers";
//import "@nomiclabs/hardhat-waffle";
import {HardhatUserConfig} from 'hardhat/types';
import "hardhat-deploy";
import "ethereum-waffle";

const config: HardhatUserConfig = {
  networks: {
    localhost: {
      url: "http://localhost:8545",
      accounts: [
        "a73db736315fd5eacec2785dd48a3e6d50dbadc8e7778a1cb24e0b6d75a5ffea",
      ]
    },
    canto_testnet : {
      url: "http://137.184.130.158:8545",
      accounts: [
        "f9f9eb7b8f7b4b8bce71224c9c38d0d02de7ff65d82dd629556730b0d8fb87fe"
      ]
    }
  },
  solidity: {
    compilers: [
      {
        version: "0.8.10",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        }
      },
      {
        version: "0.8.11",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        }
      }
    ]
  },
  namedAccounts : {
    deployer: 0,
    user1: 1,
    user2: 2,
    liquidator: 3 
  },
  paths: {
    deploy: "./deploy/canto",
    sources: "./contracts",
    tests: "./test/Treasury",
    cache:"./cache",
    artifacts: "./artifacts"
  }
};

export default config;