import type { WASocket } from '@whiskeysockets/baileys';

/**
 * Baileys WhatsApp Connection
 *
 * Represents an active WebSocket connection to WhatsApp via Baileys.
 * Each project+platform combination has its own dedicated connection.
 */
export interface BaileysConnection {
  /**
   * Composite connection key: "projectId:platformId"
   * Ensures isolation between different projects and platform instances
   */
  connectionKey: string;

  /**
   * Project ID this connection belongs to
   */
  projectId: string;

  /**
   * Platform ID this connection belongs to
   */
  platformId: string;

  /**
   * Baileys WebSocket instance
   */
  sock: WASocket;

  /**
   * Whether the connection is currently active and authenticated
   */
  isConnected: boolean;

  /**
   * Current QR code for pairing (if in pairing mode)
   * Undefined once connection is established
   */
  qrCode?: string;

  /**
   * Connection state from Baileys
   * - 'close': Disconnected
   * - 'connecting': Attempting to connect
   * - 'open': Connected and authenticated
   */
  connectionState: 'close' | 'connecting' | 'open';

  /**
   * Timestamp of last activity (message received/sent)
   * Used for connection health monitoring
   */
  lastActivity: Date;

  /**
   * Number of reconnection attempts made
   * Reset to 0 on successful connection
   */
  reconnectAttempts: number;

  /**
   * Cleanup function to remove event listeners
   * Called when connection is being destroyed
   */
  eventCleanup?: () => void;
}
