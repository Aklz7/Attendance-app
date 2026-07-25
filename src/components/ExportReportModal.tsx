import React, { useState } from 'react';
import { OverallStats, Subject, SubjectCalculation } from '../types';
import { Check, Copy, Download, FileText, Printer, X } from 'lucide-react';

interface ExportReportModalProps {
  subjects: Subject[];
  calculations: SubjectCalculation[];
  overallStats: OverallStats;
  globalBuffer: number;
  onClose: () => void;
}

export const ExportReportModal: React.FC<ExportReportModalProps> = ({
  subjects,
  calculations,
  overallStats,
  globalBuffer,
  onClose
}) => {
  const [copied, setCopied] = useState(false);

  const generateReportText = () => {
    let text = `=========================================\n`;
    text += `   SMART ATTENDANCE & SAFE SKIP REPORT   \n`;
    text += `   Generated: ${new Date().toLocaleDateString()}\n`;
    text += `=========================================\n\n`;

    text += `OVERALL SEMESTER METRICS:\n`;
    text += `- Overall Attendance: ${overallStats.overallCurrentPct.toFixed(1)}%\n`;
    text += `- Total Safe Skips Available: ${overallStats.totalSafeSkips}\n`;
    text += `- Active Safety Buffer: +${globalBuffer}%\n`;
    text += `- At Risk Subjects: ${overallStats.atRiskSubjectsCount}\n`;
    text += `- Attendance Streak: ${overallStats.currentStreak} consecutive\n\n`;

    text += `SUBJECT BREAKDOWN & SAFE SKIP CHEAT SHEET:\n`;
    text += `---------------------------------------------------\n`;

    calculations.forEach(c => {
      text += `• ${c.subjectName} (${c.subjectCode})\n`;
      text += `  - Current Attendance: ${c.currentPct.toFixed(1)}% (${c.presentCount}/${c.classesHeld} held)\n`;
      text += `  - Required Threshold: ${c.effectiveTargetPct}%\n`;
      if (c.statusAlert === 'danger') {
        text += `  - STATUS: DEFICIT! Must attend next ${c.mustAttendNext} consecutive classes.\n`;
      } else {
        text += `  - SAFE SKIPS LEFT: ${c.safeSkips} classes\n`;
      }
      text += `  - Semester-End Projected (Hold Pace): ${c.projectedHistoricalPatternPct.toFixed(1)}%\n\n`;
    });

    text += `=========================================\n`;
    text += `Calculated by Smart Attendance Predictor App\n`;
    return text;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateReportText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#05070a]/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto print:p-0 print:bg-white">
      <div className="bg-[#05070a] border border-white/10 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden my-auto print:border-none print:shadow-none print:bg-white print:text-black">
        
        {/* Header */}
        <div className="bg-[#05070a] border-b border-white/10 p-4 sm:p-5 flex items-center justify-between print:hidden">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-blue-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-widest">Semester Summary & Safe Skip Report</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-lg transition-colors border border-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Report Preview */}
        <div className="p-5 space-y-4 text-xs font-mono text-slate-300 max-h-[70vh] overflow-y-auto custom-scrollbar">
          <div className="bg-white/5 p-4 rounded-xl border border-white/10 whitespace-pre-wrap leading-relaxed text-blue-300 font-mono">
            {generateReportText()}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-[#05070a] border-t border-white/10 flex items-center justify-between print:hidden">
          <button
            onClick={handleCopy}
            className="px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-slate-200 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-blue-400" />}
            <span>{copied ? 'Copied to Clipboard!' : 'Copy Summary Text'}</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-colors shadow-lg shadow-blue-500/20"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save PDF</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
