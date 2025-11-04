import { IsOptional, IsDateString, IsInt, Min, Max, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class SyncHistoryDto {
  @IsOptional()
  @IsString()
  platformId?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(1000)
  limit?: number;
}
