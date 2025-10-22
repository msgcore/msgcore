import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

/**
 * DTO for quick-linking a platform user to a new identity
 * Combines identity creation and alias linking in one operation
 */
export class QuickLinkDto {
  @IsString()
  @IsNotEmpty()
  platformId: string;

  @IsString()
  @IsNotEmpty()
  providerUserId: string;

  @IsOptional()
  @IsString()
  providerUserDisplay?: string;

  @IsOptional()
  @IsString()
  displayName?: string;

  @IsOptional()
  @IsString()
  email?: string;
}
