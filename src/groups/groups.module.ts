import { Module } from '@nestjs/common';
import { GroupsService } from './groups.service';
import { GroupsController } from './groups.controller';
import { DbModule } from '../db/db.module';
import { AccountsModule } from '../accounts/accounts.module';

@Module({
  controllers: [GroupsController],
  providers: [GroupsService],
  imports: [DbModule, AccountsModule],
  exports:[GroupsService]
})
export class GroupsModule {}
