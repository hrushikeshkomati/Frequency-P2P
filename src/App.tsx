import React, { useState, useEffect } from 'react';
import { TopBar, ActiveTab } from './components/TopBar';
import { DualDeviceView } from './components/DualDeviceView';
import { TransferMatrixView } from './components/TransferMatrixView';
import { ProtocolInspectorView } from './components/ProtocolInspectorView';
import { CodebaseExporterModal } from './components/CodebaseExporterModal';
import { frequencyEngine, FrequencyEngineState } from './engine/adaptiveEngine';
import { ShieldCheck, Radio, Wifi, Cpu, Terminal, ArrowUpRight } from 'lucide-react';

export default function App() {
  const [engineState, setEngineState] = useState<FrequencyEngineState>(frequencyEngine.getState());
  const [activeTab, setActiveTab] = useState<ActiveTab>('mesh');

  useEffect(() => {
    const unsubscribe = frequencyEngine.subscribe((state) => {
      setEngineState(state);
    });
    return unsubscribe;
  }, []);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-neutral-800 selection:text-neutral-100">
      {/* Top Header Contract */}
      <TopBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isHandshakeVerified={engineState.session.isVerified}
        bleActive={engineState.bleEnabled}
        lanActive={engineState.lanEnabled}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {activeTab === 'mesh' && (
          <DualDeviceView
            engineState={engineState}
            onOpenTransferTab={() => setActiveTab('transfer')}
          />
        )}

        {activeTab === 'transfer' && (
          <TransferMatrixView engineState={engineState} />
        )}

        {activeTab === 'protocol' && (
          <ProtocolInspectorView engineState={engineState} />
        )}

        {activeTab === 'codebase' && (
          <CodebaseExporterModal />
        )}
      </main>

      {/* Clean Formal Engineering Footer (Anti-Slop: No fake telemetry tickers) */}
      <footer className="border-t border-neutral-800 bg-neutral-950 py-6 text-xs text-neutral-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-neutral-300">Frequency v1.0.0</span>
            <span>·</span>
            <span>Noise_XX Curve25519 / ChaCha20-Poly1305</span>
            <span>·</span>
            <span>Java 21 Virtual Threads</span>
          </div>

          <div className="flex items-center gap-4 text-neutral-400">
            <button
              onClick={() => setActiveTab('codebase')}
              className="hover:text-neutral-200 transition-colors flex items-center gap-1"
            >
              Windows .exe Specs <ArrowUpRight className="w-3 h-3" />
            </button>
            <button
              onClick={() => setActiveTab('codebase')}
              className="hover:text-neutral-200 transition-colors flex items-center gap-1"
            >
              Android .apk Specs <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
