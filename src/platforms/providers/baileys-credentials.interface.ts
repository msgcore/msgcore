/**
 * Baileys WhatsApp Credentials Interface
 *
 * Baileys doesn't require upfront credentials - authentication is handled
 * via QR code scanning. The auth state (credentials and encryption keys)
 * is generated during the QR code pairing process and stored in the database.
 */
export interface BaileysCredentials {
  /**
   * Optional custom browser name to display in WhatsApp's "Linked Devices"
   * @example "MsgCore Bot"
   */
  browserName?: string;

  /**
   * Optional custom browser version
   * Defaults to "1.0.0"
   */
  browserVersion?: string;
}
