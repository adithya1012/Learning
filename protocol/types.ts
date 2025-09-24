/**
 * Protocol Message Types and Type Guards
 * Defines all message types used in the MCP PostMessage protocol
 */

// Basic JSONRPC Message type definition
export interface JSONRPCMessage {
  jsonrpc: "2.0";
  id?: string | number | null;
  method?: string;
  params?: any;
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
}

// ============================================================================
// PERMISSION TYPES
// ============================================================================

export interface PermissionRequirement {
  permission: string;
  reason?: string;
  required?: boolean;
}

// ============================================================================
// SETUP PHASE MESSAGES
// ============================================================================

export interface SetupHandshakeMessage {
  type: "MCP_SETUP_HANDSHAKE";
  minProtocolVersion: string;
  maxProtocolVersion: string;
  requiresVisibleSetup: boolean;
  requestedPermissions: PermissionRequirement[];
}

export interface SetupHandshakeReplyMessage {
  type: "MCP_SETUP_HANDSHAKE_REPLY";
  protocolVersion: string;
  sessionId: string;
}

export interface SetupCompleteMessage {
  type: "MCP_SETUP_COMPLETE";
  status: "success" | "error";
  displayName?: string;
  transportVisibility?: {
    requirement: "required" | "optional" | "hidden";
    description?: string;
  };
  ephemeralMessage?: string;
  error?: string;
}

// ============================================================================
// TRANSPORT PHASE MESSAGES
// ============================================================================

export interface TransportHandshakeMessage {
  type: "MCP_TRANSPORT_HANDSHAKE";
  protocolVersion: string;
}

export interface TransportHandshakeReplyMessage {
  type: "MCP_TRANSPORT_HANDSHAKE_REPLY";
  protocolVersion: string;
  sessionId: string;
}

export interface TransportAcceptedMessage {
  type: "MCP_TRANSPORT_ACCEPTED";
  sessionId: string;
}

// ============================================================================
// MCP MESSAGE WRAPPER
// ============================================================================

export interface MCPMessage {
  type: "MCP_MESSAGE";
  payload: JSONRPCMessage;
}

// ============================================================================
// UNION TYPES
// ============================================================================

export type SetupMessage =
  | SetupHandshakeMessage
  | SetupHandshakeReplyMessage
  | SetupCompleteMessage;

export type TransportMessage =
  | TransportHandshakeMessage
  | TransportHandshakeReplyMessage
  | TransportAcceptedMessage;

export type ProtocolMessage = SetupMessage | TransportMessage | MCPMessage;

// ============================================================================
// TYPE GUARDS
// ============================================================================

export function isSetupMessage(msg: any): msg is SetupMessage {
  return (
    msg &&
    typeof msg.type === "string" &&
    (msg.type === "MCP_SETUP_HANDSHAKE" ||
      msg.type === "MCP_SETUP_HANDSHAKE_REPLY" ||
      msg.type === "MCP_SETUP_COMPLETE")
  );
}

export function isTransportMessage(msg: any): msg is TransportMessage {
  return (
    msg &&
    typeof msg.type === "string" &&
    (msg.type === "MCP_TRANSPORT_HANDSHAKE" ||
      msg.type === "MCP_TRANSPORT_HANDSHAKE_REPLY" ||
      msg.type === "MCP_TRANSPORT_ACCEPTED")
  );
}

export function isMCPMessage(msg: any): msg is MCPMessage {
  return msg && msg.type === "MCP_MESSAGE" && msg.payload;
}
