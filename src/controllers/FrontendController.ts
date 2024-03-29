import { RequestData } from 'uws-router';
import { Environment } from '../services/Environment';
import { StatusEndpoint } from '../database/models/StatusEndpoint';
import Availability from '../database/models/Availability';
import { StatusGroup } from '../database/models/StatusGroup';
import { Post } from '../database/models/Post';
import Postgres from 'pg-pool-minimal';

let interval = 24 * 60 * 60 * 1000;
let matchDateRegEx = /[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])/;

export default class FrontendController {

    constructor(private pool: Postgres) { }

    public async getIntervalData(request: RequestData) {
        let parsedQuery = new URLSearchParams(request.query);
        let date = parsedQuery.get('date') ?? '';

        let time = this.transformDate(date);

        if (time === undefined || time < 0) {
            request.writeStatus('400 Bad Request');
            request.end('Provided date parameter does not match YYYY-MM-DD');
            return;
        }

        let entries: Availability[] = await this.pool.query('frontend-get-availability', `
        SELECT status_endpoint_id as endpoint_id, state, response_time as ms, time FROM ${Environment.postgres.setup.availability_table} WHERE time BETWEEN $1 AND $2`, [time, time + interval]);

        let endpoints: StatusEndpoint[];

        if (Environment.status.show_endpoint_name) {
            endpoints = await this.pool.query('frontend-get-endpoints', `
            SELECT id, frontend_name as name, status_group_id as group_id FROM ${Environment.postgres.setup.status_endpoints_table}`, []);
        } else {
            endpoints = await this.pool.query('frontend-get-endpoints', `
            SELECT id, status_group_id as group_id FROM ${Environment.postgres.setup.status_endpoints_table}`, []);
        }

        let groups: StatusGroup[] = await this.pool.query('frontend-get-groups', `
        SELECT id, frontend_name as name FROM ${Environment.postgres.setup.status_groups_table}`, []);

        let posts: Post[] = await this.pool.query('frontend-get-posts', `
        SELECT id, state, title, html, affected_endpoint_ids as endpoint_id, related_post_id FROM ${Environment.postgres.setup.posts_table} WHERE time BETWEEN $1 AND $2`, [time, time + interval]);

        await request.end(JSON.stringify({ entries, endpoints, groups, posts }), false, 9);
    }

    public async getIntervalOverview(request: RequestData) {
        let data = await this.pool.query('frontend-overview',
            `SELECT
            state,
            COUNT(*) as count,
            FLOOR(time / $1) as interval
            FROM ${Environment.postgres.setup.availability_table}
            GROUP BY interval, state
            ORDER BY interval DESC`, [interval]);

        await request.end(JSON.stringify({ data, interval }), false, 9);
    }

    private transformDate(date: string): number | undefined {
        date = date.substring(0, 10);
        if (!matchDateRegEx.test(date)) return undefined;
        return Date.parse(date + ' 23:59:00');
    }
}
