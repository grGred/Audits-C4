import {expect} from "chai";
import {ethers, deployments, getNamedAccounts} from "hardhat";

let oracle: any;
let comptroller: any;
let weth: any;
let note: any;
let factory: any;   
let usdc: any;
let cWeth: any;
let cNote: any;
let noteRate: any; 
let cLPToken: any;

const CLPTokenArgs = [

];


describe("Reservoir Tests", async () => {
    let dep: any;
    before(async () => {
        [dep] = await ethers.getSigners();
        await deployments.fixture("Protocol");
        oracle = await ethers.getContract("BaseV1Router01");
        comptroller = new ethers.Contract(
            (await deployments.get("Unitroller")).address,
            (await deployments.get("Comptroller")).abi,
            dep 
        );
        weth = await ethers.getContract("WETH");
        usdc = await ethers.getContract("USDC");
        note = await ethers.getContract("Note");
        cNote = await ethers.getContract("CErc20Delegator");
        factory = await ethers.getContract("BaseV1Factory");
        cWeth = await ethers.getContract("CWethDelegator");
        noteRate = await ethers.getContract("NoteRateModel");
    });
    describe("Reservoir Tests", async () => {
        it("check that the router exists", async () => {
            expect((await ethers.provider.getCode(oracle.address)) === "0x").to.be.false;
        });
        it("deploy pair and check that it exists", async () => {
            await (await factory.createPair(usdc.address, weth.address, false)).wait();
            //router and factory are linked and the note/WETH pair exists
            expect(await factory.allPairs(0)).to.equal(await oracle.pairFor(usdc.address, weth.address, false));
        });
        let transferBal = ethers.utils.parseUnits("1000", "18");
        it("retrieve WETH with this account", async () => {
            await (await weth.deposit({value: transferBal})).wait();
            expect((await weth.balanceOf(dep.address)).toBigInt() == transferBal).to.be.true; //WETH balance is transferBal
        });

        it("retrieve USDC", async () => {
            expect((await usdc.balanceOf(dep.address)).toBigInt() == ethers.utils.parseUnits("500", "18"));
        });

        it("Add Liquidity", async () =>  {
            //set allowance 
            let priorWETHBal = (await weth.balanceOf(dep.address)).toBigInt();
            let priorUSDCBal = (await usdc.balanceOf(dep.address)).toBigInt();
            
            await (await weth.approve(oracle.address, (await weth.balanceOf(dep.address)).toBigInt())).wait();
            await (await usdc.approve(oracle.address, (await usdc.balanceOf(dep.address)).toBigInt())).wait();
            expect((await weth.allowance(dep.address, oracle.address)).toBigInt() == priorWETHBal).to.be.true
            expect((await usdc.allowance(dep.address, oracle.address)).toBigInt() == priorUSDCBal).to.be.true


            await (await oracle.addLiquidity(
                usdc.address, weth.address,false,
                ethers.utils.parseUnits("100", "18"), 
                ethers.utils.parseUnits("100", "18"),  
                0, 0,
                dep.address, 0
            )).wait();
            
            console.log((await usdc.balanceOf(await factory.allPairs(0))).toBigInt());
                

            for(var i = 0; i < 100; i++) {
                await (await oracle.swapExactTokensForTokensSimple(
                    ethers.utils.parseUnits("5", "18"), 
                    ethers.utils.parseUnits("0", "18"), 
                    usdc.address,
                    weth.address,
                    false, 
                    dep.address,
                    0
                )).wait();
            }
            
            //pool balances
            console.log((await weth.balanceOf(await factory.allPairs(0))).toBigInt());
            console.log((await usdc.balanceOf(await factory.allPairs(0))).toBigInt());
            //user balances
            console.log("----------");
            console.log((await weth.balanceOf(dep.address)).toBigInt());
            console.log((await usdc.balanceOf(dep.address)).toBigInt());
            

            let curWETHBal =(await weth.balanceOf(dep.address)).toBigInt();
            let curUSDCBal =(await usdc.balanceOf(dep.address)).toBigInt();
        });

        it("Check LP balance of deployer", async () => {
            expect(await comptroller.oracle()).to.equal(oracle.address);
            console.log("USDC/WETH: ", await factory.allPairs(0));
            console.log("Price: ", (await oracle.getUnderlyingPrice(cWeth.address)).toBigInt());
        });

        it("AccountLiquidity determined by PriceOracle", async () => {
            //support CWETH market, and set collateral factor
            console.log("Comptroller Address: ", comptroller.address);
            console.log("deployer weth balance: ", await weth.balanceOf(dep.address));
            
            await (await comptroller._supportMarket(cWeth.address)).wait(); 
            await (await comptroller._setCollateralFactor(cWeth.address, ethers.BigNumber.from("500000000000000000"))).wait();
            await (await comptroller.enterMarkets([cWeth.address])).wait();
            await (await weth.approve(cWeth.address, (await weth.balanceOf(dep.address)))).wait();
            await (await cWeth.mint((await weth.balanceOf(dep.address)).toBigInt())).wait();
            
            console.log("deployer cWeth balance: ", await cWeth.balanceOf(dep.address));
            console.log("Deployer acc Liquidity: ",(await comptroller.getAccountLiquidity(dep.address))[1].toBigInt());
        });

        describe("Identify Note Price from Comptroller and with InterestRateModel", async () => {
            before(async() => {
                await (await comptroller._supportMarket(cNote.address)).wait();
                await ((await comptroller.enterMarkets([cNote.address]))).wait();
            });
            
            it("check Interest Rate Model's Price Oracle", async () => {
                expect(await noteRate.oracle()).to.equal(oracle.address);
            });
            
            it("Deploy USDC Note Pair", async () => {
                await (await factory.createPair(usdc.address, note.address, true)).wait();
                expect(await factory.allPairs(1)).to.equal(await oracle.pairFor(usdc.address, note.address, true));
            });
            let borrowAmt = ethers.utils.parseUnits("400", "18");
            
            it("Borrow Note", async () =>{
                expect(await comptroller.checkMembership(dep.address, cNote.address)).to.be.true;
                await (await cNote.borrow(borrowAmt)).wait();
                console.log((await note.balanceOf(dep.address)).toBigInt());
            });

            it("Now add Liquidity to the USDC/Note token pair", async () =>{ 
                await (await note.approve(oracle.address, (await note.balanceOf(dep.address)).toBigInt())).wait();

                await (await oracle.addLiquidity(
                    usdc.address, note.address,true,
                    ethers.utils.parseUnits("100", "18"), 
                    ethers.utils.parseUnits("100", "18"),  
                    0, 0,
                    dep.address, 0
                )).wait();
                
                for(var i = 0; i < 30; i++) {
                    await (await oracle.swapExactTokensForTokensSimple(
                        ethers.utils.parseUnits("0.9", "18"), 
                        ethers.utils.parseUnits("0", "18"), 
                        usdc.address, //token from
                        note.address, //token to
                        true, 
                        dep.address,
                        0
                    )).wait();
                }

                //pool balances
                console.log((await note.balanceOf(await factory.allPairs(1))).toBigInt());
                console.log((await usdc.balanceOf(await factory.allPairs(1))).toBigInt());
                //user balances
                console.log("----------");
                console.log((await note.balanceOf(dep.address)).toBigInt());
                console.log((await usdc.balanceOf(dep.address)).toBigInt());
                console.log((await oracle.getUnderlyingPrice(cNote.address)).toBigInt());
            });
        });
    });
    describe("minting LP tokens and setting up market for LP Token", async () => {
        let WethLPToken: any; 

        before(async () =>{
            WethLPToken = await ethers.getContractAt("BaseV1Pair", await oracle.pairFor(usdc.address, weth.address, false), dep.address);
            console.log("WETHLPToken balance of deployer", await WethLPToken.balanceOf(dep.address));
            console.log("WETHLPToken address: ", WethLPToken.address);
            // deploy CLPToken
            let cLPFac = await ethers.getContractFactory("CErc20Delegate", dep);
            let cLP = await cLPFac.deploy();
            await cLP.deployed();
            let cLPTokenFac = await ethers.getContractFactory("CErc20Delegator", dep);
            cLPToken = await cLPTokenFac.deploy(
                WethLPToken.address, 
                comptroller.address,
                (await deployments.get("JumpRateModel")).address,
                "1000000000000000000",
                "cLPTOKEN",
                "cLPTOKEN",
                18,
                dep.address,
                cLP.address,
                3,
                []
            );
            await cLPToken.deployed(); 
            console.log("cLPToken address: ", cLPToken.address);
        });  

        it("Check user's LP Token balance", async () => {
            console.log("cLPToken Address", await oracle.getUnderlyingPrice(cLPToken.address));
        }); 
    });
});