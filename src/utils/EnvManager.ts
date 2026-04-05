import "dotenv/config";

import { z } from "zod";
import tags from "./Tags.js";

const envSchema = z.object({
    NODE_ENV: z.enum(["PROD", "DEV"]).optional(),
    DISCORD_TOKEN: z.string().optional(),
    DISCORD_CLIENT_ID: z.string().optional()
});

const envParsed = envSchema.safeParse(process.env);

if (!envParsed.success) {
    const errorTree = z.treeifyError(envParsed.error);
    const missingVars = Object.entries(errorTree.properties ?? {})
        .filter(([, node]) => (node.errors.length || 0) > 0)
        .map(([key]) => key);

    console.log(`[${tags.Error}] Missing environment variables:\n${missingVars.join("\n")}`);
    throw new Error(`Please check your .env file again and make sure all required variables are set.`);
}

console.log(`[${tags.System}] Environment Variable Check Success.`);

export const env = envParsed.data;

