// docker run [OPTIONS] IMAGE[:TAG|@DIGEST] [COMMAND]
import {IDockerRunParams} from "./type";

export function generateRunCommand(params: IDockerRunParams): string {
    const ports = params.publishAllPorts ? " -P" : params.ports ? `-p=${params.ports}` : "";
    const options = `--name ${params.name}${params.detached ? " -d" : ""}${
        params.privileged ? ` --privileged=${params.privileged}` : ""
    }${params.ipc ? ` --ipc="${params.ipc}"` : ""}${params.restart ? ` --restart=${params.restart}` : ""}${ports}`;
    return `${options} ${params.image} ${params.cmd ? params.cmd : ""}`;
}

export function extractDockerVersion(dockerLog: string): string | null {
    const regexp = /docker version (\d+\.\d+\.\d+)/.exec(dockerLog.toLowerCase());
    return regexp ? regexp[1] : null;
}