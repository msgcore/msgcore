import { IsString, IsOptional, IsArray, IsDateString, IsIn } from 'class-validator';

export class CreateAnalysisRunDto {
  @IsString()
  profileId: string;

  @IsIn(['message', 'chat', 'identity', 'date_range'])
  targetType: 'message' | 'chat' | 'identity' | 'date_range';

  @IsArray()
  @IsString({ each: true })
  targetIds: string[];

  @IsOptional()
  @IsDateString()
  dateRangeStart?: string;

  @IsOptional()
  @IsDateString()
  dateRangeEnd?: string;
}
