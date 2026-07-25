import React from 'react';
import { SubjectCalculation } from '../types';
import { AlertCircle, AlertTriangle, CheckCircle2, Sparkles } from 'lucide-react';

interface SmartWarningsBannerProps {
  calculations: SubjectCalculation[];
  onSelectSubject: (subjectId: string) => void;
}

export const SmartWarningsBanner: React.FC<SmartWarningsBannerProps> = ({
  calculations,
  onSelectSubject
}) => {
  const atRiskList = calculations.filter(c => c.statusAlert === 'danger');
  const warningList = calculations.filter(c => c.statusAlert === 'warning');
  const safeList = calculations.filter(c => c.statusAlert === 'safe');

  // Day of week pattern detection
  const dayPatternSubjects = calculations.filter(c => c.highestMissedDay && c.highestMissedDayPct && c.highestMissedDayPct >= 30);

  return (
    <div className="space-y-3">
      
      {/* Critical Red Alerts (Below Minimum) */}
      {atRiskList.map(item => (
        <div
          key={item.subjectId}
          onClick={() => onSelectSubject(item.subjectId)}
          className="bg-rose-500/10 border-l-4 border-l-rose-500 border border-white/10 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg hover:border-white/20 transition-all cursor-pointer group"
        >
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-rose-500/20 text-rose-400 rounded-xl shrink-0 mt-0.5 border border-rose-500/30">
              <AlertCircle className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-rose-200 text-sm tracking-tight">
                  CRITICAL DEFICIT: {item.subjectName} ({item.subjectCode})
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  {item.currentPct.toFixed(1)}% / {item.effectiveTargetPct.toFixed(0)}%
                </span>
              </div>
              <p className="text-xs text-rose-300/90 mt-1">
                {item.mustAttendNext > item.remainingClasses ? (
                  <span>
                    🚨 Mathematical shortage! Even attending all {item.remainingClasses} remaining classes caps attendance at {item.projectedAttendAllPct.toFixed(1)}%.
                  </span>
                ) : (
                  <span>
                    Predictive Alert: You must attend the next <strong className="underline decoration-rose-400 font-bold font-mono">{item.mustAttendNext} consecutive classes</strong> to restore your required {item.effectiveTargetPct.toFixed(0)}% threshold.
                  </span>
                )}
              </p>
            </div>
          </div>
          <button className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold shrink-0 transition-colors group-hover:scale-105 shadow-md shadow-rose-600/20">
            Fix Strategy →
          </button>
        </div>
      ))}

      {/* Warning Alerts (Trending towards risk) */}
      {warningList.map(item => (
        <div
          key={item.subjectId}
          onClick={() => onSelectSubject(item.subjectId)}
          className="bg-blue-500/10 border-l-4 border-l-blue-500 border border-white/10 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md hover:border-white/20 transition-all cursor-pointer group ring-1 ring-blue-500/20"
        >
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-blue-500/20 text-blue-400 rounded-xl shrink-0 mt-0.5 border border-blue-500/30">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-blue-100 text-sm tracking-tight">
                  APPROACHING LIMIT: {item.subjectName} ({item.subjectCode})
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {item.safeSkips} Safe Skip Left
                </span>
              </div>
              <p className="text-xs text-blue-200/80 mt-1">
                At your current historical attendance rate, you are projected to end at{' '}
                <strong className="font-bold font-mono text-white">{item.projectedHistoricalPatternPct.toFixed(1)}%</strong> by finals.
              </p>
            </div>
          </div>
          <button className="px-3 py-1.5 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-lg text-xs font-semibold shrink-0 transition-colors">
            View Projection →
          </button>
        </div>
      ))}

      {/* Day of Week Pattern Smart Detection */}
      {dayPatternSubjects.length > 0 && (
        <div className="bg-indigo-500/10 border-l-4 border-l-indigo-500 border border-white/10 rounded-2xl p-4 flex items-start space-x-3 text-xs text-indigo-200">
          <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-xl shrink-0 border border-indigo-500/30">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-indigo-300 uppercase tracking-wider text-[11px]">Pattern Detected:</span>
            <span className="ml-1 text-slate-300">
              {dayPatternSubjects.map(s => `${s.subjectName} misses on ${s.highestMissedDay}s (${s.highestMissedDayPct}% miss rate)`).join(' • ')}.
            </span>
            <span className="block mt-0.5 text-indigo-300">
              💡 Tip: You tend to miss classes on Mondays. Try to maintain your streak!
            </span>
          </div>
        </div>
      )}

      {/* Positive Reinforcement Banner */}
      {atRiskList.length === 0 && warningList.length === 0 && safeList.length > 0 && (
        <div className="bg-emerald-500/10 border-l-4 border-l-emerald-500 border border-white/10 rounded-2xl p-4 flex items-center space-x-3 text-xs text-emerald-200">
          <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl shrink-0 border border-emerald-500/30">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-emerald-300 uppercase tracking-wider text-[11px]">All Subjects Safe & On Track!</span>
            <p className="text-emerald-200/80 mt-0.5">
              You are comfortably above your minimum requirement in all subjects with a combined safe skip capacity of{' '}
              <strong className="font-bold font-mono underline">{safeList.reduce((acc, curr) => acc + curr.safeSkips, 0)} total classes</strong>.
            </p>
          </div>
        </div>
      )}

    </div>
  );
};
