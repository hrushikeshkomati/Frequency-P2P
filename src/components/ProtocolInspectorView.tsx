import React, { useState } from 'react';
import { Terminal, Shield, Filter, Download, Trash2, ArrowUpRight, ArrowDownLeft, CheckCircle2 } from 'lucide-react';
import { FrequencyEngineState, frequencyEngine } from '../engine/adaptiveEngine';
import { PacketInspectorEntry, TransportType } from '../crypto/types';

interface ProtocolInspectorViewProps {
  engineState: FrequencyEngineState;
}

export const ProtocolInspectorView: React.FC<ProtocolInspectorViewProps> = ({ engineState }) => {
  const [selectedTransport, setSelectedTransport] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedPacket, setSelectedPacket] = useState<PacketInspectorEntry | null>(null);

  const { packetLog, session } = engineState;

  const filteredPackets = packetLog.filter(p => {
    if (selectedTransport !== 'ALL' && p.transport !== selectedTransport) return false;
    if (selectedType !== 'ALL' && p.type !== selectedType) return false;
    return true;
  });

  const handleDownloadLog = () => {
    const jsonStr = JSON.stringify(packetLog, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `frequency-noise-trace-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Protocol Diagnostic Header */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Terminal className="w-5 h-5 text-neutral-300" />
              <h2 className="text-sm font-bold text-neutral-100 font-display">
                Noise Protocol &amp; Adaptive Frame Inspector
              </h2>
            </div>
            <p className="text-xs text-neutral-400">
              Real-time cryptographic packet inspection for <span className="font-mono text-neutral-300">Noise_XX_25519_ChaChaPoly_BLAKE2s</span>.
            </p>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded border border-neutral-800 text-xs font-mono">
              <span className="text-neutral-500 px-1">TRANSPORT:</span>
              {['ALL', 'BLE', 'LAN'].map(t => (
                <button
                  key={t}
                  onClick={() => setSelectedTransport(t)}
                  className={`px-2 py-0.5 rounded transition-colors ${
                    selectedTransport === t
                      ? 'bg-neutral-800 text-neutral-100 font-bold'
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded border border-neutral-800 text-xs font-mono">
              <span className="text-neutral-500 px-1">TYPE:</span>
              {['ALL', 'HANDSHAKE', 'MESSAGE', 'FILE_CHUNK'].map(ty => (
                <button
                  key={ty}
                  onClick={() => setSelectedType(ty)}
                  className={`px-2 py-0.5 rounded transition-colors ${
                    selectedType === ty
                      ? 'bg-neutral-800 text-neutral-100 font-bold'
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  {ty}
                </button>
              ))}
            </div>

            <button
              onClick={handleDownloadLog}
              className="p-1.5 bg-neutral-950 hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 rounded border border-neutral-800 transition-colors"
              title="Download Packet JSON Trace"
            >
              <Download className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => frequencyEngine.clearPacketLogs()}
              className="p-1.5 bg-neutral-950 hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 rounded border border-neutral-800 transition-colors"
              title="Clear Packet Log"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Packet Viewport Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Packet Stream Table */}
        <div className="lg:col-span-7 bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden font-mono text-xs shadow-lg">
          <div className="p-3 bg-neutral-950 border-b border-neutral-800 text-neutral-400 font-semibold flex justify-between items-center">
            <span>PACKET STREAM ({filteredPackets.length} CAPTURED)</span>
            <span className="text-[11px] text-neutral-500 font-normal">Click row for cryptographic details</span>
          </div>

          <div className="max-h-[520px] overflow-y-auto divide-y divide-neutral-800/80">
            {filteredPackets.length === 0 ? (
              <div className="p-8 text-center text-neutral-500">
                No packets matching active filter. Send a message or trigger file transfer.
              </div>
            ) : (
              filteredPackets.map(pkt => {
                const isSelected = selectedPacket?.id === pkt.id;
                return (
                  <div
                    key={pkt.id}
                    onClick={() => setSelectedPacket(pkt)}
                    className={`p-2.5 flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-neutral-800 text-neutral-100'
                        : 'hover:bg-neutral-950/80 text-neutral-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 shrink-0">
                      {pkt.direction === 'TX' ? (
                        <ArrowUpRight className="w-3.5 h-3.5 text-neutral-400" />
                      ) : (
                        <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-400" />
                      )}
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                        pkt.transport === 'BLE' ? 'bg-neutral-800 text-neutral-300' : 'bg-neutral-850 text-neutral-200'
                      }`}>
                        {pkt.transport}
                      </span>
                    </div>

                    <div className="truncate flex-1">
                      <div className="truncate font-semibold text-neutral-200">
                        {pkt.plaintextPreview || pkt.type}
                      </div>
                      <div className="text-[10px] text-neutral-500 truncate">
                        {pkt.sourceNode} → {pkt.destNode} · {pkt.channel}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-neutral-400 tabular-nums">
                        {pkt.sizeBytes} B
                      </div>
                      <div className="text-[10px] text-neutral-500 tabular-nums">
                        Nonce #{pkt.nonce}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Cryptographic Frame Inspector Panel */}
        <div className="lg:col-span-5 bg-neutral-900 border border-neutral-800 rounded-lg p-5 font-mono text-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
            <span className="font-bold text-neutral-200">
              FRAME DEEP INSPECTION
            </span>
            {selectedPacket?.verified && (
              <span className="text-emerald-400 text-[11px] font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Poly1305 MAC Valid
              </span>
            )}
          </div>

          {selectedPacket ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2 bg-neutral-950 rounded border border-neutral-800">
                  <span className="text-neutral-500 block">DIRECTION</span>
                  <span className="text-neutral-200 font-bold">{selectedPacket.direction}</span>
                </div>
                <div className="p-2 bg-neutral-950 rounded border border-neutral-800">
                  <span className="text-neutral-500 block">TRANSPORT</span>
                  <span className="text-neutral-200 font-bold">{selectedPacket.transport}</span>
                </div>
                <div className="p-2 bg-neutral-950 rounded border border-neutral-800">
                  <span className="text-neutral-500 block">TYPE</span>
                  <span className="text-neutral-200 font-bold">{selectedPacket.type}</span>
                </div>
                <div className="p-2 bg-neutral-950 rounded border border-neutral-800">
                  <span className="text-neutral-500 block">NONCE</span>
                  <span className="text-neutral-200 font-bold">#{selectedPacket.nonce}</span>
                </div>
              </div>

              {/* Ciphertext Hex Dump */}
              <div className="space-y-1">
                <span className="text-neutral-400 text-[11px] font-bold">CIPHERTEXT (HEX DUMP)</span>
                <div className="p-2.5 bg-neutral-950 rounded border border-neutral-800 break-all text-[11px] text-neutral-300 max-h-28 overflow-y-auto select-all">
                  {selectedPacket.rawCipherHex}
                </div>
              </div>

              {/* Poly1305 MAC Tag */}
              <div className="space-y-1">
                <span className="text-neutral-400 text-[11px] font-bold">POLY1305 AUTHENTICATION TAG (128-BIT)</span>
                <div className="p-2.5 bg-neutral-950 rounded border border-neutral-800 break-all text-[11px] text-emerald-400 select-all font-bold">
                  {selectedPacket.macTagHex}
                </div>
              </div>

              {/* Decrypted Plaintext Payload */}
              <div className="space-y-1">
                <span className="text-neutral-400 text-[11px] font-bold">DECRYPTED PAYLOAD PREVIEW</span>
                <div className="p-2.5 bg-neutral-950 rounded border border-neutral-800 text-[11px] text-neutral-200 select-all">
                  {selectedPacket.plaintextPreview || '[Raw Binary File Stream Chunk]'}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-neutral-500 space-y-2">
              <Shield className="w-8 h-8 mx-auto text-neutral-600" />
              <p>Select any packet from the left stream to inspect its cryptographic headers, raw hex bytes, and Poly1305 MAC tag.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
