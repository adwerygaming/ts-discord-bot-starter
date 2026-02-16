import { LRUCache } from 'lru-cache'

const options = {
    max: 1500,
    ttl: 1000 * 60 * 5,
    ttlAutopurge: true,

    allowStale: false,
    updateAgeOnGet: false,
    updateAgeOnHas: false,
} as const

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const cache = new LRUCache<string, any>(options)

export default cache