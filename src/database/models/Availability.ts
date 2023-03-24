
export default class Availability {
    id!: number;
    status_endpoint_id!: string;
    info!: string;
    state!: AvailabilityStates;
    response_time!: number;
    time!: number;
}

export enum AvailabilityStates {
    Outage = 'outage',
    Impaired = 'impaired',
    Okay = 'okay'
}