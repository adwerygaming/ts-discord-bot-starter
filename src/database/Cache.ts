import { LRUCache } from 'lru-cache'

const options = {
    max: 1500,
    dispose: async (_value: any, _key: string) => {
        // log if cache is disposed
    },

    onInsert: (_value: any, _key: string) => {
        // log when new cache is inserted
    },

    ttl: 1000 * 60 * 5,
    ttlAutopurge: true,

    allowStale: false,
    updateAgeOnGet: false,
    updateAgeOnHas: false,
} as const

const cache = new LRUCache<string, any>(options)

export default cache