import { Artifact, CompilationJob, DependencyGraph, HardhatRuntimeEnvironment } from "hardhat/types";
import { SentioService } from "./sentio/sentio-service";
import {
    TASK_COMPILE_SOLIDITY_GET_COMPILATION_JOB_FOR_FILE,
    TASK_COMPILE_SOLIDITY_GET_DEPENDENCY_GRAPH,
    TASK_COMPILE_SOLIDITY_GET_SOURCE_NAMES,
    TASK_COMPILE_SOLIDITY_GET_SOURCE_PATHS
} from "hardhat/builtin-tasks/task-names";

export class SentioPlugin {
    public env: HardhatRuntimeEnvironment;

    private sentioService: SentioService;

    constructor(hre: HardhatRuntimeEnvironment) {
        console.log("creating sentio plugin");

        this.env = hre;
        this.sentioService = new SentioService(
            this.env.config.sentio.host || "https://app.sentio.xyz",
            this.env.config.sentio.apiKey)

        console.log("created sentio plugin");
    }

    public async upload(name: string) {
        // const req = {
        //     projectOwner: this.env.config.sentio.projectOwner,
        //     projectSlug: this.env.config.sentio.projectSlug,
        //     name,
        //     compileSpec: undefined,
        // }
        const job = await getCompilationJob(this.env, name);
        // const artifact: Artifact = this.env.artifacts.readArtifactSync(name);
        const sources: {[path: string]: string} = {}
        for (const file of job.getResolvedFiles()) {
            sources[file.absolutePath] = file.content.rawContent
        }
        const dbg = {
            name,
            compilerSettings: job.getSolcConfig().settings,
            version: job.getSolcConfig().version,
            sources,
        }
        console.dir(dbg, { depth: null })

        // const res = await this.sentioService.uploadUserCompilation(req)
    }
}

async function getCompilationJob(
    hre: HardhatRuntimeEnvironment,
    contractName: string
): Promise<CompilationJob> {
    const dependencyGraph: DependencyGraph = await getDependencyGraph(hre);

    const artifact = hre.artifacts.readArtifactSync(contractName);
    const file = dependencyGraph.getResolvedFiles().find((resolvedFile) => {
        return resolvedFile.sourceName === artifact.sourceName;
    });

    return hre.run(TASK_COMPILE_SOLIDITY_GET_COMPILATION_JOB_FOR_FILE, {
        dependencyGraph,
        file,
    });
};

async function getDependencyGraph(hre: HardhatRuntimeEnvironment): Promise<DependencyGraph> {
    const sourcePaths = await hre.run(TASK_COMPILE_SOLIDITY_GET_SOURCE_PATHS);
    const sourceNames: string[] = await hre.run(TASK_COMPILE_SOLIDITY_GET_SOURCE_NAMES, {
        sourcePaths,
    });
    return hre.run(TASK_COMPILE_SOLIDITY_GET_DEPENDENCY_GRAPH, {
        sourceNames,
    });
}