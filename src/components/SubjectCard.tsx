import React from 'react';
import { Subject, SubjectCalculation } from '../types';
import { AlertTriangle, Check, CheckCircle2, ChevronRight, Clock, Plus, ShieldCheck, X } from 'lucide-react';

interface SubjectCardProps {
  subject: Subject;
  calculation: SubjectCalculation;
  onOpenDetail: (subjectId: string) => void;
  onQuickLog: (subjectId: string, status: 'present' | 'absent' | 'cancelled') => void;
}

export const SubjectCard: React.FC<SubjectCardProps> = ({
  subject,
  calculation: calc,
  onOpenDetail,
  onQuickLog
}) => {
  const isDanger = calc.statusAlert === 'danger';
  const isWarning = calc.statusAlert === 'warning';

  return (
    <div
      className={`rounded-2xl p-5 border flex flex-col justify-between space-y-4 relative overflow-hidden transition-all group ${
        isDanger
          ? 'bg-white/[0.03] border-l-4 border-l-rose-500 border-white/10 hover:border-white/20'
          : isWarning
          ? 'bg-blue-500/10 border-l-4 border-l-blue-500 border-white/10 ring-1 ring-blue-500/30 hover:border-white/20'
          : 'bg-white/[0.03] border-l-4 border-l-emerald-500 border-white/10 hover:border-white/20'
      }`}
    >
      
      {/* Top Header Row */}
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center space-x-2.5">
            <div
              className="w-3.5 h-3.5 rounded-full shrink-0 ring-2 ring-white/10"
              style={{ backgroundColor: subject.color }}
            />
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-white text-base group-hover:text-blue-300 transition-colors">
                  {subject.name}
                </h3>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-white/5 text-slate-300 border border-white/10">
                  {subject.code}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-0.5 font-semibold">
                {subject.scheduleDays?.join(', ') || 'Mon, Wed, Fri'} • {calc.classesHeld}/{calc.totalClassesInSemester} HELD
              </p>
            </div>
          </div>

          {/* Alert Badge */}
          {isDanger ? (
            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 shrink-0 uppercase tracking-widest">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              <span>CRITICAL</span>
            </span>
          ) : isWarning ? (
            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0 uppercase tracking-widest">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>RISKY</span>
            </span>
          ) : (
            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0 uppercase tracking-widest">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>SAFE</span>
            </span>
          )}
        </div>

        {/* Current Attendance % & Required Threshold */}
        <div className="flex items-baseline justify-between pt-1">
          <div className="flex items-baseline space-x-2">
            <span className={`text-2xl font-black font-mono tracking-tight ${isDanger ? 'text-rose-400' : isWarning ? 'text-blue-400' : 'text-emerald-400'}`}>
              {calc.currentPct.toFixed(1)}%
            </span>
            <span className="text-xs text-slate-500 font-mono">
              (Req: {calc.effectiveTargetPct.toFixed(0)}%)
            </span>
          </div>

          {/* Safe Skips vs Deficit Metric */}
          <div className="text-right">
            {isDanger ? (
              <span className="text-[10px] font-mono font-bold text-rose-400 bg-rose-950/60 px-2.5 py-1 rounded-lg border border-rose-800/60 uppercase">
                Must attend next {calc.mustAttendNext}
              </span>
            ) : (
              <span className="text-[10px] font-mono font-bold text-emerald-300 bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-800/60 uppercase">
                {calc.safeSkips} Safe Skips Left
              </span>
            )}
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="relative w-full bg-white/5 rounded-full h-2 overflow-hidden">
          {/* Target Threshold Line */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-rose-500 z-10 shadow-sm"
            style={{ left: `${Math.min(100, Math.max(0, calc.effectiveTargetPct))}%` }}
            title={`Required threshold: ${calc.effectiveTargetPct}%`}
          />
          <div
            className={`h-full transition-all duration-500 ${
              isDanger ? 'bg-rose-500' : isWarning ? 'bg-blue-500 shadow-[0_0_8px_#3b82f6]' : 'bg-emerald-500'
            }`}
            style={{ width: `${Math.min(100, Math.max(0, calc.currentPct))}%` }}
          />
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-3 gap-2 pt-1 text-center font-mono text-[11px]">
          <div className="bg-white/5 p-1.5 rounded-lg border border-white/5">
            <span className="text-emerald-400 font-bold block">{calc.presentCount}</span>
            <span className="text-slate-500 text-[9px] uppercase tracking-wider">Present</span>
          </div>
          <div className="bg-white/5 p-1.5 rounded-lg border border-white/5">
            <span className="text-rose-400 font-bold block">{calc.absentCount}</span>
            <span className="text-slate-500 text-[9px] uppercase tracking-wider">Absent</span>
          </div>
          <div className="bg-white/5 p-1.5 rounded-lg border border-white/5">
            <span className="text-blue-300 font-bold block">{calc.remainingClasses}</span>
            <span className="text-slate-500 text-[9px] uppercase tracking-wider">Left</span>
          </div>
        </div>
      </div>

      {/* Quick Action Logging & Detail Inspector Button */}
      <div className="border-t border-white/10 pt-3 flex items-center justify-between gap-2">
        {/* Quick Log Buttons */}
        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => onQuickLog(subject.id, 'present')}
            className="p-1.5 bg-emerald-950/60 hover:bg-emerald-800 text-emerald-300 border border-emerald-700/60 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-all active:scale-95"
            title="Mark Present for Today"
          >
            <Check className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">+ Present</span>
          </button>

          <button
            onClick={() => onQuickLog(subject.id, 'absent')}
            className="p-1.5 bg-rose-950/60 hover:bg-rose-800 text-rose-300 border border-rose-700/60 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-all active:scale-95"
            title="Mark Absent for Today"
          >
            <X className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">+ Absent</span>
          </button>
        </div>

        {/* View Details Button */}
        <button
          onClick={() => onOpenDetail(subject.id)}
          className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-all group-hover:border-blue-500/50"
        >
          <span>Predictor</span>
          <ChevronRight className="w-3.5 h-3.5 text-blue-400 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

    </div>
  );
};
