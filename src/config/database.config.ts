import 'dotenv/config'
import { Pool } from 'pg'

import { PrismaPg } from '@prisma/adapter-pg'

export function iniciarAdapatador(): PrismaPg {
    const connectionString = process.env.DATABASE_URL!
    const pool = new Pool({
        connectionString,
    })

    const adapter = new PrismaPg(pool)
    return adapter
}
