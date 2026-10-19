import React, { useState } from 'react';
import {
  Monitor,
  Smartphone,
  Shield,
  ShieldCheck,
  Send,
  FileUp,
  Activity,
  ArrowRightLeft,
  Lock,
  Wifi,
  Radio,
  CheckCircle2,
  AlertCircle,
  HardDrive
} from 'lucide-react';
import { FrequencyEngineState, frequencyEngine } from '../engine/adaptiveEngine';

interface DualDeviceViewProps {
  engineState: FrequencyEngineState;
  onOpenTransferTab: () => void;
}

export const DualDeviceView: React.FC<DualDeviceViewProps> = ({
  engineState,
  onOpenTransferTab
}) => {
  const [winMessage, setWinMessage] = useState('');
  const [androidMessage, setAndroidMessage] = useState('');
  const [isHandshaking, setIsHandshaking] = useState(false);

  const {
    localPeer,
    remotePeer,
    session,
    messages,
    bleEnabled,
    lanEnabled,
    packetLossSimulation,
    currentTransfer,
    telemetry
  } = engineState;

  const handleStartHandshake = async () => {
    try {
      setIsHandshaking(true);
      await frequencyEngine.performNoiseHandshake();
    } catch (err) {
      console.error('Handshake failed:', err);
    } finally {
      setIsHandshaking(false);
    }
  };

  const handleSendFromWindows = (e: React.FormEvent) => {
    e.preventDefault();
    if (!winMessage.trim()) return;
    frequencyEngine.sendMessage(winMessage, 'local');
    setWinMessage('');
  };

  const handleSendFromAndroid = (e: React.FormEvent) => {
    e.preventDefault();
    if (!androidMessage.trim()) return;
    frequencyEngine.sendMessage(androidMessage, 'remote');
    setAndroidMessage('');
  };

  const handleQuickTransfer = (type: 'doc' | 'firmware' | 'telemetry') => {
    if (type === 'doc') {
      frequencyEngine.startFileTransfer('Security_Assessment_Matrix.pdf', 3.4 * 1024 * 1024, 'application/pdf');
    } else if (type === 'firmware') {
      frequencyEngine.startFileTransfer('Firmware_Kernel_v2.1_x86.img', 18.2 * 1024 * 1024, 'application/octet-stream');
    } else {
      frequencyEngine.startFileTransfer('Telemetry_Telemetry_Dataset.dat', 8.6 * 1024 * 1024, 'application/octet-stream');
    }
  };

  return (
    <div className="space-y-6">
      {/* Network & Interlink Control Bar */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-6 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="text-neutral-400">SESSION:</span>
            <span className="text-neutral-200">{session.sessionId}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-neutral-400">NOISE PROTOCOL:</span>
            <span className="text-emerald-400 font-semibold">
              Noise_XX_25519_ChaChaPoly
            </span>
          </div>
          {session.isVerified && (
            <div className="flex items-center gap-2">
              <span className="text-neutral-400">SAS CODE:</span>
              <span className="text-amber-400 font-bold bg-neutral-950 px-2 py-0.5 rounded border border-neutral-800">
                {session.sasCode} ({session.sasWords.join(' · ')})
              </span>
            </div>
          )}
        </div>

        {/* Dynamic Transport Toggles to demonstrate Failover */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => frequencyEngine.toggleBle()}
            className={`px-3 py-1 text-xs font-mono rounded border transition-colors flex items-center gap-1.5 ${
              bleEnabled
                ? 'bg-neutral-800 text-neutral-100 border-neutral-600'
                : 'bg-neutral-950 text-neutral-500 border-neutral-800 line-through'
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-neutral-300" />
            BLE 5.2 ({bleEnabled ? 'Active' : 'Disabled'})
          </button>

          <button
            onClick={() => frequencyEngine.toggleLan()}
            className={`px-3 py-1 text-xs font-mono rounded border transition-colors flex items-center gap-1.5 ${
              lanEnabled
                ? 'bg-neutral-800 text-neutral-100 border-neutral-600'
                : 'bg-neutral-950 text-neutral-500 border-neutral-800 line-through'
            }`}
          >
            <Wifi className="w-3.5 h-3.5 text-neutral-300" />
            LAN / Wi-Fi ({lanEnabled ? 'Active' : 'Offline'})
          </button>

          <button
            onClick={() => frequencyEngine.togglePacketLoss()}
            className={`px-3 py-1 text-xs font-mono rounded border transition-colors flex items-center gap-1.5 ${
              packetLossSimulation
                ? 'bg-amber-950/40 text-amber-300 border-amber-800'
                : 'bg-neutral-950 text-neutral-400 border-neutral-800'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
            Jitter &amp; Packet Loss ({packetLossSimulation ? 'Simulating' : 'Off'})
          </button>
        </div>
      </div>

      {/* Side-by-Side Dual Device Architecture */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Device Frame 1: Windows 11 Workstation */}
        <div className="lg:col-span-5 bg-neutral-900 border border-neutral-800 rounded-lg flex flex-col overflow-hidden shadow-lg">
          {/* Windows Window Header */}
          <div className="bg-neutral-950 px-3 py-2 border-b border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Monitor className="w-4 h-4 text-neutral-400" />
              <span className="text-xs font-semibold text-neutral-200">
                {localPeer.name}
              </span>
              <span className="text-neutral-500 text-xs font-mono">
                [Windows 11 x64 · Java 21]
              </span>
            </div>
            <div className="flex items-center gap-1 text-neutral-500 text-xs font-mono">
              <span className="px-1.5 py-0.5 bg-neutral-900 rounded border border-neutral-800">
                {localPeer.lanIp}
              </span>
            </div>
          </div>

          {/* Node Security & Key Identity */}
          <div className="p-3 bg-neutral-950/60 border-b border-neutral-800/80 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-neutral-400">FINGERPRINT:</span>
              <span className="text-neutral-200">{localPeer.fingerprint}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-neutral-400">NONCE:</span>
              <span className="text-neutral-300 tabular-nums">#{session.sendNonce}</span>
            </div>
          </div>

          {/* Handshake Gate */}
          {session.handshakeStep !== 'ESTABLISHED' ? (
            <div className="p-6 my-auto text-center space-y-3">
              <Shield className="w-10 h-10 text-neutral-500 mx-auto" />
              <p className="text-sm font-medium text-neutral-300">
                Noise Protocol Unpaired
              </p>
              <p className="text-xs text-neutral-500 max-w-xs mx-auto">
                Mutual identity verification required via Curve25519 ephemeral handshake before payload transmission.
              </p>
              <button
                onClick={handleStartHandshake}
                disabled={isHandshaking}
                className="px-4 py-2 bg-neutral-100 hover:bg-white text-neutral-950 text-xs font-semibold rounded transition-colors disabled:opacity-50"
              >
                {isHandshaking ? 'Handshaking...' : 'Initiate Noise_XX Handshake'}
              </button>
            </div>
          ) : (
            <div className="flex-1 flex flex-col p-4 space-y-4">
              {/* Encrypted Messaging Transcript */}
              <div className="flex-1 min-h-[220px] max-h-[280px] overflow-y-auto space-y-2 p-3 bg-neutral-950 rounded border border-neutral-800 font-mono text-xs">
                {messages.length === 0 ? (
                  <p className="text-neutral-600 text-center py-8">
                    Encrypted channel established. No packets sent yet.
                  </p>
                ) : (
                  messages.map(msg => {
                    const isLocal = msg.senderId === localPeer.id;
                    return (
                      <div
                        key={msg.id}
                        className={`p-2 rounded max-w-[85%] ${
                          isLocal
                            ? 'ml-auto bg-neutral-800/80 border border-neutral-700 text-neutral-100'
                            : 'mr-auto bg-neutral-900 border border-neutral-800 text-neutral-300'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-4 text-[10px] text-neutral-500 mb-1">
                          <span className="font-semibold">{isLocal ? 'TX Desktop' : 'RX Handset'}</span>
                          <span>{msg.transport} · #{msg.nonce}</span>
                        </div>
                        <p className="text-neutral-200">{msg.content}</p>
                        <div className="text-[9px] text-neutral-500 mt-1 truncate">
                          MAC: {msg.macTag}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Windows Message Input */}
              <form onSubmit={handleSendFromWindows} className="flex gap-2">
                <input
                  type="text"
                  value={winMessage}
                  onChange={e => setWinMessage(e.target.value)}
                  placeholder="Send encrypted message from Windows..."
                  className="flex-1 bg-neutral-950 border border-neutral-800 rounded px-3 py-2 text-xs text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-neutral-600 font-mono"
                />
                <button
                  type="submit"
                  className="px-3 py-2 bg-neutral-200 hover:bg-white text-neutral-950 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Send className="w-3.5 h-3.5 text-neutral-900" />
                  Send
                </button>
              </form>

              {/* Quick File Transfer Action */}
              <div className="pt-2 border-t border-neutral-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-400 font-medium">Transmit File Chunks</span>
                  <button
                    onClick={onOpenTransferTab}
                    className="text-neutral-300 hover:text-white text-xs underline"
                  >
                    Open Transfer Matrix
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleQuickTransfer('doc')}
                    disabled={currentTransfer?.status === 'transferring'}
                    className="p-2 bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 rounded text-left transition-colors disabled:opacity-50"
                  >
                    <div className="text-xs font-semibold text-neutral-200 truncate">Audit.pdf</div>
                    <div className="text-[10px] text-neutral-500 font-mono">3.4 MB · 48 chunks</div>
                  </button>

                  <button
                    onClick={() => handleQuickTransfer('firmware')}
                    disabled={currentTransfer?.status === 'transferring'}
                    className="p-2 bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 rounded text-left transition-colors disabled:opacity-50"
                  >
                    <div className="text-xs font-semibold text-neutral-200 truncate">Kernel.img</div>
                    <div className="text-[10px] text-neutral-500 font-mono">18.2 MB · 180 chunks</div>
                  </button>

                  <button
                    onClick={() => handleQuickTransfer('telemetry')}
                    disabled={currentTransfer?.status === 'transferring'}
                    className="p-2 bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 rounded text-left transition-colors disabled:opacity-50"
                  >
                    <div className="text-xs font-semibold text-neutral-200 truncate">Telemetry.dat</div>
                    <div className="text-[10px] text-neutral-500 font-mono">8.6 MB · 96 chunks</div>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Center Interlink & Telemetry Bridge */}
        <div className="lg:col-span-2 flex flex-col justify-center items-center space-y-4 py-4">
          <div className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-3 text-center space-y-2">
            <span className="text-[11px] font-semibold text-neutral-400 font-mono uppercase">
              P2P Air-Gap Interlink
            </span>

            <div className="flex items-center justify-center gap-2 text-xs font-mono py-1">
              <span className={bleEnabled ? 'text-emerald-400' : 'text-neutral-600'}>BLE</span>
              <ArrowRightLeft className="w-3.5 h-3.5 text-neutral-500" />
              <span className={lanEnabled ? 'text-emerald-400' : 'text-neutral-600'}>LAN</span>
            </div>

            <div className="border-t border-neutral-800 pt-2 space-y-1 text-[11px] font-mono">
              <div className="flex justify-between text-neutral-400">
                <span>BLE RSSI:</span>
                <span className="text-neutral-200 tabular-nums">{localPeer.rssi} dBm</span>
              </div>
              <div className="flex justify-between text-neutral-400">
                <span>LAN RTT:</span>
                <span className="text-neutral-200 tabular-nums">{localPeer.pingMs} ms</span>
              </div>
              <div className="flex justify-between text-neutral-400">
                <span>Speed:</span>
                <span className="text-emerald-400 font-semibold tabular-nums">
                  {currentTransfer && currentTransfer.status === 'transferring'
                    ? (currentTransfer.currentSpeedBytesPerSec / (1024 * 1024)).toFixed(1) + ' MB/s'
                    : '0.0 MB/s'}
                </span>
              </div>
            </div>
          </div>

          {currentTransfer && (
            <div className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-3 text-xs font-mono space-y-2">
              <div className="flex justify-between text-neutral-300">
                <span>Transfer:</span>
                <span className="text-emerald-400">{Math.round((currentTransfer.completedChunks / currentTransfer.totalChunks) * 100)}%</span>
              </div>
              <div className="w-full bg-neutral-950 h-2 rounded-full overflow-hidden border border-neutral-800">
                <div
                  className="bg-emerald-500 h-full transition-all duration-150"
                  style={{ width: `${(currentTransfer.completedChunks / currentTransfer.totalChunks) * 100}%` }}
                />
              </div>
              <div className="text-[10px] text-neutral-400 flex justify-between">
                <span>{currentTransfer.completedChunks}/{currentTransfer.totalChunks} Chunks</span>
                <span>{currentTransfer.concurrencyThreads} Thds</span>
              </div>
            </div>
          )}
        </div>

        {/* Device Frame 2: Android 14 Mobile Handset */}
        <div className="lg:col-span-5 bg-neutral-900 border border-neutral-800 rounded-lg flex flex-col overflow-hidden shadow-lg">
          {/* Android Status Bar */}
          <div className="bg-neutral-950 px-3 py-2 border-b border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-neutral-400" />
              <span className="text-xs font-semibold text-neutral-200">
                {remotePeer.name}
              </span>
              <span className="text-neutral-500 text-xs font-mono">
                [Android 14 · GluonFX]
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-neutral-400 text-xs font-mono">
              <Radio className="w-3.5 h-3.5 text-emerald-400" />
              <Wifi className="w-3.5 h-3.5 text-emerald-400" />
              <span>98%</span>
            </div>
          </div>

          {/* Node Security & Key Identity */}
          <div className="p-3 bg-neutral-950/60 border-b border-neutral-800/80 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-neutral-400">FINGERPRINT:</span>
              <span className="text-neutral-200">{remotePeer.fingerprint}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-neutral-400">IP:</span>
              <span className="text-neutral-300">{remotePeer.lanIp}</span>
            </div>
          </div>

          {/* Handshake Gate */}
          {session.handshakeStep !== 'ESTABLISHED' ? (
            <div className="p-6 my-auto text-center space-y-3">
              <Shield className="w-10 h-10 text-neutral-500 mx-auto" />
              <p className="text-sm font-medium text-neutral-300">
                Awaiting Connection Request
              </p>
              <p className="text-xs text-neutral-500 max-w-xs mx-auto">
                BLE Peripheral Beacon broadcasting. Click Initiate on Desktop to perform mutual Curve25519 authentication.
              </p>
              <div className="text-[11px] font-mono text-neutral-500">
                BLE ADV: 7C:9E:BD:41:82:F0 · MTU 512B
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col p-4 space-y-4">
              {/* Encrypted Messaging Transcript */}
              <div className="flex-1 min-h-[220px] max-h-[280px] overflow-y-auto space-y-2 p-3 bg-neutral-950 rounded border border-neutral-800 font-mono text-xs">
                {messages.length === 0 ? (
                  <p className="text-neutral-600 text-center py-8">
                    Encrypted channel established.
                  </p>
                ) : (
                  messages.map(msg => {
                    const isRemote = msg.senderId === remotePeer.id;
                    return (
                      <div
                        key={msg.id}
                        className={`p-2 rounded max-w-[85%] ${
                          isRemote
                            ? 'ml-auto bg-neutral-800/80 border border-neutral-700 text-neutral-100'
                            : 'mr-auto bg-neutral-900 border border-neutral-800 text-neutral-300'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-4 text-[10px] text-neutral-500 mb-1">
                          <span className="font-semibold">{isRemote ? 'TX Handset' : 'RX Desktop'}</span>
                          <span>{msg.transport} · #{msg.nonce}</span>
                        </div>
                        <p className="text-neutral-200">{msg.content}</p>
                        <div className="text-[9px] text-neutral-500 mt-1 truncate">
                          MAC: {msg.macTag}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Android Message Input */}
              <form onSubmit={handleSendFromAndroid} className="flex gap-2">
                <input
                  type="text"
                  value={androidMessage}
                  onChange={e => setAndroidMessage(e.target.value)}
                  placeholder="Send encrypted reply from Android..."
                  className="flex-1 bg-neutral-950 border border-neutral-800 rounded px-3 py-2 text-xs text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-neutral-600 font-mono"
                />
                <button
                  type="submit"
                  className="px-3 py-2 bg-neutral-200 hover:bg-white text-neutral-950 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Send className="w-3.5 h-3.5 text-neutral-900" />
                  Reply
                </button>
              </form>

              {/* Inbound Received File Status */}
              <div className="pt-2 border-t border-neutral-800 space-y-2">
                <div className="flex items-center justify-between text-xs text-neutral-400 font-medium">
                  <span>Inbound Storage Sink</span>
                  <span className="font-mono text-neutral-500">/storage/emulated/0/Download</span>
                </div>

                {currentTransfer ? (
                  <div className="p-2.5 bg-neutral-950 border border-neutral-800 rounded flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-2 truncate">
                      <HardDrive className="w-4 h-4 text-neutral-400 shrink-0" />
                      <div className="truncate">
                        <div className="text-neutral-200 truncate">{currentTransfer.fileName}</div>
                        <div className="text-[10px] text-neutral-500">
                          {(currentTransfer.fileSizeBytes / (1024 * 1024)).toFixed(1)} MB · {currentTransfer.status.toUpperCase()}
                        </div>
                      </div>
                    </div>
                    {currentTransfer.status === 'completed' && (
                      <span className="text-emerald-400 text-xs font-semibold flex items-center gap-1 shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Verified
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="p-2.5 bg-neutral-950/60 border border-neutral-850 rounded text-xs text-neutral-500 font-mono text-center">
                    Sink idle · Awaiting chunk packets
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
