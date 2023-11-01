import {
    UploadUserCompilationRequest,
    UploadUserCompilationResponse,
    VerifyContractRequest,
    VerifyContractResponse
} from "./types/api";

export class SentioService {
    public host: string
    private readonly apiKey?: string

    constructor(host: string, apiKey?: string) {
        this.host = host
        this.apiKey = apiKey || process.env.SENTIO_API_KEY
    }

    public async uploadUserCompilation(req: UploadUserCompilationRequest): Promise<UploadUserCompilationResponse> {
        const url = this.host + "/api/v1/solidity/user_compilation"
        const res = await fetch(url, {
            method: "POST",
            headers: this.getHeaders(),
            body: JSON.stringify(req),
        })
        if (!res.ok) {
            throw new Error(`failed to upload user compilation: ${res.status} ${res.statusText}`)
        }
        return await res.json() as UploadUserCompilationResponse
    }

    public async verifyContract(req: VerifyContractRequest): Promise<VerifyContractResponse> {
        const url = this.host + "/api/v1/solidity/verification"
        const res = await fetch(url, {
            method: "POST",
            headers: this.getHeaders(),
            body: JSON.stringify(req)
        })
        if (!res.ok) {
            throw new Error(`failed to verify contract: ${res.status} ${res.statusText}`)
        }
        return await res.json() as VerifyContractResponse
    }

    private getHeaders(): {[k: string]: string} {
        let ret: Record<string, string> = {
            "Content-Type": "application/json",
        }
        if (this.apiKey) {
            ret["api-key"] = this.apiKey
        }
        return ret
    }
}