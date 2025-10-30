import { IsOptional, IsString, IsUrl, IsObject } from 'class-validator';

export class UpdateChatDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsUrl()
  avatarUrl?: string;

  @IsOptional()
  @IsObject()
  metadata?: any;
}
