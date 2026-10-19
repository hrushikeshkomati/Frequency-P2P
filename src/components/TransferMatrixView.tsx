import React, { useRef } from 'react';
import {
  Cpu,
  Layers,
  Sliders,
  Play,
  Pause,
  XCircle,
  FileUp,
  ShieldCheck,
  Zap,
  Radio,
  Wifi,
  Activity,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { FrequencyEngineState, frequencyEngine } from '../engine/adaptiveEngine';
import { ChunkStatus } from '../engine/transferTypes';

interface TransferMatrixViewProps {
  engineState: FrequencyEngineState;
}

export const TransferMatrixView: React.FC<TransferMatrixViewProps> = ({ engineState }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { currentTransfer, workerThreads, transferConcurrency, bleEnabled, lanEnabled } = engineState;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    frequencyEngine.startFileTransfer(file.name, file.size, file.type || 'application/octet-stream');
  };

  const handleStartPreset = (name: string, sizeMb: number, mime: string) => {
    frequencyEngine.startFileTransfer(name, sizeMb * 1024 * 1024, mime);
  };

  const getChunkColor = (status: ChunkStatus, transport: string) => {
    switch (status) {
      case 'verified':
        return 'bg-emerald-500 text-neutral-950';
      case 'in_flight_lan':
      case 'encrypting':
        return 'bg-neutral-200 text-neutral-950 animate-pulse';
      case 'in_flight_ble':
        return 'bg-neutral-400 text-neutral-950 animate-pulse';
      case 'retried':
        return 'bg-amber-500 text-neutral-950';
      default:
        return 'bg-neutral-800 text-neutral-500';
    }
  };

  const completedPct = currentTransfer
    ? Math.round((currentTransfer.completedChunks / currentTransfer.totalChunks) * 100)
    : 0;

  const totalBytes = currentTransfer
    ? currentTransfer.bleTransferredBytes + currentTransfer.lanTransferredBytes
    : 0;

  const lanRatio = totalBytes > 0 && currentTransfer
    ? Math.round((currentTransfer.lanTransferredBytes / totalBytes) * 100)
    : 85;
  const bleRatio = 100 - lanRatio;

  return (
    <div className="space-y-6">
      {/* Top Controller: File Initiation & Thread Concurrency */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-neutral-300" />
              <h2 className="text-sm font-bold text-neutral-100 font-display">
                Multithreaded Parallel Chunk Transfer Engine
              </h2>
            </div>
            <p className="text-xs text-neutral-400">
              Files are partitioned into ChaCha20-Poly1305 encrypted chunks and dispatched across parallel worker threads.
            </p>
          </div>

          {/* Concurrency Selector */}
          <div className="flex items-center gap-4 bg-neutral-950 p-2.5 rounded border border-neutral-800">
            <div className="flex items-center gap-2 text-xs font-mono text-neutral-300">
              <Sliders className="w-3.5 h-3.5 text-neutral-400" />
              <span>WORKER THREADS:</span>
            </div>
            <div className="flex items-center gap-1">
              {[1, 2, 4, 6, 8].map(th => (
                <button
                  key={th}
                  onClick={() => frequencyEngine.setConcurrency(th)}
                  className={`px-2.5 py-1 text-xs font-mono rounded transition-colors ${
                    transferConcurrency === th
                      ? 'bg-neutral-200 text-neutral-950 font-bold'
                      : 'bg-neutral-900 text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  {th}T
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Transfer Launcher & Presets */}
        <div className="mt-5 pt-4 border-t border-neutral-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={currentTransfer?.status === 'transferring'}
              className="px-4 py-2 bg-neutral-100 hover:bg-white text-neutral-950 rounded text-xs font-semibold flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              <FileUp className="w-4 h-4 text-neutral-900" />
              Upload Local File
            </button>

            <span className="text-neutral-600 text-xs font-mono">or test payload:</span>

            <button
              onClick={() => handleStartPreset('Security_Audit_Report.pdf', 3.8, 'application/pdf')}
              disabled={currentTransfer?.status === 'transferring'}
              className="px-3 py-1.5 bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 rounded text-xs font-mono text-neutral-300 transition-colors disabled:opacity-50"
            >
              Audit.pdf (3.8 MB)
            </button>

            <button
              onClick={() => handleStartPreset('Firmware_Kernel_v2.img', 18.5, 'application/octet-stream')}
              disabled={currentTransfer?.status === 'transferring'}
              className="px-3 py-1.5 bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 rounded text-xs font-mono text-neutral-300 transition-colors disabled:opacity-50"
            >
              Kernel.img (18.5 MB)
            </button>

            <button
              onClick={() => handleStartPreset('Telemetry_Capture_Raw.bin', 32.0, 'application/octet-stream')}
              disabled={currentTransfer?.status === 'transferring'}
              className="px-3 py-1.5 bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 rounded text-xs font-mono text-neutral-300 transition-colors disabled:opacity-50"
            >
              Capture.bin (32.0 MB)
            </button>
          </div>

          {currentTransfer && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => frequencyEngine.pauseResumeTransfer()}
                className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 rounded text-xs font-semibold flex items-center gap-1.5"
              >
                {currentTransfer.status === 'paused' ? (
                  <>
                    <Play className="w-3.5 h-3.5 text-neutral-200" /> Resume
                  </>
                ) : (
                  <>
                    <Pause className="w-3.5 h-3.5 text-neutral-200" /> Pause
                  </>
                )}
              </button>

              <button
                onClick={() => frequencyEngine.cancelTransfer()}
                className="px-3 py-1.5 bg-neutral-950 hover:bg-neutral-800 text-neutral-400 border border-neutral-800 rounded text-xs font-semibold flex items-center gap-1.5"
              >
                <XCircle className="w-3.5 h-3.5" /> Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Live Session Telemetry Metrics */}
      {currentTransfer ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 font-mono">
            <div className="text-neutral-500 text-xs">EFFECTIVE THROUGHPUT</div>
            <div className="text-xl font-bold text-neutral-100 mt-1 tabular-nums">
              {(currentTransfer.currentSpeedBytesPerSec / (1024 * 1024)).toFixed(2)} MB/s
            </div>
            <div className="text-[11px] text-neutral-500 mt-1">
              Avg: {(currentTransfer.averageSpeedBytesPerSec / (1024 * 1024)).toFixed(2)} MB/s
            </div>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 font-mono">
            <div className="text-neutral-500 text-xs">CHUNKS VERIFIED</div>
            <div className="text-xl font-bold text-emerald-400 mt-1 tabular-nums">
              {currentTransfer.completedChunks} / {currentTransfer.totalChunks}
            </div>
            <div className="text-[11px] text-neutral-500 mt-1">
              Progress: {completedPct}%
            </div>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 font-mono">
            <div className="text-neutral-500 text-xs">TRANSPORT BONDING</div>
            <div className="text-xs text-neutral-300 mt-2 flex justify-between">
              <span>LAN: {lanRatio}%</span>
              <span>BLE: {bleRatio}%</span>
            </div>
            <div className="w-full bg-neutral-950 h-2 rounded mt-1.5 flex overflow-hidden border border-neutral-800">
              <div className="bg-neutral-200 h-full" style={{ width: `${lanRatio}%` }} />
              <div className="bg-neutral-600 h-full" style={{ width: `${bleRatio}%` }} />
            </div>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 font-mono">
            <div className="text-neutral-500 text-xs">RETRIES / INTEGRITY</div>
            <div className="text-xl font-bold text-amber-400 mt-1 tabular-nums">
              {currentTransfer.retransmitCount} Retransmits
            </div>
            <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              ChaCha20-Poly1305 MAC
            </div>
          </div>
        </div>
      ) : (
        <div className="p-8 bg-neutral-900 border border-neutral-800 rounded-lg text-center space-y-2 font-mono">
          <Layers className="w-8 h-8 text-neutral-600 mx-auto" />
          <p className="text-sm text-neutral-300">No active file transfer in pipeline</p>
          <p className="text-xs text-neutral-500">
            Select a test file payload above or upload any local document to observe parallel chunk streaming.
          </p>
        </div>
      )}

      {/* Chunk Dispatch Matrix Visualization */}
      {currentTransfer && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-neutral-200">PAYLOAD:</span>
              <span className="text-neutral-400">{currentTransfer.fileName}</span>
              <span className="text-neutral-600">·</span>
              <span className="text-neutral-400">{(currentTransfer.fileSizeBytes / (1024 * 1024)).toFixed(2)} MB</span>
            </div>

            <div className="flex items-center gap-4 text-[11px]">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-neutral-800 inline-block border border-neutral-700" />
                <span className="text-neutral-400">Pending</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-neutral-200 inline-block" />
                <span className="text-neutral-300">In-Flight (LAN)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-neutral-500 inline-block" />
                <span className="text-neutral-300">In-Flight (BLE)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-emerald-500 inline-block" />
                <span className="text-emerald-400">Verified (BLAKE2s)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-amber-500 inline-block" />
                <span className="text-amber-400">Retried</span>
              </div>
            </div>
          </div>

          {/* Matrix Grid */}
          <div className="p-3 bg-neutral-950 rounded border border-neutral-800 max-h-[260px] overflow-y-auto">
            <div className="grid grid-cols-12 sm:grid-cols-18 md:grid-cols-24 lg:grid-cols-32 gap-1.5">
              {currentTransfer.chunks.map((chunk) => (
                <div
                  key={chunk.index}
                  title={`Chunk #${chunk.index} · ${chunk.sizeBytes} bytes · Thread ${chunk.workerThreadId} · ${chunk.transport}`}
                  className={`h-4 rounded-[2px] transition-all duration-100 flex items-center justify-center text-[8px] font-mono font-bold cursor-default ${getChunkColor(
                    chunk.status,
                    chunk.transport
                  )}`}
                >
                  {chunk.status === 'retried' ? '!' : ''}
                </div>
              ))}
            </div>
          </div>

          {/* SHA-256 Digest Verification Strip */}
          <div className="p-3 bg-neutral-950 rounded border border-neutral-800 flex flex-col md:flex-row items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center gap-2 truncate">
              <span className="text-neutral-500">SENDER HASH:</span>
              <span className="text-neutral-300 truncate">{currentTransfer.fileHash}</span>
            </div>

            {currentTransfer.status === 'completed' ? (
              <div className="flex items-center gap-2 text-emerald-400 font-bold shrink-0">
                <CheckCircle2 className="w-4 h-4" />
                RECEIVER HASH 100% BIT-PERFECT MATCH
              </div>
            ) : (
              <div className="flex items-center gap-2 text-neutral-500 shrink-0">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                STREAMING CHUNKS...
              </div>
            )}
          </div>
        </div>
      )}

      {/* Parallel Worker Thread Activity Pool */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-5 space-y-4">
        <div className="flex items-center justify-between font-mono text-xs">
          <span className="font-bold text-neutral-200">
            ACTIVE WORKER THREAD POOL ({workerThreads.length} VIRTUAL THREADS)
          </span>
          <span className="text-neutral-500">
            NIO Socket Multiplexing &amp; Ring Buffer Queues
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {workerThreads.map((thread) => (
            <div
              key={thread.id}
              className="p-3 bg-neutral-950 border border-neutral-800 rounded font-mono text-xs space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-neutral-200">{thread.name}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded ${
                    thread.status === 'streaming'
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      : 'bg-neutral-900 text-neutral-500'
                  }`}
                >
                  {thread.status.toUpperCase()}
                </span>
              </div>

              <div className="text-[11px] text-neutral-400 flex justify-between">
                <span>Active Chunk:</span>
                <span className="text-neutral-200 tabular-nums">
                  {thread.activeChunkIndex !== null ? `#${thread.activeChunkIndex}` : 'None'}
                </span>
              </div>

              <div className="text-[11px] text-neutral-400 flex justify-between">
                <span>Processed:</span>
                <span className="text-neutral-200 tabular-nums">
                  {(thread.bytesProcessed / (1024 * 1024)).toFixed(2)} MB
                </span>
              </div>

              {/* Utilization bar */}
              <div className="w-full bg-neutral-900 h-1.5 rounded overflow-hidden">
                <div
                  className="bg-neutral-300 h-full transition-all duration-150"
                  style={{ width: `${thread.utilization}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
