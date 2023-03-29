import Postgres from 'pg-pool-minimal';
import { Environment } from '../services/Environment';

export default async function TableSetup(pool: Postgres): Promise<boolean> {

    let table_columns = await pool.query('table-info',
        `SELECT column_name FROM information_schema.columns
        WHERE table_schema = $1
        AND table_name = $2;`, [Environment.postgres.schema, Environment.postgres.setup.status_endpoints_table]);

    if (table_columns.length === 0) {
        let client = await pool.connect();

        console.log("Running table setup");

        try {
            await client.queryString(`
            CREATE TABLE ${Environment.postgres.setup.status_endpoints_table} (
                id SERIAL PRIMARY KEY,
                url VARCHAR(2048),
                name VARCHAR(256),
                frontend_name VARCHAR(256),
                headers VARCHAR(2048),
                body VARCHAR(2048),
                status_group_id INTEGER)`);

            await client.queryString(`
            CREATE TABLE ${Environment.postgres.setup.availability_table} (
                id SERIAL PRIMARY KEY,
                status_endpoint_id INTEGER,
                info VARCHAR(${Environment.postgres.setup.availability_table_info_size}),
                state VARCHAR(10),
                response_time INTEGER,
                time BIGINT)`);

            await client.queryString(`
            CREATE TABLE ${Environment.postgres.setup.posts_table} (
                id SERIAL PRIMARY KEY,
                state VARCHAR(32),
                title VARCHAR(256),
                html VARCHAR(4096),
                affected_endpoint_ids INTEGER[],
                related_post_id INTEGER,
                time BIGINT)`);

            await client.queryString(`
            CREATE TABLE ${Environment.postgres.setup.status_groups_table} (
                id SERIAL PRIMARY KEY,
                name VARCHAR(256),
                frontend_name VARCHAR(256),
                display_detailed_info BOOLEAN)`);

            await client.queryString(`
            CREATE INDEX availability_time_index ON ${Environment.postgres.setup.availability_table} USING BTREE(time)`);

            await client.queryString(`
            CREATE INDEX posts_time_index ON ${Environment.postgres.setup.posts_table} USING BTREE(time)`);

            console.log("Completed table setup");
        } catch (err) {
            console.log("Table setup failed", err);
        }
    } else {
        console.log("Skipping table setup");
    }
    return true;
}