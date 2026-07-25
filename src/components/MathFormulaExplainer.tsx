import React from 'react';
import { Calculator, X } from 'lucide-react';

interface MathFormulaExplainerProps {
  onClose: () => void;
}

export const MathFormulaExplainer: React.FC<MathFormulaExplainerProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-[#05070a]/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#05070a] border border-white/10 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden my-auto text-slate-100">
        
        {/* Header */}
        <div className="bg-[#05070a] border-b border-white/10 p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calculator className="w-5 h-5 text-blue-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-widest">Prediction Logic & Mathematical Algorithms</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-lg transition-colors border border-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Math Content */}
        <div className="p-5 space-y-5 text-xs text-slate-300 max-h-[75vh] overflow-y-auto custom-scrollbar">
          
          {/* Formula 1: Current Attendance */}
          <div className="bg-white/[0.03] border border-white/10 p-4 rounded-xl space-y-2">
            <h3 className="font-bold text-blue-400 text-xs uppercase tracking-wider">1. Current Attendance Percentage</h3>
            <p className="text-slate-400">
              Calculated using valid classes held so far (excluding official cancelled sessions):
            </p>
            <div className="bg-[#05070a] p-3 rounded-lg font-mono text-blue-300 border border-white/10">
              Current % = (Present Classes / (Present + Absent)) × 100
            </div>
          </div>

          {/* Formula 2: Safe Skips Formula */}
          <div className="bg-white/[0.03] border border-white/10 p-4 rounded-xl space-y-2">
            <h3 className="font-bold text-emerald-400 text-xs uppercase tracking-wider">2. "Safe Skip" Capacity Algorithm</h3>
            <p className="text-slate-400">
              Determines how many <i>additional</i> classes S can be missed while keeping final semester attendance at or above target percentage T% (including user buffer B%, so T = minRequired + B):
            </p>
            <div className="bg-[#05070a] p-3 rounded-lg font-mono text-emerald-300 border border-white/10 space-y-1">
              <p>Total Classes = Classes Held (H) + Remaining Classes (R)</p>
              <p>Max Allowable Absences = floor( Total Classes × (1 - T / 100) )</p>
              <p>Safe Skips (S) = max( 0, Max Allowable Absences - Current Absences )</p>
            </div>
            <p className="text-slate-400 text-[11px]">
              This guarantees that even if you skip all S classes, your final attendance will remain above your target threshold T%.
            </p>
          </div>

          {/* Formula 3: Deficit Recovery Formula */}
          <div className="bg-white/[0.03] border border-white/10 p-4 rounded-xl space-y-2">
            <h3 className="font-bold text-rose-400 text-xs uppercase tracking-wider">3. Consecutive Recovery Requirement (If Below Target)</h3>
            <p className="text-slate-400">
              When current attendance falls below required target T%, this formula calculates how many consecutive classes C must be attended to cross back above T%:
            </p>
            <div className="bg-[#05070a] p-3 rounded-lg font-mono text-rose-300 border border-white/10">
              C = ceil( (T × Held - 100 × Present) / (100 - T) )
            </div>
          </div>

          {/* Formula 4: Day-of-Week Weighted Historical Projection */}
          <div className="bg-white/[0.03] border border-white/10 p-4 rounded-xl space-y-2">
            <h3 className="font-bold text-cyan-400 text-xs uppercase tracking-wider">4. Day-of-Week Weighted Historical Pattern Projection</h3>
            <p className="text-slate-400">
              Instead of simple linear extrapolation, future remaining classes are projected day-by-day.
              For each scheduled future weekday d (e.g. Friday), the algorithm combines your overall historical rate P_overall with your day-specific attendance probability P_day(d):
            </p>
            <div className="bg-[#05070a] p-3 rounded-lg font-mono text-cyan-300 border border-white/10 space-y-1">
              <p>P_projected(d) = 0.6 × P_day(d) + 0.4 × P_overall</p>
              <p>Expected Future Presents = Sum of P_projected(d) for all remaining classes</p>
              <p>Projected Final % = (Present + Expected Future Presents) / Total Semester Classes × 100</p>
            </div>
            <p className="text-slate-400 text-[11px]">
              This captures behavioral habits like Friday skip tendencies or Monday morning lecture dips.
            </p>
          </div>

        </div>

        <div className="p-4 bg-[#05070a] border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold shadow-lg shadow-blue-500/20"
          >
            Got It
          </button>
        </div>

      </div>
    </div>
  );
};
