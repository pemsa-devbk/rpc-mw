import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { DbModule } from './db/db.module';
import { AccountsModule } from './accounts/accounts.module';
import { CommonModule } from './common/common.module';
import { GroupsModule } from './groups/groups.module';
import { EventsModule } from './events/events.module';
import { ConfigModule } from '@nestjs/config';
import { CatalogueModule } from './catalogue/catalogue.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    DbModule, 
    AccountsModule, 
    CommonModule, 
    GroupsModule, 
    EventsModule, 
    CatalogueModule
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
