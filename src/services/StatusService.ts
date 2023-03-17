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
        await this.getEndpoints();

        let promises = [];
        let response_times: number[] = [];
        let id = 0;

        for (let endpoint of this.endpoints) {
            let currentId = ++id;

            response_times[currentId] = Date.now();

            promises[currentId] = fetch(endpoint.url, {
                signal: AbortSignal.timeout(Environment.status_timeout),
                cache: 'no-cache',
                body: endpoint.body
            }).catch((error) => {
                return new Response(JSON.stringify({
                    message: error.message
                }), {
                    status: 400,
                    statusText: 'Network Error'
                });
            }).finally(() => {
                response_times[currentId] = Math.max(0, Date.now() - response_times[currentId]);
            });
        }

        let results = await Promise.all(promises);

        for (let i = 0; i < this.endpoints.length; i++) {
            let endpoint = this.endpoints[i];
            let result = results[i];
            let state: string;
            let message: string;

            try {
                let data = await result.json();
                state = result.ok ? (data.state ?? 'okay') : 'outage';
                message = data.message ?? '-';
            } catch (err: any) {
                state = 'impaired';
                message = err.message ?? 'Error';
            }

            await this.writeAvailability(endpoint, state, message, response_times[i]);
        }
    }

    private static async writeAvailability(endpoint: StatusEndpoint, state: string, info: string, response_time: number) {
        await pool.query('write-availability', `
        INSERT INTO ${Environment.postgres.status_endpoints_table} (status_endpoint_id, state, info, response_time, time)
        VALUES ($1,$2,$3,$4,$5)`, [endpoint.id, state, info, response_time, Date.now()]);
    }
}
