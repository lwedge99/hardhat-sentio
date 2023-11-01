import { extendEnvironment } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { lazyObject } from "hardhat/plugins";
import { SentioPlugin } from "./sentio-plugin";
import "./type-extensions";
import "./tasks";

extendEnvironment((hre: HardhatRuntimeEnvironment) => {
  console.log(`setting up hardhat-sentio plugin.`);

  hre.sentio = lazyObject(() => new SentioPlugin(hre));

  console.log("running configuration:", {
    host: hre.config.sentio?.host,
    project: hre.config.sentio?.project
  });

  console.log("setup finished.");
});