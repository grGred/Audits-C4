const {ethers} = require("hardhat");
const {canto} = require("../../config/index");

const markets = canto.markets.CNote;

const abi = [
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "propId",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "title",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "desc",
				"type": "string"
			},
			{
				"internalType": "address[]",
				"name": "targets",
				"type": "address[]"
			},
			{
				"internalType": "uint256[]",
				"name": "values",
				"type": "uint256[]"
			},
			{
				"internalType": "string[]",
				"name": "signatures",
				"type": "string[]"
			},
			{
				"internalType": "bytes[]",
				"name": "calldatas",
				"type": "bytes[]"
			}
		],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "propId",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "title",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "desc",
				"type": "string"
			},
			{
				"internalType": "address[]",
				"name": "targets",
				"type": "address[]"
			},
			{
				"internalType": "uint256[]",
				"name": "values",
				"type": "uint256[]"
			},
			{
				"internalType": "string[]",
				"name": "signatures",
				"type": "string[]"
			},
			{
				"internalType": "bytes[]",
				"name": "calldatas",
				"type": "bytes[]"
			}
		],
		"name": "AddProposal",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "propId",
				"type": "uint256"
			}
		],
		"name": "QueryProp",
		"outputs": [
			{
				"components": [
					{
						"internalType": "uint256",
						"name": "id",
						"type": "uint256"
					},
					{
						"internalType": "string",
						"name": "title",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "desc",
						"type": "string"
					},
					{
						"internalType": "address[]",
						"name": "targets",
						"type": "address[]"
					},
					{
						"internalType": "uint256[]",
						"name": "values",
						"type": "uint256[]"
					},
					{
						"internalType": "string[]",
						"name": "signatures",
						"type": "string[]"
					},
					{
						"internalType": "bytes[]",
						"name": "calldatas",
						"type": "bytes[]"
					}
				],
				"internalType": "struct ProposalStore.Proposal",
				"name": "",
				"type": "tuple"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];

async function main() { 
    const [dep] = await ethers.getSigners();
    // const Comp = "0x7820971feb97f8f1C18A51d02058fEF92be57435";
    // const WETH = "0xb35D914B42D13EfFd802049A6610673402bBC513";
    // const Note = "0x7094125d250AF1FbD82640b1cA986f0b591508dc";
    // const router = "0x982C28F7626c3cD864CA34802E7d6F14e55959f0"
    // // const cFiji = "0x933dFA46Ce7cA5e441257a260c0F506cCdd73C32";
    // // const cEvian = "0x29375E0135e50AEb96bBF23C578649B91A9C84b3";
    // // const oracle = "0xa0ab4b24299851aAFa509CFc2bCE3CdCA2200de6";

    // const Comptroller = await ethers.getContractAt("Comptroller", Comp, dep);

    // let weth = await ethers.getContractAt("WETH", WETH, dep);
    // let note = await ethers.getContractAt("Note", Note, dep);
    // console.log("Note address: ", note.address, "WETH address: ", weth.address);


    // await (await weth.approve(router, BigInt(1e18))).wait();
    // await (await note.approve(router, BigInt(1e18))).wait();
    // //console.log(dep);
    // console.log("deployer Note allowance for note: ", await note.allowance(dep.address, router));
    // console.log("deployer WETH allowance router: ", await note.allowance(dep.address, router));
    // console.log(dep.address);
    // await (await weth.deposit({value: 100000})).wait();
    // console.log(await weth.balanceOf(dep.address));
    // console.log(await note.balanceOf(dep.address));
  const prop = await ethers.getContractAt(abi, "0x30E20d0A642ADB85Cb6E9da8fB9e3aadB0F593C0", dep);
  console.log(await ethers.provider.getCode("0x30E20d0A642ADB85Cb6E9da8fB9e3aadB0F593C0"));
  console.log(await prop.QueryProp(2)); 
}     

main()
.then(() => process.exit(0))
.catch((error) => {
  console.error(error);
  process.exit(1);
});