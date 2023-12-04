export interface SearchAccountsRequest {
    accounts?: number[];
    includeZones?: boolean;
    includePartitions?: boolean;
    includeUsers?: boolean;
    includeContacts?: boolean;
    includePanel?: boolean;
    includeSecurity?: boolean;
    includeGeneralData?: boolean;
    includeDeviceZone?: boolean;
    state?: number;
    includeEmail?: boolean;
    includeSchedule?: boolean;
}