import React, { useEffect, useState } from 'react';
import { AttendanceStatus, Subject } from './types';
import { initialSubjects } from './data/sampleData';
import { calculateOverallStats, calculateSubjectMetrics } from './utils/calculations';

import { Header } from './components/Header';
import { SemesterSummaryCards } from './components/SemesterSummaryCards';
import { SmartWarningsBanner } from './components/SmartWarningsBanner';
import { DashboardCharts } from './components/DashboardCharts';
import { SubjectCard } from './components/SubjectCard';
import { SubjectDetailModal } from './components/SubjectDetailModal';
import { QuickLogModal } from './components/QuickLogModal';
import { SubjectFormModal } from './components/SubjectFormModal';
import { MathFormulaExplainer } from './components/MathFormulaExplainer';
import { ExportReportModal } from './components/ExportReportModal';

import { BookOpen, Plus, RotateCcw } from 'lucide-react';

export default function App() {
  // LocalStorage state initialization
  const [subjects, setSubjects] = useState<Subject[]>(() => {
    try {
      const saved = localStorage.getItem('smart_attendance_subjects_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to parse saved subjects from localStorage', e);
    }
    return initialSubjects;
  });

  const [globalBuffer, setGlobalBuffer] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('smart_attendance_buffer');
      return saved ? Number(saved) : 0;
    } catch {
      return 0;
    }
  });

  // Modal UI states
  const [activeDetailSubjectId, setActiveDetailSubjectId] = useState<string | null>(null);
  const [quickLogMode, setQuickLogMode] = useState<'daily' | 'bulk' | null>(null);
  const [subjectFormState, setSubjectFormState] = useState<{ open: boolean; subject?: Subject | null }>({
    open: false,
    subject: null
  });
  const [showMathExplainer, setShowMathExplainer] = useState<boolean>(false);
  const [showExportReport, setShowExportReport] = useState<boolean>(false);

  // Sync to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('smart_attendance_subjects_v2', JSON.stringify(subjects));
    } catch (e) {
      console.error('Failed to save subjects to localStorage', e);
    }
  }, [subjects]);

  useEffect(() => {
    try {
      localStorage.setItem('smart_attendance_buffer', String(globalBuffer));
    } catch (e) {
      console.error('Failed to save buffer to localStorage', e);
    }
  }, [globalBuffer]);

  // Calculations
  const calculations = subjects.map(s => calculateSubjectMetrics(s, globalBuffer));
  const overallStats = calculateOverallStats(subjects, globalBuffer);

  // Handlers
  const handleQuickLogSingle = (subjectId: string, status: AttendanceStatus) => {
    const today = new Date().toISOString().split('T')[0];
    setSubjects(prev =>
      prev.map(s => {
        if (s.id !== subjectId) return s;
        // Avoid duplicate entry on same day by updating existing or appending
        const existingIdx = s.history.findIndex(r => r.date === today);
        let updatedHistory = [...s.history];
        if (existingIdx >= 0) {
          updatedHistory[existingIdx] = {
            ...updatedHistory[existingIdx],
            status,
            notes: updatedHistory[existingIdx].notes || 'Quick logged'
          };
        } else {
          updatedHistory.push({
            id: `rec-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            date: today,
            status,
            notes: 'Quick logged'
          });
        }
        return { ...s, history: updatedHistory };
      })
    );
  };

  const handleAddRecord = (subjectId: string, date: string, status: AttendanceStatus, notes?: string) => {
    setSubjects(prev =>
      prev.map(s => {
        if (s.id !== subjectId) return s;
        const existingIdx = s.history.findIndex(r => r.date === date);
        let updatedHistory = [...s.history];
        if (existingIdx >= 0) {
          updatedHistory[existingIdx] = {
            ...updatedHistory[existingIdx],
            status,
            notes: notes !== undefined ? notes : updatedHistory[existingIdx].notes
          };
        } else {
          updatedHistory.push({
            id: `rec-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            date,
            status,
            notes
          });
        }
        return { ...s, history: updatedHistory };
      })
    );
  };

  const handleDeleteRecord = (subjectId: string, recordId: string) => {
    setSubjects(prev =>
      prev.map(s => {
        if (s.id !== subjectId) return s;
        return {
          ...s,
          history: s.history.filter(r => r.id !== recordId)
        };
      })
    );
  };

  const handleSaveSubject = (subjectData: Omit<Subject, 'id' | 'history'>) => {
    if (subjectFormState.subject) {
      // Edit existing
      const targetId = subjectFormState.subject.id;
      setSubjects(prev =>
        prev.map(s => s.id === targetId ? { ...s, ...subjectData } : s)
      );
    } else {
      // Add new
      const newSubject: Subject = {
        ...subjectData,
        id: `sub-${Date.now()}`,
        history: []
      };
      setSubjects(prev => [...prev, newSubject]);
    }
  };

  const handleLogDaily = (entries: { subjectId: string; date: string; status: AttendanceStatus }[]) => {
    setSubjects(prev =>
      prev.map(s => {
        const entry = entries.find(e => e.subjectId === s.id);
        if (!entry) return s;
        const existingIdx = s.history.findIndex(r => r.date === entry.date);
        let updatedHistory = [...s.history];
        if (existingIdx >= 0) {
          updatedHistory[existingIdx] = {
            ...updatedHistory[existingIdx],
            status: entry.status
          };
        } else {
          updatedHistory.push({
            id: `rec-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            date: entry.date,
            status: entry.status,
            notes: 'Batch daily entry'
          });
        }
        return { ...s, history: updatedHistory };
      })
    );
  };

  const handleLogBulkWeek = (
    subjectIds: string[],
    startDateStr: string,
    endDateStr: string,
    defaultStatus: AttendanceStatus
  ) => {
    const start = new Date(startDateStr + 'T00:00:00');
    const end = new Date(endDateStr + 'T00:00:00');
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) return;

    // Generate date array
    const dateList: string[] = [];
    let cur = new Date(start);
    while (cur <= end) {
      dateList.push(cur.toISOString().split('T')[0]);
      cur.setDate(cur.getDate() + 1);
    }

    const dayNameMap = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    setSubjects(prev =>
      prev.map(s => {
        if (!subjectIds.includes(s.id)) return s;
        let updatedHistory = [...s.history];

        dateList.forEach(dateStr => {
          const dObj = new Date(dateStr + 'T00:00:00');
          const dayName = dayNameMap[dObj.getDay()];

          // Only log for scheduled days
          const schedule = s.scheduleDays && s.scheduleDays.length > 0 ? s.scheduleDays : ['Mon', 'Wed', 'Fri'];
          if (schedule.includes(dayName)) {
            const existingIdx = updatedHistory.findIndex(r => r.date === dateStr);
            if (existingIdx >= 0) {
              updatedHistory[existingIdx] = {
                ...updatedHistory[existingIdx],
                status: defaultStatus
              };
            } else {
              updatedHistory.push({
                id: `rec-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                date: dateStr,
                status: defaultStatus,
                notes: 'Bulk week entry'
              });
            }
          }
        });

        return { ...s, history: updatedHistory };
      })
    );
  };

  const handleResetData = () => {
    if (window.confirm('Reset all subject attendance logs back to sample initial state?')) {
      setSubjects(initialSubjects);
      setGlobalBuffer(0);
      localStorage.removeItem('smart_attendance_subjects_v2');
      localStorage.removeItem('smart_attendance_buffer');
    }
  };

  const activeDetailSubject = subjects.find(s => s.id === activeDetailSubjectId);
  const activeDetailCalc = calculations.find(c => c.subjectId === activeDetailSubjectId);

  return (
    <div className="min-h-screen bg-[#05070a] text-slate-100 font-sans antialiased selection:bg-blue-500 selection:text-white">
      
      {/* Top Navigation Bar */}
      <Header
        globalBuffer={globalBuffer}
        setGlobalBuffer={setGlobalBuffer}
        onOpenAddSubject={() => setSubjectFormState({ open: true, subject: null })}
        onOpenQuickLog={() => setQuickLogMode('daily')}
        onOpenBulkLog={() => setQuickLogMode('bulk')}
        onOpenMathExplainer={() => setShowMathExplainer(true)}
        onOpenExportReport={() => setShowExportReport(true)}
        onResetData={handleResetData}
      />

      {/* Main Workspace Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* 1. Semester KPI Summary Cards */}
        <SemesterSummaryCards
          stats={overallStats}
          globalBuffer={globalBuffer}
        />

        {/* 2. Predictive Smart Warnings & Risk Alerts */}
        <SmartWarningsBanner
          calculations={calculations}
          onSelectSubject={(id) => setActiveDetailSubjectId(id)}
        />

        {/* 3. Visual Interactive Dashboard Charts */}
        {subjects.length > 0 && (
          <DashboardCharts
            subjects={subjects}
            calculations={calculations}
            globalBuffer={globalBuffer}
          />
        )}

        {/* 4. Subject Cards Grid Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-300 uppercase tracking-widest flex items-center space-x-2">
                <BookOpen className="w-4 h-4 text-blue-400" />
                <span>SUBJECTS & SAFE SKIP METRICS</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Inspect scenario predictions, attendance history, or log single classes
              </p>
            </div>

            <button
              onClick={() => setSubjectFormState({ open: true, subject: null })}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition-all shadow-lg shadow-blue-500/20 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Add Subject</span>
            </button>
          </div>

          {subjects.length === 0 ? (
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-12 text-center space-y-3">
              <BookOpen className="w-10 h-10 text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-white">No Subjects Added Yet</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Add your subjects or click below to restore sample subjects with attendance history.
              </p>
              <button
                onClick={handleResetData}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-md hover:bg-blue-500 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Load Sample Subjects</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {subjects.map(subject => {
                const calc = calculations.find(c => c.subjectId === subject.id);
                if (!calc) return null;

                return (
                  <SubjectCard
                    key={subject.id}
                    subject={subject}
                    calculation={calc}
                    onOpenDetail={(id) => setActiveDetailSubjectId(id)}
                    onQuickLog={handleQuickLogSingle}
                  />
                );
              })}
            </div>
          )}
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#05070a] py-6 mt-12 text-center text-xs text-slate-500 uppercase tracking-wider">
        <p>SkipWise Predictor — Semester Analytics Dashboard & Attendance Trajectory Engine</p>
      </footer>

      {/* Modals & Overlay Drawers */}

      {/* 1. Subject Detail Inspector View */}
      {activeDetailSubject && activeDetailCalc && (
        <SubjectDetailModal
          subject={activeDetailSubject}
          calculation={activeDetailCalc}
          globalBuffer={globalBuffer}
          onClose={() => setActiveDetailSubjectId(null)}
          onAddRecord={handleAddRecord}
          onDeleteRecord={handleDeleteRecord}
          onEditSubject={(sub) => setSubjectFormState({ open: true, subject: sub })}
        />
      )}

      {/* 2. Quick & Bulk Logging Modal */}
      {quickLogMode && (
        <QuickLogModal
          mode={quickLogMode}
          subjects={subjects}
          onClose={() => setQuickLogMode(null)}
          onLogDaily={handleLogDaily}
          onLogBulkWeek={handleLogBulkWeek}
        />
      )}

      {/* 3. Subject Add/Edit Modal */}
      {subjectFormState.open && (
        <SubjectFormModal
          initialSubject={subjectFormState.subject}
          onClose={() => setSubjectFormState({ open: false, subject: null })}
          onSave={handleSaveSubject}
        />
      )}

      {/* 4. Math Algorithm Formula Explainer Modal */}
      {showMathExplainer && (
        <MathFormulaExplainer
          onClose={() => setShowMathExplainer(false)}
        />
      )}

      {/* 5. Printable / Copyable Report Card Export Modal */}
      {showExportReport && (
        <ExportReportModal
          subjects={subjects}
          calculations={calculations}
          overallStats={overallStats}
          globalBuffer={globalBuffer}
          onClose={() => setShowExportReport(false)}
        />
      )}

    </div>
  );
}
