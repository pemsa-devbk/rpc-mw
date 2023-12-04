import { FilterRequest } from "../../common/interfaces";
import { Group } from '../../groups/interfaces';

export interface LastEventGroupRequest {
    groups?: Group[];
    state?: number;
    filterIsExclude?: boolean;
    separatePartitions?: boolean;
    filters?: FilterRequest[];
    dateStart?: string;
    dateEnd?: string;
    startQuery?: string;
    endQuery?: string;
}