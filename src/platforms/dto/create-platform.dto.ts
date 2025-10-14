import {
  IsString,
  IsEnum,
  IsObject,
  IsOptional,
  IsBoolean,
  Matches,
  Length,
} from 'class-validator';
import { PlatformType } from '../../common/enums/platform-type.enum';

export class CreatePlatformDto {
  @IsEnum(PlatformType)
  platform: PlatformType;

  @IsOptional()
  @IsString()
  @Length(1, 50, {
    message: 'Platform ID must be between 1 and 50 characters',
  })
  @Matches(/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/, {
    message:
      'Platform ID must start with a letter and contain only lowercase letters, numbers, and single hyphens (e.g., "filipe-labs")',
  })
  id?: string;

  @IsString()
  @Length(1, 50, {
    message: 'Platform name must be between 1 and 50 characters',
  })
  @Matches(/^[a-zA-Z0-9.\s-]+$/, {
    message:
      'Platform name can only contain letters, numbers, spaces, hyphens, and dots',
  })
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsObject()
  credentials: Record<string, any>;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  testMode?: boolean;
}
