import {
  IsString,
  IsOptional,
  MinLength,
  MaxLength,
} from 'class-validator';

export class AddAliasDto {
  @IsString()
  platformId: string;

  @IsString()
  @MinLength(1)
  @MaxLength(500)
  providerUserId: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  providerUserDisplay?: string;
}
