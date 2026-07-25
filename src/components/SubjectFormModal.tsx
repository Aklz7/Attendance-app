import React, { useState } from 'react';
import { Subject } from '../types';
import { BookOpen, X } from 'lucide-react';

interface SubjectFormModalProps {
  initialSubject?: Subject | null;
  onClose: () => void;
  onSave: (subjectData: Omit<Subject, 'id' | 'history'>) => void;
}

const COLOR_OPTIONS = [
  '#3b82f6', // blue
  '#10b981', // emerald
  '#ef4444', // red
  '#8b5cf6', // purple
  '#f59e0b', // amber
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#64748b', // slate
];

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const SubjectFormModal: React.FC<SubjectFormModalProps> = ({
  initialSubject,
  onClose,
  onSave
}) => {
  const [name, setName] = useState(initialSubject?.name || '');
  const [code, setCode] = useState(initialSubject?.code || '');
  const [color, setColor] = useState(initialSubject?.color || COLOR_OPTIONS[0]);
  const [minAttendancePct, setMinAttendancePct] = useState<number>(initialSubject?.minAttendancePct || 75);
  const [totalClassesInSemester, setTotalClassesInSemester] = useState<number>(initialSubject?.totalClassesInSemester || 45);
  const [scheduleDays, setScheduleDays] = useState<string[]>(initialSubject?.scheduleDays || ['Mon', 'Wed', 'Fri']);

  const toggleDay = (day: string) => {
    setScheduleDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      name: name.trim(),
      code: code.trim() || 'SUB101',
      color,
      minAttendancePct: Math.max(1, Math.min(100, minAttendancePct)),
      totalClassesInSemester: Math.max(1, totalClassesInSemester),
      scheduleDays: scheduleDays.length > 0 ? scheduleDays : ['Mon', 'Wed', 'Fri']
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#05070a]/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#05070a] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden my-auto text-slate-100">
        
        {/* Header */}
        <div className="bg-[#05070a] border-b border-white/10 p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-blue-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-widest">
              {initialSubject ? 'Edit Subject' : 'Add New Subject'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-lg transition-colors border border-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div>
            <label className="text-slate-400 uppercase tracking-wider text-[10px] font-semibold block mb-1">Subject Name:</label>
            <input
              type="text"
              placeholder="e.g. Artificial Intelligence"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-400 uppercase tracking-wider text-[10px] font-semibold block mb-1">Course Code:</label>
              <input
                type="text"
                placeholder="e.g. CS305"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>

            <div>
              <label className="text-slate-400 uppercase tracking-wider text-[10px] font-semibold block mb-1">Min Required %:</label>
              <input
                type="number"
                min="50"
                max="100"
                value={minAttendancePct}
                onChange={(e) => setMinAttendancePct(Number(e.target.value))}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-slate-400 uppercase tracking-wider text-[10px] font-semibold block mb-1">
              Total Working Classes in Semester:
            </label>
            <input
              type="number"
              min="10"
              max="120"
              value={totalClassesInSemester}
              onChange={(e) => setTotalClassesInSemester(Number(e.target.value))}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              required
            />
            <span className="text-[10px] text-slate-500 mt-1 block uppercase tracking-wider">
              Estimated total sessions scheduled across the full term.
            </span>
          </div>

          <div>
            <label className="text-slate-400 uppercase tracking-wider text-[10px] font-semibold block mb-1">Weekly Schedule Days:</label>
            <div className="flex flex-wrap gap-2">
              {WEEKDAYS.map(day => {
                const isSelected = scheduleDays.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-bold font-mono transition-all uppercase tracking-wider ${
                      isSelected
                        ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-slate-400 uppercase tracking-wider text-[10px] font-semibold block mb-1">Badge Color Theme:</label>
            <div className="flex items-center space-x-2">
              {COLOR_OPTIONS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full border-2 transition-transform ${
                    color === c ? 'border-white scale-110 shadow-md ring-2 ring-blue-500' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
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
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold shadow-lg shadow-blue-500/20"
            >
              {initialSubject ? 'Update Subject' : 'Create Subject'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
