import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { EntitySchemaService } from './services/entity-schema.service';
import { AnalysisProfileService } from './services/analysis-profile.service';
import { AnalysisRunService } from './services/analysis-run.service';
import { ExtractedEntitiesService } from './services/extracted-entities.service';
import { LangGraphBuilderService } from './services/langgraph-builder.service';
import { EntityExtractionService } from './services/entity-extraction.service';
import { OpenRouterModelsService } from './services/openrouter-models.service';
import { EntitySchemasController } from './controllers/entity-schemas.controller';
import { AnalysisProfilesController } from './controllers/analysis-profiles.controller';
import { AnalysisRunsController } from './controllers/analysis-runs.controller';
import { ExtractedEntitiesController } from './controllers/extracted-entities.controller';
import { OpenRouterModelsController } from './controllers/openrouter-models.controller';

@Module({
  imports: [PrismaModule],
  controllers: [
    EntitySchemasController,
    AnalysisProfilesController,
    AnalysisRunsController,
    ExtractedEntitiesController,
    OpenRouterModelsController,
  ],
  providers: [
    EntitySchemaService,
    AnalysisProfileService,
    AnalysisRunService,
    ExtractedEntitiesService,
    LangGraphBuilderService,
    EntityExtractionService,
    OpenRouterModelsService,
  ],
  exports: [
    EntitySchemaService,
    AnalysisProfileService,
    AnalysisRunService,
    LangGraphBuilderService,
    EntityExtractionService,
    OpenRouterModelsService,
  ],
})
export class AnalysisModule {}
