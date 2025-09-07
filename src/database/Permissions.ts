import { User } from "discord.js"
import { QuickDB } from "quick.db";
const permissionDB = new QuickDB({ table: "permissions" })

function PermissionDB() {
    const permissionfineshyt = {
        AddWhitelistUser: async (user: User) => {
            await permissionDB.set(`user.${user.id}`, user)

            return user
        },
        DeleteWhitelistUser: async (userID: User["id"]) => {
            const data = await permissionDB.get(`user.${userID}`)
            const deletion = await permissionDB.delete(`user.${userID}`)

            if (deletion) {
                return data as User
            } else {
                return null
            }
        },
        GetWhitelistUser: async (userID: User["id"]) => {
            // get by id
            const data = await permissionDB.get(`user.${userID}`)

            return data as User
        },
        GetWhitelistUsers: async () => {
            const records = await permissionDB.all()

            const processRecord = records.find((r) => r.id === 'user');

            if (processRecord && typeof processRecord.value === 'object') {
                const out = Object.values(processRecord.value);
                return out as User[];
            }

            return []
        }
    }

    return permissionfineshyt
}

export default PermissionDB