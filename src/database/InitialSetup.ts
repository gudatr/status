import Postgres from 'postgres-pool';
import { Environment } from '../services/Environment';

export default async function TableSetup(pool: Postgres): Promise<boolean> {

    let table_columns: { column_name: string }[] = await pool.query('table-info',
        `SELECT column_name FROM information_schema.columns
        WHERE table_schema = $1
        AND table_name = $2;`, [Environment.postgres.schema, Environment.postgres.logs_table]);
    if (table_columns.length === 0) {
        let client = await pool.connect();

        try {
            await client.queryString(`
            CREATE TABLE ${Environment.postgres.logs_table} (
                id BIGSERIAL PRIMARY KEY,
                level SMALLINT,
                time BIGINT,
                server VARCHAR(${Environment.postgres.column_server_size}),
                channel VARCHAR(${Environment.postgres.column_channel_size}),
                message VARCHAR(256),
                data VARCHAR(4096),
                search TSVECTOR);`);

        } catch (err) {

        }
    } else {

    }
    return true;
}