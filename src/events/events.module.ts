import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { DbModule } from '../db/db.module';
import { AccountsModule } from '../accounts/accounts.module';
import { GroupsModule } from '../groups/groups.module';

@Module({
  controllers: [EventsController],
  providers: [EventsService],
  imports:[ DbModule, AccountsModule, GroupsModule]
})
export class EventsModule {}
