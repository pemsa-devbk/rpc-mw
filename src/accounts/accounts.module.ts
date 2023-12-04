import { Module } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { AccountsController } from './accounts.controller';
import { DbModule } from '../db/db.module';

@Module({
  controllers: [AccountsController],
  providers: [AccountsService],
  imports: [DbModule],
  exports: [AccountsService],
})
export class AccountsModule {}
