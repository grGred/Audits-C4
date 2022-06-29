import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/dist/types";
import {canto} from "../../config/index.js";

const func: DeployFunction = async function(hre: HardhatRuntimeEnvironment) {
    const {ethers, deployments, getNamedAccounts} = hre;
    const { deploy, execute, read } = deployments;
    const { deployer } = await getNamedAccounts();

    //deploy Timelock with args from 
    const timelock = await deploy("Timelock", {
        from: deployer, 
        log: true,
        args: [deployer, canto.timelockDelay]
    }); 
    // deploy governor bravo delegate
    const GovBravo = await deploy("GovernorBravoDelegate", {
        from: deployer, 
        log: true
    });

    //deploy and link delegators 

    const GovernorBravo = await deploy("GovernorBravoDelegator", {
        from: deployer, 
        log: true,
        args: [timelock.address, deployer, GovBravo.address]
    }); 
};

export default func;
func.tags = ["GovernanceConfig", "Protocol"];
