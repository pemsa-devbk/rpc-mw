import { FilterRequest } from "src/common/interfaces";
import { Group } from '../../groups/interfaces';

export interface EventsGroupsRequest {
    groups?: Group[];
    state?: number;
    dateStart?: string;
    dateEnd?: string;
    startQuery?: string;
    endQuery?: string;
    filterIsExclude?: boolean;
    includeScheduled?: boolean;
    includeComments?: boolean;
    separatePartitions?: boolean;
    filters?: FilterRequest[];
    order?: number;
}