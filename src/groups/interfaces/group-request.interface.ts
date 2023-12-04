import { Group } from "./group.interface";

export interface GroupRequest {
    group: Group;
    includeAccounts?: boolean;
    includeZones?: boolean;
    includePartitions?: boolean;
    includeUsers?: boolean;
    includeContacts?: boolean;
    includePanel?: boolean;
    includeSecurity?: boolean;
    includeGeneralData?: boolean;
    includeDeviceZone?: boolean;
    includeEmail?: boolean;
    includeSchedule?: boolean;
    state?: number;
}
