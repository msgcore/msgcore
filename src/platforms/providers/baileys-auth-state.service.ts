import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CryptoUtil } from '../../common/utils/crypto.util';
import {
  initAuthCreds,
  BufferJSON,
  proto,
  AuthenticationCreds,
  SignalDataTypeMap,
  AuthenticationState,
} from '@whiskeysockets/baileys';

/**
 * Baileys Auth State Service
 *
 * Manages persistent storage of Baileys authentication state in PostgreSQL.
 * Auth state includes:
 * - Authentication credentials (account info, encryption keys)
 * - Signal protocol keys (for end-to-end encryption)
 *
 * All data is encrypted with AES-256-GCM before storage.
 */
@Injectable()
export class BaileysAuthStateService {
  private readonly logger = new Logger(BaileysAuthStateService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Load authentication state from database
   *
   * @param connectionKey Composite key: "projectId:platformId"
   * @returns Authentication state or fresh state for new connections
   */
  async loadAuthState(connectionKey: string): Promise<{
    state: AuthenticationState;
    saveCreds: () => Promise<void>;
  }> {
    this.logger.log(`Loading auth state for ${connectionKey}`);

    // Load from database
    const storedState = await this.prisma.baileysAuthState.findUnique({
      where: { connectionKey },
    });

    let creds: AuthenticationCreds;
    let keys: SignalDataTypeMap = {} as SignalDataTypeMap;

    if (storedState) {
      // Decrypt and parse existing state
      try {
        creds = JSON.parse(
          CryptoUtil.decrypt(storedState.creds),
          BufferJSON.reviver,
        );
        keys = JSON.parse(
          CryptoUtil.decrypt(storedState.keys),
          BufferJSON.reviver,
        );
        this.logger.log(`Loaded existing auth state for ${connectionKey}`);
      } catch (error) {
        this.logger.error(
          `Failed to decrypt auth state for ${connectionKey}:`,
          error,
        );
        // Fall back to fresh credentials
        creds = initAuthCreds();
      }
    } else {
      // First time connection - initialize fresh credentials
      creds = initAuthCreds();
      this.logger.log(
        `Initialized fresh auth credentials for ${connectionKey}`,
      );
    }

    // Create save function
    const saveCreds = async () => {
      await this.saveAuthState(connectionKey, { creds, keys });
    };

    return {
      state: {
        creds,
        keys: {
          get: (type: string, ids: string[]) => {
            const data: any = {};
            for (const id of ids) {
              let value = keys[`${type}.${id}`];
              if (value) {
                if (type === 'app-state-sync-key') {
                  value = proto.Message.AppStateSyncKeyData.fromObject(value);
                }
                data[id] = value;
              }
            }
            return data;
          },
          set: (data: any) => {
            for (const category in data) {
              for (const id in data[category]) {
                const value = data[category][id];
                const key = `${category}.${id}`;
                if (value) {
                  keys[key] = value;
                } else {
                  delete keys[key];
                }
              }
            }
            // Auto-save on key updates
            saveCreds();
          },
        },
      },
      saveCreds,
    };
  }

  /**
   * Save authentication state to database (encrypted)
   *
   * @param connectionKey Composite key: "projectId:platformId"
   * @param state Authentication state to save
   */
  async saveAuthState(
    connectionKey: string,
    state: { creds: AuthenticationCreds; keys: SignalDataTypeMap },
  ): Promise<void> {
    try {
      // Serialize and encrypt credentials
      const credsEncrypted = CryptoUtil.encrypt(
        JSON.stringify(state.creds, BufferJSON.replacer, 2),
      );

      // Serialize and encrypt keys
      const keysEncrypted = CryptoUtil.encrypt(
        JSON.stringify(state.keys, BufferJSON.replacer, 2),
      );

      // Upsert to database
      await this.prisma.baileysAuthState.upsert({
        where: { connectionKey },
        create: {
          connectionKey,
          creds: credsEncrypted,
          keys: keysEncrypted,
        },
        update: {
          creds: credsEncrypted,
          keys: keysEncrypted,
        },
      });

      this.logger.debug(`Saved auth state for ${connectionKey}`);
    } catch (error) {
      this.logger.error(
        `Failed to save auth state for ${connectionKey}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Delete authentication state from database
   *
   * @param connectionKey Composite key: "projectId:platformId"
   */
  async deleteAuthState(connectionKey: string): Promise<void> {
    try {
      await this.prisma.baileysAuthState.delete({
        where: { connectionKey },
      });
      this.logger.log(`Deleted auth state for ${connectionKey}`);
    } catch (error) {
      // Ignore if not found
      if (error.code !== 'P2025') {
        this.logger.error(
          `Failed to delete auth state for ${connectionKey}:`,
          error,
        );
      }
    }
  }

  /**
   * Check if auth state exists for a connection
   *
   * @param connectionKey Composite key: "projectId:platformId"
   * @returns True if auth state exists
   */
  async hasAuthState(connectionKey: string): Promise<boolean> {
    const state = await this.prisma.baileysAuthState.findUnique({
      where: { connectionKey },
      select: { id: true },
    });
    return !!state;
  }
}
