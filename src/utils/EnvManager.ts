import "dotenv/config";

import { z } from "zod"
import tags from "./Tags.js";

const envSchema = z.object({
    NODE_ENV: z.enum(["PROD", "DEV"]).optional(),
    DISCORD_TOKEN: z.string().optional(),
    DISCORD_CLIENT_ID: z.string().optional()
})

const envParsed = envSchema.safeParse(process.env)

if (envParsed.error || Object.keys(envParsed?.data ?? {}).length == 0) {
    console.log(`[${tags.Error}] Invalid Env Variable.`)
    console.log(envParsed.error)
    throw new Error(`.env not satisfied`)
}

if (envParsed.success) {
    console.log(`[${tags.System}] Env check success.`)
}

export const env = envParsed.data as z.infer<typeof envSchema>;