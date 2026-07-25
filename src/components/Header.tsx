import React from 'react';
import { 
  Calculator, 
  CalendarPlus, 
  CheckSquare, 
  Download, 
  Plus, 
  RotateCcw, 
  ShieldAlert, 
  Sliders 
} from 'lucide-react';

interface HeaderProps {
  globalBuffer: number;
  setGlobalBuffer: (val: number) => void;
  onOpenAddSubject: () => void;
  onOpenQuickLog: () => void;
  onOpenBulkLog: () => void;
  onOpenMathExplainer: () => void;
  onOpenExportReport: () => void;
  onResetData: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  globalBuffer,
  setGlobalBuffer,
  onOpenAddSubject,
  onOpenQuickLog,
  onOpenBulkLog,
  onOpenMathExplainer,
  onOpenExportReport,
  onResetData
}) => {
  return (
    <header className="bg-[#05070a]/90 backdrop-blur-md border-b border-white/10 text-white sticky top-0 z-30 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          
          {/* Brand Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-cyan-400 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
              <Calculator className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold tracking-tight text-white">
                  SkipWise <span className="text-blue-400 font-normal">Predictor</span>
                </h1>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-blue-500/10 text-blue-300 border border-blue-500/20">
                  PRO ENGINE v2.4
                </span>
              </div>
              <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mt-0.5">
                Semester Analytics Dashboard
              </p>
            </div>
          </div>

          {/* Buffer Margin Slider & Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            
            {/* Global Buffer Cushion Control */}
            <div className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg px-3 py-1.5 flex items-center space-x-2 text-xs transition-colors">
              <Sliders className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <div className="flex items-center space-x-2">
                <span className="text-slate-400 uppercase tracking-widest font-medium text-[10px] whitespace-nowrap">Safety Buffer:</span>
                <span className="font-bold text-blue-400 font-mono text-xs w-8 text-right">+{globalBuffer}%</span>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="1"
                  value={globalBuffer}
                  onChange={(e) => setGlobalBuffer(Number(e.target.value))}
                  className="w-16 accent-blue-500 cursor-pointer h-1.5 bg-white/10 rounded-lg"
                  title="Adds a safety cushion percentage above the minimum requirement"
                />
              </div>
            </div>

            {/* Quick Daily Entry Button */}
            <button
              onClick={onOpenQuickLog}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-lg shadow-blue-500/20 transition-all active:scale-95"
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>Log Class</span>
            </button>

            {/* Bulk Week Log Button */}
            <button
              onClick={onOpenBulkLog}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 rounded-lg text-xs font-medium transition-all active:scale-95"
            >
              <CalendarPlus className="w-3.5 h-3.5 text-cyan-400" />
              <span>Bulk Week</span>
            </button>

            {/* Add Subject Button */}
            <button
              onClick={onOpenAddSubject}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 rounded-lg text-xs font-medium transition-all active:scale-95"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-400" />
              <span>Add Subject</span>
            </button>

            {/* Math Formula Button */}
            <button
              onClick={onOpenMathExplainer}
              className="inline-flex items-center space-x-1 px-2.5 py-1.5 bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 rounded-lg text-xs font-medium transition-all"
              title="View prediction formulas and math explanations"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Formula Math</span>
            </button>

            {/* Export Report Button */}
            <button
              onClick={onOpenExportReport}
              className="p-1.5 bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 rounded-lg text-xs transition-colors"
              title="Export Report & Safe Skip Cheat Sheet"
            >
              <Download className="w-4 h-4" />
            </button>

            {/* Reset Sample Data Button */}
            <button
              onClick={onResetData}
              className="p-1.5 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 border border-white/10 rounded-lg text-xs transition-colors"
              title="Reset to Sample Data"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

          </div>

        </div>
      </div>
    </header>
  );
};
