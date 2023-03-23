
export class Post {
    id!: number;
    state!: 'investigating' | 'identified' | 'update' | 'resolved';
    title!: string;
    html!: string;
    affected_endpoint_ids!: number[];
    related_post_id!: number;
    time!: number;
}