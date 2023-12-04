import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { GroupsService } from './groups.service';
import { GroupRequest, SearchRequest } from './interfaces';


@Controller()
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) { }

  @GrpcMethod('DbService')
  async findOneGroup(data: GroupRequest) {

    if (!data.group) {
      throw new RpcException('Debe de proporcionar un grupo a buscar');
    }
    const resp = await this.groupsService.getGroup(data);

    return resp;
  }

  @GrpcMethod('DbService')
  async searchGroups(data: SearchRequest) {
    
    const resp = await this.groupsService.searchGroups(data);
    return {
      groups: resp
    };
  }

}
