import { FilterRequest } from "src/common/interfaces";

export interface EventsWOAccountRequest {
    dateStart?: string;
    dateEnd?: string;
    startQuery?: string;
    endQuery?: string;
    filterIsExclude?: boolean;
    filters?: FilterRequest[];
    order?: number;
}