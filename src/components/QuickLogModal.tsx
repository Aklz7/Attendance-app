import React, { useState } from 'react';
import { AttendanceStatus, Subject } from '../types';
import { Calendar, Check, CheckSquare, X } from 'lucide-react';

interface QuickLogModalProps {
  mode: 'daily' | 'bulk';
  subjects: Subject[];
  onClose: () => void;
  onLogDaily: (entries: { subjectId: string; date: string; status: AttendanceStatus }[]) => void;
  onLogBulkWeek: (subjectIds: string[], startDate: string, endDate: string, defaultStatus: AttendanceStatus) => void;
}

export const QuickLogModal: React.FC<QuickLogModalProps> = ({
  mode: initialMode,
  subjects,
  onClose,
  onLogDaily,
  onLogBulkWeek
}) => {
  const [activeTab, setActiveTab] = useState<'daily' | 'bulk'>(initialMode);

  // Daily Mode State
  const [logDate, setLogDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [dailyStatuses, setDailyStatuses] = useState<Record<string, AttendanceStatus>>(() => {
    const initial: Record<string, AttendanceStatus> = {};
    subjects.forEach(s => {
      initial[s.id] = 'present';
    });
    return initial;
  });

  // Bulk Mode State
  const [bulkStartDate, setBulkStartDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 6); // past week
    return d.toISOString().split('T')[0];
  });
  const [bulkEndDate, setBulkEndDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [bulkSelectedSubjects, setBulkSelectedSubjects] = useState<string[]>(subjects.map(s => s.id));
  const [bulkDefaultStatus, setBulkDefaultStatus] = useState<AttendanceStatus>('present');

  const handleDailyStatusChange = (subjectId: string, status: AttendanceStatus) => {
    setDailyStatuses(prev => ({ ...prev, [subjectId]: status }));
  };

  const handleDailySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const entries = subjects.map(s => ({
      subjectId: s.id,
      date: logDate,
      status: dailyStatuses[s.id] || 'present'
    }));
    onLogDaily(entries);
    onClose();
  };

  const handleBulkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (bulkSelectedSubjects.length === 0) return;
    onLogBulkWeek(bulkSelectedSubjects, bulkStartDate, bulkEndDate, bulkDefaultStatus);
    onClose();
  };

  const toggleBulkSubject = (id: string) => {
    setBulkSelectedSubjects(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#05070a]/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#05070a] border border-white/10 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden my-auto">
        
        {/* Modal Header & Tabs */}
        <div className="bg-[#05070a] border-b border-white/10 p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckSquare className="w-5 h-5 text-blue-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-widest">Batch Attendance Logging</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-lg transition-colors border border-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-white/10 bg-white/[0.02] text-xs font-semibold uppercase tracking-wider">
          <button
            onClick={() => setActiveTab('daily')}
            className={`flex-1 py-3 text-center transition-colors border-b-2 ${
              activeTab === 'daily'
                ? 'border-blue-500 text-blue-400 bg-white/5 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Quick Daily Log (All)
          </button>
          <button
            onClick={() => setActiveTab('bulk')}
            className={`flex-1 py-3 text-center transition-colors border-b-2 ${
              activeTab === 'bulk'
                ? 'border-blue-500 text-blue-400 bg-white/5 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Bulk Week Log (Range)
          </button>
        </div>

        <div className="p-5">
          {activeTab === 'daily' ? (
            /* DAILY LOG FORM */
            <form onSubmit={handleDailySubmit} className="space-y-4">
              <div className="flex items-center justify-between bg-white/5 p-3 rounded-xl border border-white/10">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                  <Calendar className="w-4 h-4 text-blue-400" />
                  <span>Log Date:</span>
                </label>
                <input
                  type="date"
                  value={logDate}
                  onChange={(e) => setLogDate(e.target.value)}
                  className="bg-[#05070a] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto pr-1 custom-scrollbar">
                {subjects.map(subject => {
                  const currentStatus = dailyStatuses[subject.id] || 'present';

                  return (
                    <div
                      key={subject.id}
                      className="bg-white/[0.03] border border-white/10 p-3 rounded-xl flex items-center justify-between gap-2"
                    >
                      <div>
                        <span className="font-bold text-white text-xs block">{subject.name}</span>
                        <span className="text-[10px] text-slate-500 font-mono">{subject.code}</span>
                      </div>

                      <div className="flex items-center space-x-1">
                        <button
                          type="button"
                          onClick={() => handleDailyStatusChange(subject.id, 'present')}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                            currentStatus === 'present'
                              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                              : 'bg-white/5 text-slate-400 hover:text-slate-200 border border-white/5'
                          }`}
                        >
                          Present
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDailyStatusChange(subject.id, 'absent')}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                            currentStatus === 'absent'
                              ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                              : 'bg-white/5 text-slate-400 hover:text-slate-200 border border-white/5'
                          }`}
                        >
                          Absent
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDailyStatusChange(subject.id, 'cancelled')}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                            currentStatus === 'cancelled'
                              ? 'bg-slate-700 text-white shadow-md'
                              : 'bg-white/5 text-slate-400 hover:text-slate-200 border border-white/5'
                          }`}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 rounded-lg text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold shadow-lg shadow-blue-500/20"
                >
                  Save Daily Log for All
                </button>
              </div>
            </form>
          ) : (
            /* BULK WEEK FORM */
            <form onSubmit={handleBulkSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-white/5 p-3 rounded-xl border border-white/10">
                <div>
                  <label className="text-slate-300 uppercase tracking-wider text-[10px] font-semibold block mb-1">Start Date:</label>
                  <input
                    type="date"
                    value={bulkStartDate}
                    onChange={(e) => setBulkStartDate(e.target.value)}
                    className="w-full bg-[#05070a] border border-white/10 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-300 uppercase tracking-wider text-[10px] font-semibold block mb-1">End Date:</label>
                  <input
                    type="date"
                    value={bulkEndDate}
                    onChange={(e) => setBulkEndDate(e.target.value)}
                    className="w-full bg-[#05070a] border border-white/10 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 uppercase tracking-wider text-[10px] font-semibold block mb-1">Default Status for Selected Period:</label>
                <select
                  value={bulkDefaultStatus}
                  onChange={(e) => setBulkDefaultStatus(e.target.value as AttendanceStatus)}
                  className="w-full bg-[#05070a] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="present">Mark Present ✅ (Attended all scheduled classes)</option>
                  <option value="absent">Mark Absent ❌ (Missed classes during this period)</option>
                  <option value="cancelled">Mark Cancelled 🚫 (Break / College closed)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 uppercase tracking-wider text-[10px] font-semibold block mb-1.5">Select Subjects to Apply:</label>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                  {subjects.map(subject => {
                    const isSelected = bulkSelectedSubjects.includes(subject.id);
                    return (
                      <div
                        key={subject.id}
                        onClick={() => toggleBulkSubject(subject.id)}
                        className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                          isSelected
                            ? 'bg-blue-500/20 border-blue-500/50 text-white'
                            : 'bg-white/[0.03] border-white/10 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <span className="font-semibold">{subject.name} ({subject.code})</span>
                        {isSelected && <Check className="w-4 h-4 text-blue-400" />}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={bulkSelectedSubjects.length === 0}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg font-bold shadow-lg shadow-blue-500/20"
                >
                  Generate Bulk Entries
                </button>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};
