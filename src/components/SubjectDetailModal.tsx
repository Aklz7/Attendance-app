import React, { useState } from 'react';
import { AttendanceStatus, Subject, SubjectCalculation } from '../types';
import { calculateSubjectDayStats } from '../utils/calculations';
import { 
  AlertTriangle, 
  Calendar, 
  Check, 
  Clock, 
  HelpCircle, 
  Info, 
  Plus, 
  ShieldCheck, 
  Sliders, 
  Trash2, 
  X 
} from 'lucide-react';

interface SubjectDetailModalProps {
  subject: Subject;
  calculation: SubjectCalculation;
  globalBuffer: number;
  onClose: () => void;
  onAddRecord: (subjectId: string, date: string, status: AttendanceStatus, notes?: string) => void;
  onDeleteRecord: (subjectId: string, recordId: string) => void;
  onEditSubject: (subject: Subject) => void;
}

export const SubjectDetailModal: React.FC<SubjectDetailModalProps> = ({
  subject,
  calculation: calc,
  globalBuffer,
  onClose,
  onAddRecord,
  onDeleteRecord,
  onEditSubject
}) => {
  const [scenarioMissCount, setScenarioMissCount] = useState<number>(calc.safeSkips);
  const [filterStatus, setFilterStatus] = useState<'all' | 'present' | 'absent' | 'cancelled'>('all');
  const [showMathExplainer, setShowMathExplainer] = useState(false);

  // New log entry state
  const [newDate, setNewDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [newStatus, setNewStatus] = useState<AttendanceStatus>('present');
  const [newNotes, setNewNotes] = useState<string>('');

  // Day of week breakdown
  const dayStats = calculateSubjectDayStats(subject.history || []);

  // Filtered attendance history
  const filteredHistory = (subject.history || []).filter(r => {
    if (filterStatus === 'all') return true;
    return r.status === filterStatus;
  }).sort((a, b) => b.date.localeCompare(a.date));

  // Scenario Calculation:
  // If user misses scenarioMissCount classes out of remaining classes
  const totalHeldAfterSemester = subject.totalClassesInSemester;
  const totalPresentScenario = calc.presentCount + Math.max(0, calc.remainingClasses - scenarioMissCount);
  const scenarioPct = totalHeldAfterSemester > 0 
    ? (totalPresentScenario / totalHeldAfterSemester) * 100 
    : 100;
  
  const isScenarioSafe = scenarioPct >= calc.effectiveTargetPct;

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDate) return;
    onAddRecord(subject.id, newDate, newStatus, newNotes);
    setNewNotes('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#05070a]/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[#05070a] border border-white/10 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        
        {/* Modal Header */}
        <div className="bg-[#05070a] border-b border-white/10 p-4 sm:p-6 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center space-x-3">
            <div
              className="w-4 h-4 rounded-full shrink-0 ring-2 ring-white/20"
              style={{ backgroundColor: subject.color }}
            />
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-bold text-white tracking-tight">{subject.name}</h2>
                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-white/5 text-slate-300 border border-white/10">
                  {subject.code}
                </span>
              </div>
              <p className="text-xs text-slate-500 uppercase tracking-widest mt-0.5">
                Target: {calc.effectiveTargetPct}% • Total Classes in Semester: {subject.totalClassesInSemester}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-lg transition-colors border border-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content Body */}
        <div className="p-4 sm:p-6 space-y-6 overflow-y-auto custom-scrollbar">
          
          {/* Top Metric Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="bg-white/[0.03] border border-white/10 rounded-xl p-3.5">
              <span className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold block">Current Attendance</span>
              <span className={`text-2xl font-black font-mono ${calc.statusAlert === 'danger' ? 'text-rose-400' : 'text-white'}`}>
                {calc.currentPct.toFixed(1)}%
              </span>
              <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
                {calc.presentCount} present / {calc.classesHeld} held
              </span>
            </div>

            <div className="bg-white/[0.03] border border-white/10 rounded-xl p-3.5">
              <span className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold block">Safe Skips Remaining</span>
              <span className="text-2xl font-black font-mono text-emerald-400">
                {calc.safeSkips}
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                Above {calc.effectiveTargetPct}% limit
              </span>
            </div>

            <div className="bg-white/[0.03] border border-white/10 rounded-xl p-3.5">
              <span className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold block">Classes Remaining</span>
              <span className="text-2xl font-black font-mono text-blue-400">
                {calc.remainingClasses}
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                Out of {subject.totalClassesInSemester} total
              </span>
            </div>

            <div className="bg-white/[0.03] border border-white/10 rounded-xl p-3.5">
              <span className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold block">Status Assessment</span>
              {calc.statusAlert === 'danger' ? (
                <span className="text-xs font-bold text-rose-400 uppercase font-mono block mt-1">
                  🚨 Need {calc.mustAttendNext} Next
                </span>
              ) : (
                <span className="text-xs font-bold text-emerald-400 uppercase font-mono block mt-1">
                  ✨ Healthy Margin
                </span>
              )}
              <span className="text-[10px] text-slate-500 block mt-0.5 line-clamp-1">
                {calc.statusMessage}
              </span>
            </div>
          </div>

          {/* Interactive Skip Simulator ("What-if" Scenario Slider) */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-5 shadow-inner space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sliders className="w-4 h-4 text-blue-400" />
                <h3 className="text-xs font-bold uppercase tracking-widest text-white">
                  Safe Skip Scenario Simulator
                </h3>
              </div>
              <button
                onClick={() => setShowMathExplainer(!showMathExplainer)}
                className="text-xs text-blue-400 hover:text-blue-300 underline flex items-center space-x-1"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>How is this calculated?</span>
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Drag the slider to see how missing <strong className="text-white font-mono">{scenarioMissCount}</strong> additional classes out of your <strong className="text-white font-mono">{calc.remainingClasses} remaining</strong> classes impacts your semester-end attendance %.
            </p>

            <div className="flex flex-col sm:flex-row sm:items-center gap-4 bg-[#05070a]/90 p-4 rounded-xl border border-white/10">
              <div className="flex-1 space-y-2">
                <div className="flex justify-between text-xs font-semibold text-slate-300">
                  <span>Additional Missed Classes: <strong className="text-blue-400 font-mono text-sm">{scenarioMissCount}</strong></span>
                  <span>Max Remaining: {calc.remainingClasses}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={Math.max(1, calc.remainingClasses)}
                  step="1"
                  value={scenarioMissCount}
                  onChange={(e) => setScenarioMissCount(Number(e.target.value))}
                  className="w-full accent-blue-500 cursor-pointer h-1.5 bg-white/10 rounded-lg"
                />
              </div>

              {/* Projected Result Badge */}
              <div className={`p-3.5 rounded-xl border text-center shrink-0 min-w-[140px] ${
                isScenarioSafe 
                  ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300' 
                  : 'bg-rose-950/60 border-rose-800 text-rose-300'
              }`}>
                <span className="text-[10px] uppercase font-bold tracking-widest block opacity-80">Projected Final %</span>
                <span className="text-2xl font-black font-mono">{scenarioPct.toFixed(1)}%</span>
                <span className="text-[10px] block font-semibold mt-0.5 uppercase tracking-wider">
                  {isScenarioSafe ? '✅ Meets Target' : '❌ Below Target'}
                </span>
              </div>
            </div>

            {/* Substituted Math Calculation Breakdown */}
            {showMathExplainer && (
              <div className="bg-[#05070a] border border-white/10 p-4 rounded-xl text-xs text-slate-300 space-y-2">
                <h4 className="font-bold text-white flex items-center space-x-1.5 uppercase tracking-wider text-[11px]">
                  <Info className="w-4 h-4 text-blue-400" />
                  <span>Substituted Math Formula for {subject.name}:</span>
                </h4>
                <div className="font-mono bg-white/5 p-2.5 rounded-lg border border-white/10 text-blue-300 space-y-1">
                  <p>Total Final Classes = Held ({calc.classesHeld}) + Remaining ({calc.remainingClasses}) = {subject.totalClassesInSemester}</p>
                  <p>Final Present Count = Current Present ({calc.presentCount}) + Attended ({calc.remainingClasses - scenarioMissCount}) = {totalPresentScenario}</p>
                  <p>Final Attendance % = ({totalPresentScenario} / {subject.totalClassesInSemester}) × 100 = {scenarioPct.toFixed(1)}%</p>
                  <p className="text-slate-400 pt-1 border-t border-white/10 text-[11px]">
                    Required Limit: {calc.effectiveTargetPct}% (Min {subject.minAttendancePct}% + Safety Buffer {globalBuffer}%)
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Day-of-Week Attendance Pattern for this subject */}
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 space-y-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Day-of-Week Miss Analytics ({subject.code})
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map(dayName => {
                const stat = dayStats.find(d => d.dayName === dayName);
                const held = stat?.held || 0;
                const missRate = stat?.missRate || 0;
                return (
                  <div key={dayName} className="bg-[#05070a] p-2 rounded-xl border border-white/10 font-mono">
                    <span className="font-bold text-slate-300 block">{dayName}</span>
                    <span className="text-slate-500 text-[9px] block">{held} held</span>
                    <span className={`text-xs font-extrabold block mt-0.5 ${missRate > 25 ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {held > 0 ? `${missRate.toFixed(0)}% miss` : 'None'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Add Attendance Class Entry Form */}
          <form onSubmit={handleAddSubmit} className="bg-white/[0.03] border border-white/10 p-4 rounded-2xl space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-widest flex items-center space-x-1.5">
              <Plus className="w-4 h-4 text-emerald-400" />
              <span>Log Single Class Entry</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="text-slate-400 uppercase tracking-wider text-[10px] font-semibold block mb-1">Date:</label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full bg-[#05070a] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="text-slate-400 uppercase tracking-wider text-[10px] font-semibold block mb-1">Status:</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as AttendanceStatus)}
                  className="w-full bg-[#05070a] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="present">Present ✅</option>
                  <option value="absent">Absent ❌</option>
                  <option value="cancelled">Cancelled 🚫</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 uppercase tracking-wider text-[10px] font-semibold block mb-1">Notes (optional):</label>
                <input
                  type="text"
                  placeholder="e.g., Midterm review, Overslept"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full bg-[#05070a] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg text-xs transition-colors shadow-lg shadow-blue-500/20"
            >
              Add Attendance Entry
            </button>
          </form>

          {/* Attendance History Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-blue-400" />
                <span>Class Attendance History ({filteredHistory.length})</span>
              </h3>

              {/* Status Filter */}
              <div className="flex items-center space-x-1 bg-white/5 p-1 rounded-xl border border-white/10 text-xs">
                {(['all', 'present', 'absent', 'cancelled'] as const).map(status => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`px-2.5 py-1 rounded-lg capitalize font-medium transition-colors ${
                      filterStatus === status ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {filteredHistory.length === 0 ? (
              <div className="p-8 text-center bg-white/[0.02] rounded-2xl border border-white/10 text-slate-500 text-xs">
                No attendance records match the selected filter.
              </div>
            ) : (
              <div className="border border-white/10 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-white/5 text-slate-400 font-semibold border-b border-white/10 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-3">Date</th>
                      <th className="p-3">Day</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Notes</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 bg-transparent">
                    {filteredHistory.map(rec => {
                      const dateObj = new Date(rec.date + 'T00:00:00');
                      const dayName = isNaN(dateObj.getTime()) ? '' : dateObj.toLocaleDateString('en-US', { weekday: 'short' });

                      return (
                        <tr key={rec.id} className="hover:bg-white/5 transition-colors">
                          <td className="p-3 font-semibold text-white font-mono">{rec.date}</td>
                          <td className="p-3 text-slate-400 font-mono">{dayName}</td>
                          <td className="p-3">
                            {rec.status === 'present' ? (
                              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                                <Check className="w-3 h-3" />
                                <span>Present</span>
                              </span>
                            ) : rec.status === 'absent' ? (
                              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30">
                                <X className="w-3 h-3" />
                                <span>Absent</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-white/10 text-slate-300 font-medium">
                                <span>Cancelled</span>
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-slate-400 italic">{rec.notes || '—'}</td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => onDeleteRecord(subject.id, rec.id)}
                              className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors"
                              title="Delete record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
