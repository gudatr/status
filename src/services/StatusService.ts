import { Environment } from './Environment';
import { StatusEndpoint } from '../database/models/StatusEndpoint';
import { AvailabilityStates } from '../database/models/Availability';
import Postgres from 'postgres-pool';

export default class StatusService {

    private endpoints: StatusEndpoint[] = [];

    constructor(private pool: Postgres) { }

    private async getEndpoints() {
        this.endpoints = await this.pool.query('get-status-endpoints', `SELECT * FROM ${Environment.postgres.setup.status_endpoints_table}`, [])
    }

    public async fetchStatus() {
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
                state = result.ok ? data.state : AvailabilityStates.Impaired;
                message = data.message ?? '-';
            } catch (err: any) {
                state = AvailabilityStates.Impaired;
                message = err.message ?? 'Error';
            }

            if (!(state in AvailabilityStates)) {
                state = AvailabilityStates.Impaired;
            }

            await this.writeAvailability(endpoint, state, message, response_times[i]);
        }
    }

    private async writeAvailability(endpoint: StatusEndpoint, state: string, info: string, response_time: number) {
        await this.pool.query('write-availability', `
        INSERT INTO ${Environment.postgres.setup.availability_table} (status_endpoint_id, state, info, response_time, time)
        VALUES ($1,$2,$3,$4,$5)`, [endpoint.id, state, info, response_time, Date.now()]);
    }
}
