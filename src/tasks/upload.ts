import { task } from "hardhat/config";
import { HardhatPluginError } from "hardhat/plugins";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { PLUGIN_NAME } from "../constants";

task("sentio:upload", "upload contracts")
  .addParam(
    "contracts",
    "names of contracts that need to be uploaded`"
  )
  .setAction(uploadContract);

async function uploadContract({ contracts }: any, hre: HardhatRuntimeEnvironment) {
  if (contracts === undefined) {
    throw new HardhatPluginError(PLUGIN_NAME, `missing contracts`);
  }
  for (const name of (contracts as string).split(",")) {
    await hre.sentio.upload(name)
  }
}

