
export class Post {
    id!: number;
    state!: 'investigating' | 'identified' | 'update' | 'resolved';
    title!: string;
    html!: string;
    affected!: number[];
    related_post_id!: number;
}