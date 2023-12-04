import { Controller } from '@nestjs/common';
import { EventsService } from './events.service';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { EventsGroupsRequest, EventsRequest, LastEventRequest, LastEventGroupRequest, EventsWOAccountRequest } from './interfaces';

@Controller()
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @GrpcMethod('DbService')
  async getEventsFromGroup(data: EventsGroupsRequest) {
    
    if (!data.dateStart) {
      throw new RpcException('Debe de proporcionar una fecha inicial de consulta');
    }
    if (!data.dateEnd) {
      throw new RpcException('Debe de proporcionar una fecha final de consulta');
    }
    

    const resp = await this.eventsService.getEventsFromGroup(data);
    return {
      data: resp
    };
  }

  @GrpcMethod('DbService')
  async getEventsWithAccounts(data: EventsRequest) {
    if (!data.dateStart) {
      throw new RpcException('Debe de proporcionar una fecha inicial de consulta');
    }
    if (!data.dateEnd) {
      throw new RpcException('Debe de proporcionar una fecha final de consulta');
    }

    const resp = await this.eventsService.getEventsWithAccounts(data);

    return {
      data: resp
    };
  }

  @GrpcMethod('DbService')
  async getLastEventFromGroup(data: LastEventGroupRequest) {
    

    const resp = await this.eventsService.getLastEventsGroups(data);

    return {
      data: resp
    };
  }

  @GrpcMethod('DbService')
  async getLasEventFromAccount(data: LastEventRequest) {

    const resp = await this.eventsService.getLastEventsWithAccounts(data);

    return {
      data: resp
    };
  }

  @GrpcMethod('DbService')
  async getEventsWithOutAccounts(data: EventsWOAccountRequest) {
    if (!data.dateStart) {
      throw new RpcException('Debe de proporcionar una fecha inicial de consulta');
    }
    if (!data.dateEnd) {
      throw new RpcException('Debe de proporcionar una fecha final de consulta');
    }
    const resp = await this.eventsService.getEventsWOAccount(data);
    return {
      data: resp
    };
  }


}
