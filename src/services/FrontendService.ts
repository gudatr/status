import { RequestData } from 'uws-router';
import Setup from '../database/Setup';
import { Environment } from './Environment';
import { StatusEndpoint } from '../database/models/StatusEndpoint';
import { Availability } from '../database/models/Availability';
import { StatusGroup } from '../database/models/StatusGroup';
import { Post } from '../database/models/Post';

let pool = await Setup(Environment.postgres.threads);
let interval = Environment.history_timeframe_days * 24 * 60 * 60 * 1000;

export default class FrontendService {

    public static async getIntervalData(request: RequestData) {
        let parsedQuery = new URLSearchParams(request.query);
        let time = Number.parseInt(parsedQuery.get('time') ?? '');

        if (isNaN(time)) time = Date.now() - interval;

        let entries: Availability[] = await pool.query('frontend-get-availability', 'SELECT status_endpoint_id as endpoint_id, state, response_time as ms, time FROM availability WHERE time BETWEEN $1 AND $2', [time, time + interval]);

        let endpoints: StatusEndpoint[];

        if (Environment.status.show_endpoint_info) {
            endpoints = await pool.query('frontend-get-endpoints', 'SELECT id, frontend_name as name, status_group_id as group_id FROM status_endpoints', []);
        } else {
            endpoints = await pool.query('frontend-get-endpoints', 'SELECT id, status_group_id as group_id FROM status_endpoints', []);
        }

        let groups: StatusGroup[] = await pool.query('frontend-get-groups', 'SELECT id, frontend_name as name FROM status_endpoints', []);

        let posts: Post[] = await pool.query('frontend-get-posts', 'SELECT id, state, title, html, affected_endpoint_ids as endpoint_id, related_post_id FROM posts', []);

        await request.end(JSON.stringify({ entries, endpoints, groups, posts }), false, 8);
    }
}