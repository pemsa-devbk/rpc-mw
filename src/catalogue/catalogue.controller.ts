import { Controller } from '@nestjs/common';
import { CatalogueService } from './catalogue.service';
import { GrpcMethod } from '@nestjs/microservices';

@Controller()
export class CatalogueController {
  constructor(private readonly catalogueService: CatalogueService) {}

  @GrpcMethod('DbService')
  async getCatalogueAlarms(){
    const alarms = await this.catalogueService.getAlarms();
    return {
      alarms,
    };
  }

  @GrpcMethod('DbService')
  async getCatalogueEvents(){
    const events = await this.catalogueService.getEvents();
    return {
      events,
    };
  }
}
