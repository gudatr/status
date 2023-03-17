
export class Availability {
    id!: number;
    status_endpoint_id!: string;
    info!: string;
    state!: 'outage' | 'impaired' | 'okay';
    response_time!: number;
    time!: number;
}