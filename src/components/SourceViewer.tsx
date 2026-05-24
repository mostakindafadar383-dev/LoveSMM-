import { useState } from 'react';
import { phpSourceCodeMap } from '../data';
import { Folder, FileCode, Copy, CheckCircle2, Info, ArrowDownToLine, Database } from 'lucide-react';

interface SourceViewerProps {
  onNotify: (msg: string, type: 'success' | 'info') => void;
}

export default function SourceViewer({ onNotify }: SourceViewerProps) {
  const [selectedFile, setSelectedFile] = useState<string>('/php-smm-panel/README.md');
  const [copied, setCopied] = useState<boolean>(false);

  const files = Object.keys(phpSourceCodeMap);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    onNotify('Code template copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* File Tree Navigator */}
      <div className="lg:col-span-1 bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-xl p-5 glow-purple">
        <h3 className="font-display font-medium text-sm text-slate-300 uppercase tracking-widest mb-4 flex items-center gap-2">
          <Folder className="w-4 h-4 text-purple-400" /> Repository Files
        </h3>
        
        <div className="space-y-1.5 font-mono text-xs">
          {/* Root Directory Visualizer */}
          <div className="text-slate-500 flex items-center gap-1.5 px-2 py-1">
            <span className="text-purple-400">📁</span>
            <span>php-smm-panel/</span>
          </div>
          
          <div className="pl-4 space-y-1.5">
            {files.map((filePath) => {
              const fileName = filePath.replace('/php-smm-panel/', '');
              const isSelected = filePath === selectedFile;
              const isSQL = fileName.endsWith('.sql');
              const isMD = fileName.endsWith('.md');

              return (
                <button
                  key={filePath}
                  onClick={() => setSelectedFile(filePath)}
                  className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                    isSelected
                      ? 'bg-purple-500/10 border border-purple-500/20 text-purple-300 font-medium'
                      : 'border border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                  id={`file-btn-${fileName.replace(/\W/g, '-')}`}
                >
                  {isSQL ? (
                    <Database className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  ) : isMD ? (
                    <Info className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  ) : (
                    <FileCode className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  )}
                  <span className="truncate">{fileName}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Download Info Indicator */}
        <div className="mt-8 p-3 rounded-lg bg-slate-950/80 border border-slate-800 text-xs text-slate-400 space-y-2">
          <div className="flex items-center gap-2 text-purple-300 font-medium">
            <ArrowDownToLine className="w-3.5 h-3.5 shrink-0" />
            <span>How to Download ZIP?</span>
          </div>
          <p className="leading-relaxed">
            These files are already written in your current container workspace! 
          </p>
          <p className="leading-relaxed text-slate-300">
            Click the <strong className="text-slate-100">Settings icon (⚙️)</strong> in the top-right corner of AI Studio, and choose <strong className="text-purple-400">"Export to ZIP"</strong> to download everything.
          </p>
        </div>
      </div>

      {/* Code Reader Container */}
      <div className="lg:col-span-3 flex flex-col bg-slate-950/80 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-900 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-500/60 block"></span>
              <span className="w-3 h-3 rounded-full bg-yellow-500/60 block"></span>
              <span className="w-3 h-3 rounded-full bg-green-500/60 block"></span>
            </div>
            <span className="text-xs font-mono text-slate-400 ml-2 select-all">
              {selectedFile}
            </span>
          </div>

          <button
            onClick={() => handleCopy(phpSourceCodeMap[selectedFile])}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/80 hover:bg-slate-800 rounded-md border border-slate-700 text-xs text-slate-300 hover:text-white transition-all duration-200"
            id="copy-code-btn"
          >
            {copied ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-medium">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Copy Code</span>
              </>
            )}
          </button>
        </div>

        {/* Code Block display */}
        <div className="p-5 overflow-auto max-h-[580px] font-mono text-xs text-slate-300 leading-relaxed bg-[#0b0f19]">
          <pre className="whitespace-pre select-text">
            <code>
              {phpSourceCodeMap[selectedFile]}
            </code>
          </pre>
        </div>

        {/* Action Bottom Note Footer */}
        <div className="px-5 py-3 bg-slate-900/60 border-t border-slate-800 flex items-center gap-2 text-xs text-slate-400">
          <span className="text-xs px-2 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-slate-300">
            {selectedFile.split('.').pop()?.toUpperCase()}
          </span>
          <span>Fully compliant with standard SMM panel integration standards.</span>
        </div>
      </div>
    </div>
  );
}
