import Setup from '../database/Setup';
import { Environment } from './Environment';
import { StatusEndpoint } from '../database/models/StatusEndpoint';

const pool = await Setup(Environment.postgres.threads);

await pool.initialize();

export default class StatusService {

    static endpoints: StatusEndpoint[];

    private static async getEndpoints() {
        this.endpoints = await pool.query('get-status-endpoints', `SELECT * FROM ${Environment.postgres.status_endpoints_table}`, [])
    }

    public static async fetchStatus() {
        this.getEndpoints();

        let promises = [];

        for (let endpoint of this.endpoints) {
            promises.push(fetch(endpoint.url, {
                body: endpoint.body
            }).catch((error) => {
                return new Response(JSON.stringify({
                    message: error.message
                }), {
                    status: 400,
                    statusText: 'Network Error'
                });
            }));
        }

        let results = await Promise.all(promises);

        for (let i = 0; i < this.endpoints.length; i++) {
            let endpoint = this.endpoints[i];
            let result = results[i];

            if (!result.ok) {

            }

            await this.writeAvailability(endpoint, 'okay', '');
        }
    }

    private static async writeAvailability(endpoint: StatusEndpoint, state: 'outage' | 'impaired' | 'okay', info: string) {
        await pool.query('write-availability', `
        INSERT INTO ${Environment.postgres.status_endpoints_table} (status_endpoint_id, state, info, time)
        VALUES ($1,$2,$3,$4)`, [endpoint.id, state, info, Date.now()]);
    }
}
