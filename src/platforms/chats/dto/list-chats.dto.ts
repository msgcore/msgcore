import { IsOptional, IsEnum, IsInt, Min, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ChatType } from '@prisma/client';

export class ListChatsDto {
  @IsOptional()
  @IsString()
  platformId?: string;

  @IsOptional()
  @IsEnum(ChatType)
  chatType?: ChatType;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number;

  @IsOptional()
  @IsString()
  search?: string;
}
