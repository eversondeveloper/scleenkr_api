import { defineConfig } from '@prisma/config'
import * as dotenv from 'dotenv'

dotenv.config()
const user = process.env.DB_USER
const password = process.env.DB_PASSWORD
const host = process.env.DB_HOST
const port = process.env.DB_PORT
const name = process.env.DB_NAME

const databaseURL = `postgresql://${user}:${password}@${host}:${port}/${name}?schema=public`
export default defineConfig({
  datasource: {
    url: databaseURL,
  },
})