import React from 'react';
import { OverallStats } from '../types';
import { AlertTriangle, Flame, ShieldCheck, TrendingUp } from 'lucide-react';

interface SemesterSummaryCardsProps {
  stats: OverallStats;
  globalBuffer: number;
}

export const SemesterSummaryCards: React.FC<SemesterSummaryCardsProps> = ({ stats, globalBuffer }) => {
  const isOverallHealthy = stats.overallCurrentPct >= stats.overallTargetPct;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      
      {/* 1. Overall Attendance % */}
      <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all relative overflow-hidden group">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
            Semester Attendance
          </span>
          <div className={`p-2 rounded-xl ${isOverallHealthy ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline space-x-2">
          <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400 tracking-tight">
            {stats.overallCurrentPct.toFixed(1)}%
          </span>
          <span className="text-xs font-mono text-slate-500">
            vs {stats.overallTargetPct.toFixed(0)}% target
          </span>
        </div>
        <div className="mt-3 w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              isOverallHealthy ? 'bg-blue-500 shadow-[0_0_8px_#3b82f6]' : 'bg-gradient-to-r from-rose-500 to-amber-500'
            }`}
            style={{ width: `${Math.min(100, Math.max(0, stats.overallCurrentPct))}%` }}
          />
        </div>
        <div className="mt-2 text-[10px] text-slate-500 font-mono flex justify-between uppercase">
          <span>{stats.totalPresent} Present / {stats.totalClassesHeld} Held</span>
          <span>{stats.totalAbsent} Absent</span>
        </div>
      </div>

      {/* 2. Total Safe Skips */}
      <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all relative overflow-hidden group">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
            Safe Skip Capacity
          </span>
          <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <ShieldCheck className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline space-x-2">
          <span className="text-3xl font-black text-white tracking-tight font-mono">
            {stats.totalSafeSkips.toString().padStart(2, '0')}
          </span>
          <span className="text-[10px] uppercase tracking-wider font-semibold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-500/20">
            {stats.totalSubjects} subjects
          </span>
        </div>
        <p className="mt-3 text-xs text-slate-400 line-clamp-1">
          {globalBuffer > 0 ? `Includes +${globalBuffer}% safety buffer` : 'Classes left to skip across semester'}
        </p>
      </div>

      {/* 3. At Risk Subjects */}
      <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all relative overflow-hidden group">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
            Risk Assessment
          </span>
          <div className={`p-2 rounded-xl ${stats.atRiskSubjectsCount > 0 ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20 animate-pulse' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline space-x-2">
          <span className="text-3xl font-black text-white tracking-tight font-mono">
            {stats.atRiskSubjectsCount}
          </span>
          <span className="text-xs text-slate-400">
            subject{stats.atRiskSubjectsCount !== 1 ? 's' : ''} in danger
          </span>
        </div>
        <div className="mt-3 flex items-center space-x-2 text-[10px] font-semibold uppercase">
          <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            {stats.safeSubjectsCount} Safe
          </span>
          {stats.warningSubjectsCount > 0 && (
            <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
              {stats.warningSubjectsCount} Warning
            </span>
          )}
        </div>
      </div>

      {/* 4. Attendance Streak & Pattern */}
      <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all relative overflow-hidden group">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
            Attendance Streak
          </span>
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Flame className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline space-x-2">
          <span className="text-3xl font-black text-white tracking-tight font-mono">
            {stats.currentStreak} Days
          </span>
        </div>
        <div className="text-[9px] text-emerald-400 font-bold uppercase mt-1 tracking-wider">
          🔥 All-Time Best: {stats.bestStreak} Days
        </div>
      </div>

    </div>
  );
};
