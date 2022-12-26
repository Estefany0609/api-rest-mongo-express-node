import "dotenv/config"
import pkg from 'pg';
const { Pool, Client } = pkg;

const connectionString = `postgresql://${process.env.PGUSER}:${process.env.PGPASSWORD}@${process.env.PGHOST}:${process.env.PGPORT}/${process.env.PGDATABASE}?schema=${process.env.PGSCHEMA}`

export const pool = new Pool({
 connectionString,
})
