import { CompilationJob, DependencyGraph, HardhatRuntimeEnvironment } from "hardhat/types";
import { SentioService } from "./sentio/sentio-service";
import {
    TASK_COMPILE_SOLIDITY_GET_COMPILATION_JOB_FOR_FILE,
    TASK_COMPILE_SOLIDITY_GET_DEPENDENCY_GRAPH,
    TASK_COMPILE_SOLIDITY_GET_SOURCE_NAMES,
    TASK_COMPILE_SOLIDITY_GET_SOURCE_PATHS
} from "hardhat/builtin-tasks/task-names";
import { UploadUserCompilationRequest } from "./sentio/types";
import { readKey } from "./sentio/key";

export class SentioPlugin {
    private env: HardhatRuntimeEnvironment;
    private sentioService: SentioService;

    constructor(hre: HardhatRuntimeEnvironment) {
        console.log("creating sentio plugin");

        this.env = hre;
        const host = this.env.config.sentio?.host || "https://app.sentio.xyz"
        const apiKey = this.env.config.sentio?.apiKey || readKey(host)
        const project = this.env.config.sentio?.project

        console.log("sentio config:", { host, project });

        this.sentioService = new SentioService(host, apiKey)
    }

    public async upload(name: string) {
        console.log("uploading", name)
        const job = await getCompilationJob(this.env, name);
        const source: {[path: string]: string} = {}
        for (const file of job.getResolvedFiles()) {
            source[file.sourceName] = file.content.rawContent
        }
        let req: UploadUserCompilationRequest = {
            projectOwner: undefined,
            projectSlug: undefined,
            name,
            compileSpec: {
                solidityVersion: job.getSolcConfig().version,
                contractName: name,
                multiFile: {
                   compilerSettings: JSON.stringify(job.getSolcConfig().settings),
                   source,
                }
            },
        }
        if (this.env.config.sentio.project) {
            const [owner, slug] = this.env.config.sentio.project?.split("/")
            req.projectOwner = owner
            req.projectSlug = slug
        }
        const res = await this.sentioService.uploadUserCompilation(req)
        console.log("successfully uploaded contract", name, res)
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