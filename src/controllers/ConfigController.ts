import { RequestData } from 'uws-router';
import { Environment } from '../services/Environment';
import { StatusEndpoint } from '../database/models/StatusEndpoint';
import { StatusGroup } from '../database/models/StatusGroup';
import { Post } from '../database/models/Post';
import Postgres from 'pg-pool-minimal';

export default class ConfigController {

    constructor(private pool: Postgres) { }

    public async authTest(request: RequestData) {
        await request.end('OK');
    }

    public async updatePost(request: RequestData) {
        let model: Post = JSON.parse(request.data);
        let id: any[];

        if (!model.id) {
            id = await this.pool.query('create-status-endpoint',
                `INSERT INTO ${Environment.postgres.setup.posts_table}
                (state, title, html, affected_endpoint_ids, related_post_id, time)
                VALUES
                ($1,$2,$3,$4,$5,$6) RETURNING id`,
                [model.state, model.title, model.html, model.affected_endpoint_ids, model.related_post_id, Date.now()]);

        } else if (request.method === 'DELETE') {
            id = await this.pool.query('delete-status-endpoint',
                `DELETE FROM ${Environment.postgres.setup.posts_table}
                 WHERE id=$1 RETURNING id`, [model.id]);

        } else {
            id = await this.pool.query('update-status-endpoint',
                `UPDATE ${Environment.postgres.setup.posts_table}
                SET state=$1, title=$2, html=$3, affected_endpoint_ids=$3, related_post_id=$4
                WHERE id=$5 RETURNING id`,
                [model.state, model.title, model.html, model.affected_endpoint_ids, model.related_post_id, model.id]);
        }

        await request.end(id.pop().id, false);
    }

    public async getPosts(request: RequestData) {
        request.end(JSON.stringify(await this.pool.query('get-posts', `SELECT * FROM ${Environment.postgres.posts_table}`, [])), false, 9);
    }

    public async updateStatusEndpoint(request: RequestData) {
        let model: StatusEndpoint = JSON.parse(request.data);
        let id: any[];

        if (!model.id) {
            id = await this.pool.query('create-status-endpoint',
                `INSERT INTO ${Environment.postgres.setup.status_groups_table}
                (url, name, frontend_name, headers, body, status_group_id)
                VALUES
                ($1,$2,$3,$4,$5,$6) RETURNING id`,
                [model.url, model.name, model.frontend_name, model.headers, model.body, model.status_group_id]);

        } else if (request.method === 'DELETE') {
            id = await this.pool.query('delete-status-endpoint',
                `DELETE FROM ${Environment.postgres.setup.status_endpoints_table}
                 WHERE id=$1 RETURNING id`, [model.id]);

        } else {
            id = await this.pool.query('update-status-endpoint',
                `UPDATE ${Environment.postgres.setup.status_endpoints_table}
                SET url=$1, name=$2, frontend_name=$3, headers=$3, body=$4, status_group_id=$5
                WHERE id=$6 RETURNING id`,
                [model.url, model.name, model.frontend_name, model.headers, model.body, model.status_group_id, model.id]);
        }

        await request.end(id.pop().id, false);
    }

    public async getStatusEndpoints(request: RequestData) {
        request.end(JSON.stringify(await this.pool.query('get-status-endpoints', `SELECT * FROM ${Environment.postgres.status_endpoints_table}`, [])), false, 9);
    }

    public async updateStatusGroup(request: RequestData) {
        let model: StatusGroup = JSON.parse(request.data);
        let id: any[];

        if (!model.id) {
            id = await this.pool.query('create-status-group',
                `INSERT INTO ${Environment.postgres.setup.status_groups_table}
                (name, frontend_name)
                VALUES
                ($1,$2) RETURNING id`, [model.name, model.frontend_name]);

        } else if (request.method === 'DELETE') {
            id = await this.pool.query('delete-status-group',
                `DELETE FROM ${Environment.postgres.setup.status_groups_table}
                 WHERE id=$1 RETURNING id`, [model.id]);

        } else {
            id = await this.pool.query('update-status-group',
                `UPDATE ${Environment.postgres.setup.status_groups_table}
                SET name=$1, frontend_name=$2
                WHERE id=$3 RETURNING id`, [model.name, model.frontend_name, model.id]);
        }

        await request.end(id.pop().id, false);
    }

    public async getStatusGroups(request: RequestData) {
        request.end(JSON.stringify(await this.pool.query('get-status-groups', `SELECT * FROM ${Environment.postgres.setup.status_groups_table}`, [])), false, 9);
    }
}
