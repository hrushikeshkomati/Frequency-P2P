/**
 * Cryptographic & Packet Data Types for Frequency E2EE
 */

export type HandshakeState = 
  | 'UNINITIALIZED'
  | 'MSG_1_SENT_E'          // -> e
  | 'MSG_2_RECV_E_EE_S_ES'  // <- e, ee, s, es
  | 'MSG_3_SENT_S_SE'       // -> s, se
  | 'ESTABLISHED'
  | 'FAILED';

export type TransportType = 'BLE' | 'LAN' | 'BONDED';

export interface PeerIdentity {
  id: string;
  name: string;
  platform: 'windows' | 'android';
  fingerprint: string;
  staticPublicKeyHex: string;
  bleAddress: string;
  lanIp: string;
  bleAvailable: boolean;
  lanAvailable: boolean;
  rssi: number; // dBm
  pingMs: number;
}

export interface SessionState {
  sessionId: string;
  localPeerId: string;
  remotePeerId: string;
  handshakeStep: HandshakeState;
  sendKey: Uint8Array | null;
  recvKey: Uint8Array | null;
  sendNonce: number;
  recvNonce: number;
  establishedAt: number | null;
  sasCode: string;
  sasWords: string[];
  isVerified: boolean;
}

export interface PacketInspectorEntry {
  id: string;
  timestamp: number;
  direction: 'TX' | 'RX';
  transport: TransportType;
  channel: string; // e.g. "BLE GATT Characteristic 0xFFE1" or "TCP/LAN Socket:Thread-3"
  sourceNode: string;
  destNode: string;
  type: 'HANDSHAKE' | 'MESSAGE' | 'FILE_CHUNK' | 'ACK' | 'HEARTBEAT';
  nonce: number;
  sizeBytes: number;
  rawCipherHex: string;
  macTagHex: string;
  plaintextPreview?: string;
  verified: boolean;
}

export interface SecureMessage {
  id: string;
  senderId: string;
  recipientId: string;
  content: string;
  timestamp: number;
  transport: TransportType;
  nonce: number;
  macTag: string;
  deliveryStatus: 'sending' | 'delivered' | 'read';
}
