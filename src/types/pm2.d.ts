import "pm2"

type ProcStatusTypes = "online" | "stopping” | “stopped” | “launching” | “errored” | “one-launch-status"

declare module "pm2" {
    export interface Proc {
        name: string,
        namespace: string,
        pm_id: number,
        status: ProcStatusTypes,
        restart_time: number,
        pm2_env: {
            name: string,
            namespace: string,
            pm_id: number,
            status: ProcStatusTypes,
            restart_time: number,
            env: any
        }
    }

    export type ProcList = Proc[]
}