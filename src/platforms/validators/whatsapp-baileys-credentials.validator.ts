import { Injectable } from '@nestjs/common';
import {
  PlatformCredentialValidator,
  CredentialValidationResult,
} from '../interfaces/credential-validator.interface';
import { PlatformType } from '../../common/enums/platform-type.enum';

/**
 * Baileys WhatsApp Credentials Validator
 *
 * Validates credentials for Baileys WhatsApp provider.
 * Baileys doesn't require upfront credentials - authentication happens via QR code.
 */
@Injectable()
export class WhatsAppBaileysCredentialsValidator
  implements PlatformCredentialValidator
{
  readonly platform = PlatformType.WHATSAPP_BAILEYS;

  validateCredentials(
    credentials: Record<string, any>,
  ): CredentialValidationResult {
    const errors: string[] = [];

    // Validate optional browserName if provided
    if (credentials.browserName !== undefined) {
      if (typeof credentials.browserName !== 'string') {
        errors.push('browserName must be a string');
      } else if (credentials.browserName.length === 0) {
        errors.push('browserName cannot be empty');
      } else if (credentials.browserName.length > 100) {
        errors.push('browserName cannot exceed 100 characters');
      }
    }

    // Validate optional browserVersion if provided
    if (credentials.browserVersion !== undefined) {
      if (typeof credentials.browserVersion !== 'string') {
        errors.push('browserVersion must be a string');
      } else if (credentials.browserVersion.length > 20) {
        errors.push('browserVersion cannot exceed 20 characters');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  getRequiredFields(): string[] {
    // No required fields - authentication happens via QR code
    return [];
  }

  getOptionalFields(): string[] {
    return ['browserName', 'browserVersion'];
  }

  getExampleCredentials(): Record<string, any> {
    return {
      browserName: 'MsgCore',
      browserVersion: '1.0.0',
    };
  }
}
