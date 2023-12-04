import { FilterRequest } from "../../common/interfaces";

export interface LastEventRequest {
    accounts?: number[];
    state?: number;
    filterIsExclude?: boolean;
    separatePartitions?: boolean;
    filters?: FilterRequest[];
    dateStart?: string;
    dateEnd?: string;
    startQuery?: string;
    endQuery?: string;
}