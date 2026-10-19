import React, { useState } from 'react';
import {
  FileCode,
  Download,
  Copy,
  Check,
  FolderTree,
  Terminal,
  Layers,
  Cpu,
  Monitor,
  Smartphone,
  ExternalLink
} from 'lucide-react';
import { JAVA_PROJECT_FILES, CodeFile, generateProjectZip } from '../export/javaCodebase';

export const CodebaseExporterModal: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<CodeFile>(JAVA_PROJECT_FILES[0]);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [copied, setCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const filteredFiles = JAVA_PROJECT_FILES.filter(
    file => categoryFilter === 'all' || file.category === categoryFilter
  );

  const handleCopyCode = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSingle = () => {
    const blob = new Blob([selectedFile.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = selectedFile.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadFullZip = async () => {
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
    } catch (err) {
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Codebase Studio Header */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <FileCode className="w-5 h-5 text-neutral-300" />
              <h2 className="text-sm font-bold text-neutral-100 font-display">
                Java 21 / JavaFX Cross-Platform Codebase Explorer
              </h2>
            </div>
            <p className="text-xs text-neutral-400">
              Modular Java backend with automated native build scripts for Windows <span className="font-mono text-neutral-200">.exe</span> (jpackage) and Android <span className="font-mono text-neutral-200">.apk</span> (GluonFX).
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleDownloadFullZip}
              disabled={isExporting}
              className="px-4 py-2 bg-neutral-100 hover:bg-white text-neutral-950 font-semibold rounded text-xs flex items-center gap-2 transition-colors disabled:opacity-50 shadow-sm"
            >
              <Download className="w-4 h-4 text-neutral-900" />
              {isExporting ? 'Packaging ZIP...' : 'Download Full Source (.zip)'}
            </button>
          </div>
        </div>

        {/* Dual Target Architecture Summary & Binary Output Paths */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5 pt-4 border-t border-neutral-800 font-mono text-xs">
          <div className="p-3.5 bg-neutral-950 rounded border border-neutral-800 flex items-start gap-3">
            <Monitor className="w-5 h-5 text-neutral-300 shrink-0 mt-0.5" />
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-neutral-100">Windows Desktop .exe</span>
                <span className="text-[10px] text-emerald-400 bg-neutral-900 px-1.5 py-0.5 rounded border border-neutral-800">
                  jpackage
                </span>
              </div>
              <div className="text-[11px] text-neutral-400">
                Binary Output: <code className="text-neutral-200 bg-neutral-900 px-1 py-0.5 rounded">target\installer\Frequency-1.0.0.exe</code>
              </div>
              <div className="text-[11px] text-neutral-500">
                To build: Download the ZIP project, extract, and execute <code className="text-neutral-300">package-windows.bat</code>. It bundles a customized zero-dependency Java runtime using <code className="text-neutral-400">jlink</code> and creates the native Windows installer.
              </div>
            </div>
          </div>

          <div className="p-3.5 bg-neutral-950 rounded border border-neutral-800 flex items-start gap-3">
            <Smartphone className="w-5 h-5 text-neutral-300 shrink-0 mt-0.5" />
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-neutral-100">Android Mobile .apk</span>
                <span className="text-[10px] text-emerald-400 bg-neutral-900 px-1.5 py-0.5 rounded border border-neutral-800">
                  GluonFX AOT
                </span>
              </div>
              <div className="text-[11px] text-neutral-400">
                Binary Output: <code className="text-neutral-200 bg-neutral-900 px-1 py-0.5 rounded">target/gluonfx/arm64-v8a/gvm/Frequency.apk</code>
              </div>
              <div className="text-[11px] text-neutral-500">
                To build: Run <code className="text-neutral-300">./build-android.sh</code>. It compiles JavaFX bytecode into Ahead-of-Time (AOT) ARM64 machine code via GraalVM Substrate VM and packages the signed APK with BLE and Wi-Fi multicast permissions.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Explorer Workspace Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: File Tree & Filters */}
        <div className="lg:col-span-4 bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden font-mono text-xs shadow-lg">
          {/* Category Filter */}
          <div className="p-2.5 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between">
            <span className="text-neutral-400 font-semibold text-[11px]">PROJECT TREE</span>
            <div className="flex gap-1">
              {['all', 'crypto', 'network', 'ui', 'build'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-1.5 py-0.5 text-[10px] rounded uppercase transition-colors ${
                    categoryFilter === cat
                      ? 'bg-neutral-800 text-neutral-200 font-bold'
                      : 'text-neutral-500 hover:text-neutral-300'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* File List */}
          <div className="max-h-[500px] overflow-y-auto divide-y divide-neutral-800/80">
            {filteredFiles.map(file => {
              const isSelected = selectedFile.path === file.path;
              return (
                <button
                  key={file.path}
                  onClick={() => setSelectedFile(file)}
                  className={`w-full text-left p-2.5 transition-colors flex items-center justify-between gap-2 ${
                    isSelected
                      ? 'bg-neutral-800 text-neutral-100'
                      : 'hover:bg-neutral-950/80 text-neutral-400'
                  }`}
                >
                  <div className="truncate">
                    <div className="font-semibold text-neutral-200 truncate">{file.name}</div>
                    <div className="text-[10px] text-neutral-500 truncate">{file.path}</div>
                  </div>
                  <span className="text-[9px] uppercase px-1.5 py-0.5 bg-neutral-950 rounded text-neutral-400 shrink-0">
                    {file.category}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Code Viewer */}
        <div className="lg:col-span-8 bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden font-mono text-xs flex flex-col shadow-lg">
          {/* File Action Bar */}
          <div className="p-3 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between gap-4">
            <div className="truncate">
              <span className="font-bold text-neutral-200">{selectedFile.name}</span>
              <span className="text-neutral-500 text-[11px] ml-2 hidden sm:inline">
                {selectedFile.description}
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleCopyCode}
                className="px-2.5 py-1 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 rounded border border-neutral-800 flex items-center gap-1.5 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-neutral-400" />
                    Copy
                  </>
                )}
              </button>

              <button
                onClick={handleDownloadSingle}
                className="px-2.5 py-1 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 rounded border border-neutral-800 flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-neutral-400" />
                Download
              </button>
            </div>
          </div>

          {/* Syntax Content Box */}
          <div className="p-4 bg-neutral-950/90 max-h-[500px] overflow-y-auto select-all text-neutral-200 leading-relaxed font-mono text-[11px] whitespace-pre">
            {selectedFile.content}
          </div>
        </div>
      </div>
    </div>
  );
};
