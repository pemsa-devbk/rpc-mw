export interface AccountRequest {
    account: number;
    includeZones: boolean;
    includePartitions: boolean;
    includeUsers: boolean;
    includeContacts: boolean;
    includePanel: boolean;
    includeSecurity: boolean;
    includeGeneralData: boolean;
    includeDeviceZone: boolean;
    includeEmail: boolean;
    includeSchedule: boolean;
}