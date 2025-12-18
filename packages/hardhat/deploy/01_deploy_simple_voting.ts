import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;

  const { deployer } = await getNamedAccounts();

  await deploy("SimpleVoting", {
    from: deployer,
    args: ["Выбор лучшего проекта курса", 60], // 60 minutes duration
    log: true,
    autoMine: true,
  });
};

export default func;
func.tags = ["SimpleVoting"];