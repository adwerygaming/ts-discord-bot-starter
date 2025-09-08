import cache from "./Cache.js";

export default {
    SetData: (key: string, data: any) => {
        if (!key || !data) {
            return new Error("No Key or Data Provided.")
        }

        cache.set(key, data)

        return true
    },
    GetData: async (key: string) => {
        if (!key) {
            return new Error("No Key Provided.")
        }

        const data: any | undefined = await cache.get(key)

        return data
    },
    DeleteData: (key: string) => {
        if (!key) {
            return new Error("No Key Provided.")
        }

        const data: any | undefined = cache.get(key)

        cache.delete(key)

        return data
    }
}