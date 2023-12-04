import { FilterRequest } from "../../common/interfaces";

export interface EventsRequest {
    accounts?: number[];
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