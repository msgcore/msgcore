import { IsString, IsOptional, IsArray, IsDateString } from 'class-validator';

export class CreateAnalysisRunDto {
  @IsString()
  profileId: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  chatIds?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  identityIds?: string[];

  @IsOptional()
  @IsDateString()
  dateRangeStart?: string;

  @IsOptional()
  @IsDateString()
  dateRangeEnd?: string;
}
