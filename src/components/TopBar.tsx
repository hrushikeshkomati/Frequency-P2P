import React, { useState } from 'react';
import { Download, Shield, Radio, Cpu, Terminal, FileCode, Check } from 'lucide-react';
import { generateProjectZip } from '../export/javaCodebase';

export type ActiveTab = 'mesh' | 'transfer' | 'protocol' | 'codebase';

interface TopBarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  isHandshakeVerified: boolean;
  bleActive: boolean;
  lanActive: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeTab,
  onTabChange,
  isHandshakeVerified,
  bleActive,
  lanActive
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleDownloadZip = async () => {
    try {
      setIsExporting(true);
      const blob = await generateProjectZip();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'frequency-javafx-engine.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to export zip', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-neutral-950/95 backdrop-blur border-b border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark & Metadata (Clean unboxed, no pill badges) */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded bg-neutral-900 border border-neutral-700 flex items-center justify-center text-neutral-100">
            <Radio className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-display font-extrabold text-lg tracking-tight text-neutral-100 whitespace-nowrap">
              FREQUENCY
            </span>
            <span className="text-neutral-500 text-xs hidden sm:inline" aria-hidden="true">·</span>
            <span className="text-neutral-400 text-xs hidden sm:inline font-mono">
              E2EE P2P MESH
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation Links (Single-line controls) */}
        <nav className="hidden md:flex items-center gap-1 bg-neutral-900/80 p-1 rounded-lg border border-neutral-800">
          <button
            onClick={() => onTabChange('mesh')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'mesh'
                ? 'bg-neutral-800 text-neutral-100 shadow-sm border border-neutral-700'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            Device Mesh
          </button>

          <button
            onClick={() => onTabChange('transfer')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'transfer'
                ? 'bg-neutral-800 text-neutral-100 shadow-sm border border-neutral-700'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Cpu className="w-3.5 h-3.5 text-neutral-300" />
            Multithreaded Transfer
          </button>

          <button
            onClick={() => onTabChange('protocol')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'protocol'
                ? 'bg-neutral-800 text-neutral-100 shadow-sm border border-neutral-700'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-neutral-300" />
            Noise Inspector
          </button>

          <button
            onClick={() => onTabChange('codebase')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'codebase'
                ? 'bg-neutral-800 text-neutral-100 shadow-sm border border-neutral-700'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <FileCode className="w-3.5 h-3.5 text-neutral-300" />
            JavaFX Codebase
          </button>
        </nav>

        {/* Zone 3: Primary Action & Live Transport Status */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden lg:flex items-center gap-2 text-xs font-mono text-neutral-400">
            <span className={bleActive ? 'text-emerald-400 font-medium' : 'text-neutral-600'}>
              BLE 5.2
            </span>
            <span className="text-neutral-600">/</span>
            <span className={lanActive ? 'text-emerald-400 font-medium' : 'text-neutral-600'}>
              LAN TCP
            </span>
          </div>

          <button
            onClick={handleDownloadZip}
            disabled={isExporting}
            className="px-3.5 py-1.5 text-xs font-semibold bg-neutral-100 text-neutral-950 hover:bg-white rounded transition-colors whitespace-nowrap flex items-center gap-2 shadow-sm disabled:opacity-50"
          >
            {downloadSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                Exported!
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5 text-neutral-900" />
                {isExporting ? 'Packaging...' : 'Export JavaFX (.zip)'}
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
