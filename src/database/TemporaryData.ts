import { v7 as uuidv7 } from "uuid"
import cache from "./Cache.js"

interface SetDataProp<T> {
    key: string
    data: T
}

interface GetDataProp {
    key: string
}

interface DeleteDataProp {
    key: string
}

export default {
    /**
     * Generate a random unique key using UUID v7
     * @returns string - generated unique key
     */
    GenerateRandomKey(): string {
        return uuidv7()
    },

    /**
     * Set data in cache
     * @param data Data to set in cache
     * @param key Key to identify the data in cache. Use GenerateRandomKey() to get a random unique key. 
     * @returns 
     */
    SetData<T>({ data, key }: SetDataProp<T>): true {
        cache.set(key, data)
        return true
    },

    /**
     * Get data from cache
     * @param key Key to identify the data in cache 
     * @returns T | undefined - data if found, undefined if not found
     */
    async GetData<T>({ key }: GetDataProp): Promise<T | undefined> {
        const res: T | undefined = await cache.get(key) as T | undefined
        return res
    },

    /**
        * Delete data from cache
        * @param key Key to identify the data in cache
        * @returns T | undefined - data if found, undefined if not found
        */
    DeleteData<T>({ key }: DeleteDataProp): T | undefined {
        const data: T | undefined = cache.get(key) as T | undefined
        cache.delete(key)
        return data
    }
}
