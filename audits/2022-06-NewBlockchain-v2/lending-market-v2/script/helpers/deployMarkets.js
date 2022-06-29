const {ethers} = require("hardhat");
const {canto} = require("../../config/index");

async function main() { 
    const [dep] = await ethers.getSigners();

    const Token0 = "0x0aE09CA56605A26C63Da6A5d8DaFeF6D0E6a1285";
    const Token1 = "0x4288Ef9004b2e163C2EfB97845A8142A9985f9a1";
    const Token2 = "0xaFc41824aB7eceA40D21f146Ef2Be852A076b6CD";
    const Token3 = "0x837fc5DCdB6b72BaF40358Be7375630d78d1CDaC";
    const Token4 = "0x191d339f7675FbC8e06C79C84738B1FD621E4836";
    const Token5 = "0x9843961777E002E8228D9589016dd172aa8E8e82";
    const Token6 = "0x952991052488aDBc8544f12434167a79EEA97f93";
    const Token7 = "0x31ec3471caE823B681452bE056da87ebCDE26e0C";
    const Token8 = "0xEE898A852d6EA01aC15415D64668EFc2707f51B5";
    const Token9 = "0x3F6F6ea97269ED31783a6640c0D6E7162482A0dA";
    const Token10 = "0x0eE9447C8588Ea8Cf080f718232485044eF57ae6";
    const Comp = "0x7820971feb97f8f1C18A51d02058fEF92be57435";
    const Model = "0xA7939096020dEC87b18078e53C50A7Df2E6b5499";

    const markets = canto.markets.CNote;


    const Comptroller = await ethers.getContractAt("Comptroller", Comp, dep);
    const CErc20Factory = await ethers.getContractFactory("CErc20Delegate");

    const ctoken0 = await CErc20Factory.deploy();
    await ctoken0.deployed();

    const ctoken1 = await CErc20Factory.deploy();
    await ctoken1.deployed();
    
    const ctoken2 = await CErc20Factory.deploy();
    await ctoken2.deployed();

    const ctoken3 = await CErc20Factory.deploy();
    await ctoken3.deployed();

    const ctoken4 = await CErc20Factory.deploy();
    await ctoken4.deployed();

    const ctoken5 = await CErc20Factory.deploy();
    await ctoken5.deployed();

    const ctoken6 = await CErc20Factory.deploy();
    await ctoken6.deployed();

    const ctoken7 = await CErc20Factory.deploy();
    await ctoken7.deployed();

    const ctoken8 = await CErc20Factory.deploy();
    await ctoken8.deployed();

    const ctoken9 = await CErc20Factory.deploy();
    await ctoken9.deployed();

    const ctoken10 = await CErc20Factory.deploy();
    await ctoken10.deployed();

    console.log("------ CErc20s deployed -----");

    const delegator = await ethers.getContractFactory("CErc20Delegator");

    const cToken0 = await delegator.deploy(       
        Token0, // underlying
        Comp, //unitroller
        Model,
        markets.initialExchangeRateMantissa,
        "cToken0",
        "CTOKEN0",
        markets.decimals,
        dep.address,
        ctoken0.address,
        markets.becomeImplementation 
    );
    await cToken0.deployed();
    console.log("cToken0", await cToken0.resolvedAddress);
    await (await Comptroller._supportMarket(cToken0.address)).wait();
    await(await Comptroller._setCollateralFactor(cToken0.address, markets.CollateralFactor)).wait();
    
    const cToken1 = await delegator.deploy(       
        Token1, // underlying
        Comp, //unitroller
        Model,
        markets.initialExchangeRateMantissa,
        "cToken1",
        "CTOKEN1",
        markets.decimals,
        dep.address,
        ctoken1.address,
        markets.becomeImplementation 
    );
    await cToken1.deployed();
    console.log("cToken1", await cToken1.resolvedAddress);
    await (await Comptroller._supportMarket(cToken1.address)).wait();   
    await(await Comptroller._setCollateralFactor(cToken1.address, markets.CollateralFactor)).wait();
    

    const cToken2 = await delegator.deploy(       
        Token2, // underlying
        Comp, //unitroller
        Model,
        markets.initialExchangeRateMantissa,
        "cToken2",
        "CTOKEN2",
        markets.decimals,
        dep.address,
        ctoken2.address,
        markets.becomeImplementation 
    );
    await cToken2.deployed();
    console.log("cToken2", await cToken2.resolvedAddress);
    await (await Comptroller._supportMarket(cToken2.address)).wait();  
    await(await Comptroller._setCollateralFactor(cToken2.address, markets.CollateralFactor)).wait();
    
    
    const cToken3 = await delegator.deploy(       
        Token3, // underlying
        Comp, //unitroller
        Model,
        markets.initialExchangeRateMantissa,
        "cToken3",
        "CTOKEN3",
        markets.decimals,
        dep.address,
        ctoken3.address,
        markets.becomeImplementation 
    );
    await cToken3.deployed();
    console.log("cToken3", await cToken3.resolvedAddress);
    await (await Comptroller._supportMarket(cToken3.address)).wait(); 
    await(await Comptroller._setCollateralFactor(cToken3.address, markets.CollateralFactor)).wait();

    const cToken4 = await delegator.deploy(       
        Token4, // underlying
        Comp, //unitroller
        Model,
        markets.initialExchangeRateMantissa,
        "cToken4",
        "CTOKEN4",
        markets.decimals,
        dep.address,
        ctoken4.address,
        markets.becomeImplementation 
    );
    await cToken4.deployed();
    console.log("cToken4", await cToken4.resolvedAddress);
    await (await Comptroller._supportMarket(cToken4.address)).wait(); 
    await(await Comptroller._setCollateralFactor(cToken4.address, markets.CollateralFactor)).wait();


    const cToken5 = await delegator.deploy(       
        Token5, // underlying
        Comp, //unitroller
        Model,
        markets.initialExchangeRateMantissa,
        "cToken5",
        "CTOKEN5",
        markets.decimals,
        dep.address,
        ctoken5.address,
        markets.becomeImplementation 
    );
    await cToken5.deployed();
    console.log("cToken5", await cToken5.resolvedAddress);
    await (await Comptroller._supportMarket(cToken5.address)).wait(); 
    await(await Comptroller._setCollateralFactor(cToken5.address, markets.CollateralFactor)).wait();

    const cToken6 = await delegator.deploy(       
        Token6, // underlying
        Comp, //unitroller
        Model,
        markets.initialExchangeRateMantissa,
        "cToken6",
        "CTOKEN6",
        markets.decimals,
        dep.address,
        ctoken6.address,
        markets.becomeImplementation 
    );
    await cToken6.deployed();
    console.log("cToken6", await cToken6.resolvedAddress);
    await (await Comptroller._supportMarket(cToken6.address)).wait(); 
    await(await Comptroller._setCollateralFactor(cToken6.address, markets.CollateralFactor)).wait();
    
    const cToken7 = await delegator.deploy(       
        Token7, // underlying
        Comp, //unitroller
        Model,
        markets.initialExchangeRateMantissa,
        "cToken7",
        "CTOKEN7",
        markets.decimals,
        dep.address,
        ctoken7.address,
        markets.becomeImplementation 
    );
    await cToken7.deployed();
    console.log("cToken7", await cToken7.resolvedAddress);
    await (await Comptroller._supportMarket(cToken7.address)).wait(); 
    await(await Comptroller._setCollateralFactor(cToken7.address, markets.CollateralFactor)).wait();
   
    const cToken8= await delegator.deploy(       
        Token8, // underlying
        Comp, //unitroller
        Model,
        markets.initialExchangeRateMantissa,
        "cToken8",
        "CTOKEN8",
        markets.decimals,
        dep.address,
        ctoken8.address,
        markets.becomeImplementation 
    );
    await cToken8.deployed();
    console.log("cToken8", await cToken8.resolvedAddress);
    await (await Comptroller._supportMarket(cToken8.address)).wait(); 
    await(await Comptroller._setCollateralFactor(cToken8.address, markets.CollateralFactor)).wait();
       
    const cToken9 = await delegator.deploy(       
        Token9, // underlying
        Comp, //unitroller
        Model,
        markets.initialExchangeRateMantissa,
        "cToken9",
        "CTOKEN9",
        markets.decimals,
        dep.address,
        ctoken9.address,
        markets.becomeImplementation 
    );
    await cToken9.deployed();
    console.log("cToken9", await cToken9.resolvedAddress);
    await (await Comptroller._supportMarket(cToken9.address)).wait(); 
    await(await Comptroller._setCollateralFactor(cToken9.address, markets.CollateralFactor)).wait();
           
    const cToken10 = await delegator.deploy(       
        Token10, // underlying
        Comp, //unitroller
        Model,
        markets.initialExchangeRateMantissa,
        "cToken10",
        "CTOKEN10",
        markets.decimals,
        dep.address,
        ctoken10.address,
        markets.becomeImplementation 
    );
    await cToken9.deployed();
    console.log("cToken10", await cToken10.resolvedAddress);
    await (await Comptroller._supportMarket(cToken10.address)).wait(); 
    await(await Comptroller._setCollateralFactor(cToken10.address, markets.CollateralFactor)).wait();
}

main()
.then(() => process.exit(0))
.catch((error) => {
  console.error(error);
  process.exit(1);
});