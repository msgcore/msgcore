import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { EntitySchemaService } from './services/entity-schema.service';
import { LangGraphBuilderService } from './services/langgraph-builder.service';
import { EntityExtractionService } from './services/entity-extraction.service';
import { EntitySchemasController } from './controllers/entity-schemas.controller';

@Module({
  imports: [PrismaModule],
  controllers: [EntitySchemasController],
  providers: [
    EntitySchemaService,
    LangGraphBuilderService,
    EntityExtractionService,
  ],
  exports: [
    EntitySchemaService,
    LangGraphBuilderService,
    EntityExtractionService,
  ],
})
export class AnalysisModule {}
