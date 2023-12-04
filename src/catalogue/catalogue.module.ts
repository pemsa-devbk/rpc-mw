import { Module } from '@nestjs/common';
import { CatalogueService } from './catalogue.service';
import { CatalogueController } from './catalogue.controller';
import { DbModule } from '../db/db.module';

@Module({
  controllers: [CatalogueController],
  providers: [CatalogueService],
  imports: [DbModule],
})
export class CatalogueModule {}
