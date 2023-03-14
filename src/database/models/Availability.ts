
export class Availability {
    id!: number;
    status_endpoint_id!: string;
    info!: string;
    time!: number;
    state!: 'outage' | 'impaired' | 'okay';
}