import { QuickDB } from "quick.db";
import tags from "../utils/Tags.js";
const processDB = new QuickDB({ table: "processes" })

interface ProcessStructure {
    id?: number,
    name?: string,
    dir?: string
}

function ProcessDB() {
    const chainfineshyt = {
        AddProcess: async ({ id, name, dir }: ProcessStructure) => {
            await processDB.set(`process.${id}`, {
                id,
                name,
                dir
            })

            console.log(`[${tags.ProjectDB}] Added new process: [Name: ${name} | PM2 ID: ${id} | CWD: ${dir}]`)

            return { id, name, dir }
        },
        DeleteProcess: async (query: Pick<ProcessStructure, "id" | "name">) => {
            const { id, name } = query;

            if (typeof id === "number") {
                try {
                    const deletion = await processDB.delete(`process.${id}`);
                    console.log(
                        `[${tags.ProjectDB}] Deleted process by ID: [PM2 ID: ${id}]`
                    );
                    return deletion;
                } catch (err) {
                    console.error(
                        `[${tags.ProjectDB}] Error deleting by ID (${id}):`,
                        err
                    );
                    throw err;
                }
            }

            if (typeof name === "string") {
                try {
                    const allNested = await processDB.get<Record<string, ProcessStructure>>(
                        "process"
                    );
                    if (allNested && typeof allNested === "object") {
                        for (const [key, value] of Object.entries(allNested)) {
                            if (value?.name === name) {
                                const numericId = Number(key);
                                const deletion = await processDB.delete(`process.${key}`);
                                console.log(
                                    `[${tags.ProjectDB}] Deleted process by name: "${name}" (PM2 ID: ${numericId})`
                                );
                                return deletion;
                            }
                        }
                    }

                    console.warn(
                        `[${tags.ProjectDB}] No process found with name="${name}", nothing deleted.`
                    );
                    return null;
                } catch (err) {
                    console.error(
                        `[${tags.ProjectDB}] Error scanning "process" for deletion name="${name}":`,
                        err
                    );
                    throw err;
                }
            }

            console.warn(
                `[${tags.ProjectDB}] DeleteProcess called without valid id or name.`
            );
            return null;
        },

        GetProcess: async ( query: Pick<ProcessStructure, "id" | "name">): Promise<ProcessStructure | null> => {
            const { id, name } = query;

            if (typeof id === "number") {
                try {
                    const record = await processDB.get(id.toString());
                    if (record) {
                        return { ...record, id };
                    }
                } catch (err) {
                    console.error(`[${tags.PM2}] Error fetching by ID (${id}):`, err);
                    throw err;
                }
            }

            if (typeof name === "string") {
                try {
                    const allNested = await processDB.get<Record<string, ProcessStructure>>("process");
                    if (allNested && typeof allNested === "object") {
                        for (const [key, value] of Object.entries(allNested)) {
                            if (value && value.name === name) {
                                const numericId = Number(key);
                                return {
                                    ...value,
                                    id: isNaN(numericId) ? undefined : numericId
                                };
                            }
                        }
                    }
                } catch (err) {
                    console.error(`[${tags.PM2}] Error scanning "process" for name="${name}":`, err);
                    throw err;
                }
            }

            return null;
        },
        GetAllProcess: async () => {
            const records = await processDB.all();

            const processRecord = records.find((r) => r.id === 'process');

            if (processRecord && typeof processRecord.value === 'object') {
                const out = Object.values(processRecord.value);
                return out as ProcessStructure[];
            }

            return [];
        }
    }

    return chainfineshyt
}

export default ProcessDB