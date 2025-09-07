import { QuickDB } from "quick.db";
const temporaryDB = new QuickDB({ table: "temporary" })

export default function TemporaryDB() {
    const tempe_tempe_apa_yang_rary_ya_temporary_xixixixi = {
        SetData: async (key: string, data: any) => {
            if (!key || !data) {
                return new Error("Please provide both key & data.")
            }

            try {
                await temporaryDB.set(key, data)
            } catch (e) {
                return e
            }

            return data
        },
        GetData: async (key: string) => {
            if (!key) {
                return new Error("Please provide key.")
            }

            const data = await temporaryDB.get(key)

            return data
        },
        DeleteData: async (key: string) => {
            if (!key) {
                return new Error("Please provide key.")
            }

            try {
                const deletion = await temporaryDB.delete(key)

                if (deletion) {
                    return true
                } else {
                    return false
                }
            } catch (e) {
                return e
            }
        }
    }

    return tempe_tempe_apa_yang_rary_ya_temporary_xixixixi
}