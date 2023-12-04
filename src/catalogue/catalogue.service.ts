import { Injectable } from '@nestjs/common';
import { DbService } from '../db/db.service';

@Injectable()
export class CatalogueService {
  constructor(private readonly dbService: DbService) {}

  async getAlarms() {
    return await this.dbService.getAlarmsCAT();
  }
  async getEvents() {
    return await this.dbService.getEventsCAT();
  }
}
