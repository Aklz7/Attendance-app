import React, { useState } from 'react';
import { 
  Bar, 
  BarChart, 
  CartesianGrid, 
  Legend, 
  Line, 
  LineChart, 
  ReferenceLine, 
  ResponsiveContainer, 
  Tooltip, 
  XAxis, 
  YAxis 
} from 'recharts';
import { Subject, SubjectCalculation } from '../types';
import { generateTimelineTrend } from '../utils/calculations';
import { BarChart3, LineChart as LineChartIcon, TrendingUp } from 'lucide-react';

interface DashboardChartsProps {
  subjects: Subject[];
  calculations: SubjectCalculation[];
  globalBuffer: number;
}

export const DashboardCharts: React.FC<DashboardChartsProps> = ({
  subjects,
  calculations,
  globalBuffer
}) => {
  const [activeTab, setActiveTab] = useState<'trend' | 'bar' | 'projection'>('trend');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(subjects[0]?.id || '');

  const timelineData = generateTimelineTrend(subjects, globalBuffer);

  // Bar Chart Data
  const barChartData = calculations.map(c => ({
    name: c.subjectCode || c.subjectName,
    fullName: c.subjectName,
    current: parseFloat(c.currentPct.toFixed(1)),
    target: c.effectiveTargetPct,
    safeSkips: c.safeSkips,
    status: c.statusAlert
  }));

  // Selected subject for projection chart
  const activeSubject = subjects.find(s => s.id === selectedSubjectId) || subjects[0];
  const activeCalc = calculations.find(c => c.subjectId === activeSubject?.id);

  // Projection Trajectory Data
  const projectionData = activeCalc ? [
    {
      stage: 'Current',
      'Attend All': parseFloat(activeCalc.currentPct.toFixed(1)),
      'Historical Rate': parseFloat(activeCalc.currentPct.toFixed(1)),
      'Safe Skip Limit': parseFloat(activeCalc.currentPct.toFixed(1)),
      'Required Target': activeCalc.effectiveTargetPct,
    },
    {
      stage: 'Midway',
      'Attend All': parseFloat(((activeCalc.currentPct + activeCalc.projectedAttendAllPct) / 2).toFixed(1)),
      'Historical Rate': parseFloat(((activeCalc.currentPct + activeCalc.projectedHistoricalPatternPct) / 2).toFixed(1)),
      'Safe Skip Limit': parseFloat(((activeCalc.currentPct + activeCalc.projectedSafeSkipLimitPct) / 2).toFixed(1)),
      'Required Target': activeCalc.effectiveTargetPct,
    },
    {
      stage: 'Semester End (Finals)',
      'Attend All': parseFloat(activeCalc.projectedAttendAllPct.toFixed(1)),
      'Historical Rate': parseFloat(activeCalc.projectedHistoricalPatternPct.toFixed(1)),
      'Safe Skip Limit': parseFloat(activeCalc.projectedSafeSkipLimitPct.toFixed(1)),
      'Required Target': activeCalc.effectiveTargetPct,
    }
  ] : [];

  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
      
      {/* Chart Header & Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div>
          <h2 className="text-sm font-bold text-slate-300 uppercase tracking-widest flex items-center space-x-2">
            <span>Attendance Trend & Projections</span>
          </h2>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5">
            Visualizing historical vs predicted trajectory path
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center space-x-1 bg-white/5 p-1 rounded-xl border border-white/10 self-start sm:self-auto text-xs">
          <button
            onClick={() => setActiveTab('trend')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
              activeTab === 'trend'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LineChartIcon className="w-3.5 h-3.5" />
            <span>Attendance Trend</span>
          </button>

          <button
            onClick={() => setActiveTab('bar')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
              activeTab === 'bar'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Breakdown</span>
          </button>

          <button
            onClick={() => setActiveTab('projection')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
              activeTab === 'projection'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Finals Projection</span>
          </button>
        </div>
      </div>

      {/* 1. Trend Line Chart */}
      {activeTab === 'trend' && (
        <div className="space-y-2">
          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timelineData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff" opacity={0.08} />
                <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis domain={[40, 100]} stroke="#64748b" fontSize={10} tickFormatter={(v) => `${v}%`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#05070a', borderColor: '#ffffff20', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                  formatter={(value: any) => [`${value}%`]}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <ReferenceLine y={75 + globalBuffer} stroke="#f43f5e" strokeDasharray="4 4" label={{ value: `Required Target (${75 + globalBuffer}%)`, fill: '#f43f5e', fontSize: 10, position: 'top' }} />
                
                <Line type="monotone" dataKey="Overall" stroke="#3b82f6" strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 6 }} />
                {subjects.map(s => (
                  <Line key={s.id} type="monotone" dataKey={s.code || s.name} stroke={s.color} strokeWidth={1.5} dot={false} opacity={0.7} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest text-center">
            💡 The dashed line marks the target attendance threshold. Individual subject lines trace past performance.
          </p>
        </div>
      )}

      {/* 2. Bar Chart Breakdown */}
      {activeTab === 'bar' && (
        <div className="space-y-2">
          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff" opacity={0.08} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis domain={[0, 100]} stroke="#64748b" fontSize={10} tickFormatter={(v) => `${v}%`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#05070a', borderColor: '#ffffff20', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                  formatter={(value: any, name: any) => [`${value}%`, name === 'current' ? 'Current Attendance' : 'Required Target']}
                  labelFormatter={(label, payload) => payload[0]?.payload?.fullName || label}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="current" name="Current %" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                <Bar dataKey="target" name="Required Target %" fill="#f43f5e" opacity={0.6} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest text-center">
            Comparison between your current attendance percentage and the target threshold for each subject.
          </p>
        </div>
      )}

      {/* 3. Finals Projection Chart */}
      {activeTab === 'projection' && (
        <div className="space-y-3">
          {/* Subject Selector for Projection */}
          <div className="flex items-center justify-between bg-white/5 p-2.5 rounded-xl border border-white/10">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Select Subject to Project:</label>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="bg-[#05070a] text-white text-xs rounded-lg border border-white/10 px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {subjects.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.code})
                </option>
              ))}
            </select>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={projectionData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff" opacity={0.08} />
                <XAxis dataKey="stage" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis domain={[50, 100]} stroke="#64748b" fontSize={10} tickFormatter={(v) => `${v}%`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#05070a', borderColor: '#ffffff20', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                  formatter={(value: any) => [`${value}%`]}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                
                <Line type="monotone" dataKey="Attend All" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="Historical Rate" stroke="#3b82f6" strokeWidth={2.5} strokeDasharray="3 3" dot={{ r: 4 }} />
                <Line type="monotone" dataKey="Safe Skip Limit" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="Required Target" stroke="#f43f5e" strokeWidth={2} strokeDasharray="2 2" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {activeCalc && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 text-xs">
              <div className="bg-emerald-950/30 border border-emerald-800/40 rounded-xl p-2.5">
                <span className="text-emerald-400 font-bold block uppercase text-[10px]">Attend All Remaining:</span>
                <span className="text-white font-extrabold text-sm font-mono">{activeCalc.projectedAttendAllPct.toFixed(1)}%</span>
                <span className="text-slate-400 block text-[10px]">Maximum achievable if 0 skipped</span>
              </div>
              <div className="bg-blue-950/30 border border-blue-800/40 rounded-xl p-2.5">
                <span className="text-blue-400 font-bold block uppercase text-[10px]">Historical Attendance Rate:</span>
                <span className="text-white font-extrabold text-sm font-mono">{activeCalc.projectedHistoricalPatternPct.toFixed(1)}%</span>
                <span className="text-slate-400 block text-[10px]">Based on your past attendance pace</span>
              </div>
              <div className="bg-amber-950/30 border border-amber-800/40 rounded-xl p-2.5">
                <span className="text-amber-400 font-bold block uppercase text-[10px]">Safe Skip Threshold Limit:</span>
                <span className="text-white font-extrabold text-sm font-mono">{activeCalc.projectedSafeSkipLimitPct.toFixed(1)}%</span>
                <span className="text-slate-400 block text-[10px]">If you skip all {activeCalc.safeSkips} safe skips</span>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
