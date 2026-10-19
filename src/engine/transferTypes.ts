/**
 * Multithreaded Chunk Transfer & Adaptive Routing Types
 */

import { TransportType } from '../crypto/types';

export type ChunkStatus = 
  | 'pending'
  | 'encrypting'
  | 'in_flight_ble'
  | 'in_flight_lan'
  | 'received'
  | 'verified'
  | 'retried';

export interface FileChunk {
  index: number;
  totalChunks: number;
  offset: number;
  sizeBytes: number;
  status: ChunkStatus;
  transport: TransportType;
  workerThreadId: number;
  nonce: number;
  chunkHash: string; // SHA-256 / BLAKE2s digest of this chunk
  macTag: string;    // Poly1305 MAC tag
  retryCount: number;
}

export interface WorkerThreadState {
  id: number;
  name: string;
  activeChunkIndex: number | null;
  bytesProcessed: number;
  currentTransport: TransportType;
  utilization: number; // 0 - 100%
  status: 'idle' | 'encrypting' | 'streaming' | 'verifying';
}

export interface TransferSession {
  id: string;
  fileName: string;
  fileSizeBytes: number;
  mimeType: string;
  senderId: string;
  receiverId: string;
  fileHash: string;
  receivedFileHash: string | null;
  status: 'idle' | 'negotiating' | 'transferring' | 'paused' | 'completed' | 'failed';
  totalChunks: number;
  completedChunks: number;
  chunks: FileChunk[];
  concurrencyThreads: number; // 1 to 8 threads
  startTime: number | null;
  endTime: number | null;
  currentSpeedBytesPerSec: number;
  averageSpeedBytesPerSec: number;
  bleTransferredBytes: number;
  lanTransferredBytes: number;
  packetLossCount: number;
  retransmitCount: number;
}

export interface TelemetryMetrics {
  totalBytesSent: number;
  totalBytesRecv: number;
  bleBandwidthBps: number;
  lanBandwidthBps: number;
  activeWorkerCount: number;
  bleRssi: number;
  lanLatencyMs: number;
  lanJitterMs: number;
  blePacketDropRate: number;
}
