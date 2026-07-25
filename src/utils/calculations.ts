import { AttendanceRecord, DayOfWeekStat, OverallStats, Subject, SubjectCalculation } from '../types';

/**
 * Calculates metrics and projections for a single subject.
 * 
 * MATH FORMULAS:
 * 1. Current % = (Present / Held) * 100
 * 2. Effective Target T = minAttendancePct + globalBuffer
 * 3. Safe Skips S = max(0, floor(Present + Remaining - (T/100)*(Held + Remaining)))
 * 4. Required Consecutive C = ceil((T * Held - 100 * Present) / (100 - T))
 * 5. Weighted Historical Projection:
 *    Uses historical attendance rate per weekday with smoothing to estimate remaining attendance.
 */
export function calculateSubjectMetrics(subject: Subject, globalBuffer: number = 0): SubjectCalculation {
  const effectiveTargetPct = Math.min(100, Math.max(0, subject.minAttendancePct + globalBuffer));
  
  // Exclude cancelled classes from total classes held
  const validHistory = subject.history || [];
  const presentCount = validHistory.filter(r => r.status === 'present').length;
  const absentCount = validHistory.filter(r => r.status === 'absent').length;
  const cancelledCount = validHistory.filter(r => r.status === 'cancelled').length;
  const classesHeld = presentCount + absentCount;
  
  const currentPct = classesHeld > 0 ? (presentCount / classesHeld) * 100 : 100;
  
  // Remaining classes calculation
  const remainingClasses = Math.max(0, subject.totalClassesInSemester - classesHeld);
  const totalSemesterClasses = classesHeld + remainingClasses;
  
  // Safe Skips Calculation
  // We want: (Present + Remaining - S) / (Held + Remaining) >= T / 100
  // S <= Present + Remaining - (T / 100) * (Held + Remaining)
  const targetFraction = effectiveTargetPct / 100;
  const maxAllowableAbsences = Math.floor(totalSemesterClasses * (1 - targetFraction));
  const rawSafeSkips = maxAllowableAbsences - absentCount;
  const safeSkips = Math.max(0, Math.min(remainingClasses, rawSafeSkips));
  
  // Required Consecutive Classes if currently below target
  let mustAttendNext = 0;
  if (currentPct < effectiveTargetPct && effectiveTargetPct < 100) {
    // (Present + C) / (Held + C) >= T / 100
    // 100*P + 100*C >= T*H + T*C
    // C*(100 - T) >= T*H - 100*P
    const numerator = (effectiveTargetPct * classesHeld) - (100 * presentCount);
    const denominator = 100 - effectiveTargetPct;
    if (denominator > 0) {
      mustAttendNext = Math.ceil(numerator / denominator);
      mustAttendNext = Math.max(0, mustAttendNext);
    }
  }

  // 1. Projected Final % if attending ALL remaining classes
  const projectedAttendAllPct = totalSemesterClasses > 0 
    ? ((presentCount + remainingClasses) / totalSemesterClasses) * 100 
    : 100;

  // 2. Projected Final % if skipping up to safe skip limit
  const projectedSafeSkipLimitPct = totalSemesterClasses > 0
    ? ((presentCount + Math.max(0, remainingClasses - safeSkips)) / totalSemesterClasses) * 100
    : 100;

  // 3. Projected Final % based on historical pattern (weighted by day-of-week)
  const dayStats = calculateSubjectDayStats(validHistory);
  const overallHistoricalRate = classesHeld > 0 ? presentCount / classesHeld : 0.85;

  let expectedFuturePresents = 0;
  if (remainingClasses > 0) {
    // Generate simulated future schedule based on subject scheduleDays
    const schedule = subject.scheduleDays && subject.scheduleDays.length > 0
      ? subject.scheduleDays
      : ['Mon', 'Wed', 'Fri'];
    
    let daysAdded = 0;
    while (daysAdded < remainingClasses) {
      const dayName = schedule[daysAdded % schedule.length];
      const dayStat = dayStats.find(d => d.dayName === dayName);
      let dayProb = overallHistoricalRate;
      
      if (dayStat && dayStat.held >= 2) {
        // Blend day specific rate with overall rate
        const dayRate = dayStat.present / dayStat.held;
        dayProb = 0.6 * dayRate + 0.4 * overallHistoricalRate;
      }
      
      expectedFuturePresents += dayProb;
      daysAdded++;
    }
  }

  const projectedHistoricalPatternPct = totalSemesterClasses > 0
    ? ((presentCount + expectedFuturePresents) / totalSemesterClasses) * 100
    : currentPct;

  // Status Alerts
  let statusAlert: 'safe' | 'warning' | 'danger' = 'safe';
  let statusMessage = '';

  if (currentPct < effectiveTargetPct) {
    statusAlert = 'danger';
    if (mustAttendNext > remainingClasses) {
      statusMessage = `Impossible to reach ${effectiveTargetPct.toFixed(0)}%! Max achievable is ${projectedAttendAllPct.toFixed(1)}%.`;
    } else {
      statusMessage = `Below target! You must attend the next ${mustAttendNext} consecutive class${mustAttendNext > 1 ? 'es' : ''}.`;
    }
  } else if (safeSkips === 0 || projectedHistoricalPatternPct < effectiveTargetPct) {
    statusAlert = 'warning';
    statusMessage = `At risk! High chance of dipping below ${effectiveTargetPct.toFixed(0)}% if attendance pattern continues.`;
  } else {
    statusAlert = 'safe';
    statusMessage = `Safe! You can miss up to ${safeSkips} more class${safeSkips !== 1 ? 'es' : ''} without falling below ${effectiveTargetPct.toFixed(0)}%.`;
  }

  // Find day with highest miss rate for this subject
  const dayWithHighestMiss = [...dayStats]
    .filter(d => d.held >= 2)
    .sort((a, b) => b.missRate - a.missRate)[0];

  return {
    subjectId: subject.id,
    subjectName: subject.name,
    subjectCode: subject.code,
    color: subject.color,
    minAttendancePct: subject.minAttendancePct,
    effectiveTargetPct,
    totalClassesInSemester: subject.totalClassesInSemester,
    classesHeld,
    presentCount,
    absentCount,
    cancelledCount,
    currentPct,
    remainingClasses,
    safeSkips,
    mustAttendNext,
    projectedAttendAllPct,
    projectedHistoricalPatternPct,
    projectedSafeSkipLimitPct,
    statusAlert,
    statusMessage,
    highestMissedDay: dayWithHighestMiss?.missRate > 20 ? dayWithHighestMiss.dayName : undefined,
    highestMissedDayPct: dayWithHighestMiss?.missRate > 20 ? Math.round(dayWithHighestMiss.missRate) : undefined,
  };
}

/**
 * Calculates day of week attendance breakdown for a subject or across all history
 */
export function calculateSubjectDayStats(history: AttendanceRecord[]): DayOfWeekStat[] {
  const daysMap: Record<string, { held: number; present: number; absent: number }> = {
    Mon: { held: 0, present: 0, absent: 0 },
    Tue: { held: 0, present: 0, absent: 0 },
    Wed: { held: 0, present: 0, absent: 0 },
    Thu: { held: 0, present: 0, absent: 0 },
    Fri: { held: 0, present: 0, absent: 0 },
    Sat: { held: 0, present: 0, absent: 0 },
    Sun: { held: 0, present: 0, absent: 0 },
  };

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  history.forEach(rec => {
    if (rec.status === 'cancelled') return;
    const dateObj = new Date(rec.date + 'T00:00:00');
    if (isNaN(dateObj.getTime())) return;
    
    const dayName = dayNames[dateObj.getDay()];
    if (daysMap[dayName]) {
      daysMap[dayName].held += 1;
      if (rec.status === 'present') daysMap[dayName].present += 1;
      if (rec.status === 'absent') daysMap[dayName].absent += 1;
    }
  });

  return Object.entries(daysMap).map(([dayName, data]) => ({
    dayName,
    held: data.held,
    present: data.present,
    absent: data.absent,
    missRate: data.held > 0 ? (data.absent / data.held) * 100 : 0,
  }));
}

/**
 * Overall summary metrics across all subjects
 */
export function calculateOverallStats(subjects: Subject[], globalBuffer: number = 0): OverallStats {
  const calculations = subjects.map(s => calculateSubjectMetrics(s, globalBuffer));
  
  let totalPresent = 0;
  let totalAbsent = 0;
  let totalHeld = 0;
  let totalSafeSkips = 0;
  let atRiskCount = 0;
  let warningCount = 0;
  let safeCount = 0;

  calculations.forEach(c => {
    totalPresent += c.presentCount;
    totalAbsent += c.absentCount;
    totalHeld += c.classesHeld;
    totalSafeSkips += c.safeSkips;

    if (c.statusAlert === 'danger') atRiskCount++;
    else if (c.statusAlert === 'warning') warningCount++;
    else safeCount++;
  });

  const overallCurrentPct = totalHeld > 0 ? (totalPresent / totalHeld) * 100 : 100;
  const avgTargetPct = subjects.length > 0 
    ? subjects.reduce((acc, s) => acc + s.minAttendancePct, 0) / subjects.length + globalBuffer
    : 75 + globalBuffer;

  // Streak calculation
  const allRecords: { date: string; status: string }[] = [];
  subjects.forEach(s => {
    (s.history || []).forEach(r => {
      if (r.status !== 'cancelled') {
        allRecords.push({ date: r.date, status: r.status });
      }
    });
  });

  // Sort by date ascending
  allRecords.sort((a, b) => a.date.localeCompare(b.date));

  let currentStreak = 0;
  let bestStreak = 0;
  let tempStreak = 0;

  allRecords.forEach(r => {
    if (r.status === 'present') {
      tempStreak++;
      bestStreak = Math.max(bestStreak, tempStreak);
    } else if (r.status === 'absent') {
      tempStreak = 0;
    }
  });

  // Calculate current active streak from end backwards
  for (let i = allRecords.length - 1; i >= 0; i--) {
    if (allRecords[i].status === 'present') {
      currentStreak++;
    } else if (allRecords[i].status === 'absent') {
      break;
    }
  }

  // Combined Day of Week Analysis across all subjects
  const allHistory = subjects.flatMap(s => s.history || []);
  const dayStats = calculateSubjectDayStats(allHistory);
  const worstDay = [...dayStats]
    .filter(d => d.held >= 3)
    .sort((a, b) => b.missRate - a.missRate)[0];

  return {
    totalSubjects: subjects.length,
    overallCurrentPct,
    overallTargetPct: avgTargetPct,
    totalClassesHeld: totalHeld,
    totalPresent,
    totalAbsent,
    totalSafeSkips,
    atRiskSubjectsCount: atRiskCount,
    warningSubjectsCount: warningCount,
    safeSubjectsCount: safeCount,
    currentStreak,
    bestStreak,
    mostRiskyDay: worstDay && worstDay.missRate > 15 ? worstDay.dayName : 'None',
  };
}

/**
 * Generates historic time-series data points for line chart.
 * Reconstructs attendance % day by day over time.
 */
export function generateTimelineTrend(subjects: Subject[], globalBuffer: number = 0) {
  // Collect all unique dates from all subjects
  const dateSet = new Set<string>();
  subjects.forEach(s => {
    (s.history || []).forEach(r => {
      if (r.status !== 'cancelled') dateSet.add(r.date);
    });
  });

  const sortedDates = Array.from(dateSet).sort();
  if (sortedDates.length === 0) return [];

  // For each date, compute cumulative attendance % for each subject and overall
  return sortedDates.map(date => {
    const point: Record<string, any> = { date };
    let totalPresentOverall = 0;
    let totalHeldOverall = 0;

    subjects.forEach(sub => {
      const subHistoryUpToDate = (sub.history || []).filter(r => r.date <= date && r.status !== 'cancelled');
      const present = subHistoryUpToDate.filter(r => r.status === 'present').length;
      const held = subHistoryUpToDate.length;

      totalPresentOverall += present;
      totalHeldOverall += held;

      point[sub.code || sub.name] = held > 0 ? parseFloat(((present / held) * 100).toFixed(1)) : 100;
    });

    point['Overall'] = totalHeldOverall > 0 ? parseFloat(((totalPresentOverall / totalHeldOverall) * 100).toFixed(1)) : 100;
    point['Target'] = 75 + globalBuffer;

    return point;
  });
}

/**
 * Generates futuristic projection data for remaining weeks/classes.
 */
export function generateProjectionTrajectory(subject: Subject, globalBuffer: number = 0) {
  const metrics = calculateSubjectMetrics(subject, globalBuffer);
  const totalHeld = metrics.classesHeld;
  const currentPresent = metrics.presentCount;
  const remaining = metrics.remainingClasses;
  const safeSkipCount = metrics.safeSkips;

  const points = [];

  // Current baseline point
  points.push({
    classNumber: totalHeld,
    label: `Current (${totalHeld})`,
    'Attend All': parseFloat(metrics.currentPct.toFixed(1)),
    'Historical Pattern': parseFloat(metrics.currentPct.toFixed(1)),
    'Safe Skip Limit': parseFloat(metrics.currentPct.toFixed(1)),
    'Required Target': metrics.effectiveTargetPct,
  });

  // Intermediate points over remaining classes
  const steps = 5;
  for (let i = 1; i <= steps; i++) {
    const addedClasses = Math.round((remaining / steps) * i);
    const futureClassNum = totalHeld + addedClasses;

    // Attend All curve
    const attendAllPresent = currentPresent + addedClasses;
    const attendAllPct = (attendAllPresent / futureClassNum) * 100;

    // Historical Pattern curve
    const historicalPresent = currentPresent + (addedClasses * (metrics.projectedHistoricalPatternPct / 100));
    const historicalPct = (historicalPresent / futureClassNum) * 100;

    // Safe Skip Limit curve
    // Distribute safe skips proportionally across remaining classes
    const skippedSoFar = Math.min(addedClasses, Math.round((safeSkipCount / remaining) * addedClasses));
    const safeSkipPresent = currentPresent + (addedClasses - skippedSoFar);
    const safeSkipPct = (safeSkipPresent / futureClassNum) * 100;

    points.push({
      classNumber: futureClassNum,
      label: i === steps ? `Final (${futureClassNum})` : `+${addedClasses} Class${addedClasses > 1 ? 'es' : ''}`,
      'Attend All': parseFloat(attendAllPct.toFixed(1)),
      'Historical Pattern': parseFloat(historicalPct.toFixed(1)),
      'Safe Skip Limit': parseFloat(safeSkipPct.toFixed(1)),
      'Required Target': metrics.effectiveTargetPct,
    });
  }

  return points;
}
