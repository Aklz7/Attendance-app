export type AttendanceStatus = 'present' | 'absent' | 'cancelled';

export interface AttendanceRecord {
  id: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  notes?: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  color: string;
  minAttendancePct: number; // e.g., 75
  totalClassesInSemester: number; // e.g., 45
  scheduleDays: string[]; // e.g., ['Mon', 'Wed', 'Fri']
  history: AttendanceRecord[];
  targetBuffer?: number; // per subject override buffer
}

export interface SubjectCalculation {
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  color: string;
  minAttendancePct: number;
  effectiveTargetPct: number; // minAttendancePct + buffer
  totalClassesInSemester: number;
  classesHeld: number; // present + absent
  presentCount: number;
  absentCount: number;
  cancelledCount: number;
  currentPct: number;
  remainingClasses: number;
  
  // Predictive metrics
  safeSkips: number; // how many MORE classes can be missed while staying >= effectiveTargetPct
  mustAttendNext: number; // consecutive classes to attend if below target
  
  projectedAttendAllPct: number;
  projectedHistoricalPatternPct: number;
  projectedSafeSkipLimitPct: number;
  
  statusAlert: 'safe' | 'warning' | 'danger';
  statusMessage: string;
  
  // Day of week analysis
  highestMissedDay?: string;
  highestMissedDayPct?: number;
}

export interface DayOfWeekStat {
  dayName: string; // 'Mon', 'Tue', etc.
  held: number;
  present: number;
  absent: number;
  missRate: number; // percentage missed
}

export interface OverallStats {
  totalSubjects: number;
  overallCurrentPct: number;
  overallTargetPct: number;
  totalClassesHeld: number;
  totalPresent: number;
  totalAbsent: number;
  totalSafeSkips: number;
  atRiskSubjectsCount: number;
  warningSubjectsCount: number;
  safeSubjectsCount: number;
  currentStreak: number;
  bestStreak: number;
  mostRiskyDay: string;
}
