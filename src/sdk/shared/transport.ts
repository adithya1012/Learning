/**
 * Transport Interface
 * Base transport interface for MCP communication
 */

import { JSONRPCMessage } from "$protocol/types.js";

export interface Transport {
  /** Callback for when the transport is closed */
  onclose?: () => void;

  /** Callback for when an error occurs */
  onerror?: (error: Error) => void;

  /** Callback for when a message is received */
  onmessage?: (message: JSONRPCMessage) => void;

  /** Send a message through the transport */
  send(message: JSONRPCMessage): Promise<void>;

  /** Close the transport */
  close(): Promise<void>;
}
