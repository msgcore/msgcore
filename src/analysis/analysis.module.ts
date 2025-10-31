import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { EntitySchemaService } from './services/entity-schema.service';
import { AnalysisProfileService } from './services/analysis-profile.service';
import { LangGraphBuilderService } from './services/langgraph-builder.service';
import { EntityExtractionService } from './services/entity-extraction.service';
import { EntitySchemasController } from './controllers/entity-schemas.controller';
import { AnalysisProfilesController } from './controllers/analysis-profiles.controller';

@Module({
  imports: [PrismaModule],
  controllers: [EntitySchemasController, AnalysisProfilesController],
  providers: [
    EntitySchemaService,
    AnalysisProfileService,
    LangGraphBuilderService,
    EntityExtractionService,
  ],
  exports: [
    EntitySchemaService,
    AnalysisProfileService,
    LangGraphBuilderService,
    EntityExtractionService,
  ],
})
export class AnalysisModule {}
