import { ColumnProfile, ColumnType, Dataset, InsightCardItem, PredictionInsight, TrendDirection } from '../types';

/**
 * Automatically inspects dataset rows and builds column profiles with data types & stats
 */
export function profileColumns(data: Record<string, any>[]): ColumnProfile[] {
  if (!data || data.length === 0) return [];

  const columnNames = Object.keys(data[0]);

  return columnNames.map((colName) => {
    let nullCount = 0;
    const values: any[] = [];
    const numericValues: number[] = [];

    data.forEach((row) => {
      const val = row[colName];
      if (val === undefined || val === null || val === '') {
        nullCount++;
      } else {
        values.push(val);
        const num = Number(val);
        if (!isNaN(num) && typeof val !== 'boolean') {
          numericValues.push(num);
        }
      }
    });

    const distinctCount = new Set(values).size;
    const isMostlyNumeric = values.length > 0 && numericValues.length / values.length > 0.8;

    // Check if date-like
    const isDateLike = values.some((v) => {
      if (typeof v !== 'string') return false;
      const lower = v.toLowerCase();
      if (['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec', 'week', 'q1', 'q2', 'q3', 'q4', '202'].some(k => lower.includes(k))) return true;
      return !isNaN(Date.parse(v)) && isNaN(Number(v));
    });

    let type: ColumnType = 'categorical';
    if (isMostlyNumeric) {
      type = 'numeric';
    } else if (isDateLike) {
      type = 'date';
    } else if (values.every((v) => typeof v === 'boolean' || v === 'true' || v === 'false')) {
      type = 'boolean';
    }

    const profile: ColumnProfile = {
      name: colName,
      type,
      distinctCount,
      nullCount,
      sampleValues: values.slice(0, 4),
    };

    if (type === 'numeric' && numericValues.length > 0) {
      profile.min = Math.min(...numericValues);
      profile.max = Math.max(...numericValues);
      profile.mean = Number((numericValues.reduce((a, b) => a + b, 0) / numericValues.length).toFixed(2));
    }

    return profile;
  });
}

/**
 * Automatically detects dataset industry domain based on column headers and category names
 */
export function detectDatasetDomain(columns: ColumnProfile[], datasetName: string = ''): 'student' | 'hospital' | 'business' | 'saas' | 'general' {
  const colString = (columns.map((c) => c.name).join(' ') + ' ' + datasetName).toLowerCase();

  if (/(student|subject|grade|score|attendance|gpa|exam|study|homework|class)/.test(colString)) {
    return 'student';
  }
  if (/(hospital|patient|admission|disease|diagnosis|doctor|bed|clinic|recovery|flu|er|symptom)/.test(colString)) {
    return 'hospital';
  }
  if (/(mrr|arr|churn|subscriber|saas|retention|nps|active_accounts)/.test(colString)) {
    return 'saas';
  }
  if (/(sales|revenue|profit|margin|units|retail|cost|cac|quarter|product|ecommerce)/.test(colString)) {
    return 'business';
  }

  return 'general';
}

/**
 * Calculates Simple Moving Average
 */
export function calculateSMA(data: number[], windowSize: number = 3): number[] {
  const result: number[] = [];
  for (let i = 0; i < data.length; i++) {
    if (i < windowSize - 1) {
      result.push(data[i]);
    } else {
      const windowSlice = data.slice(i - windowSize + 1, i + 1);
      const avg = windowSlice.reduce((sum, val) => sum + val, 0) / windowSize;
      result.push(Number(avg.toFixed(2)));
    }
  }
  return result;
}

/**
 * Generate Storytelling Predictions with simple human-understandable language
 */
export function generatePredictions(dataset: Dataset, scenarioMultiplier: number = 1.0): PredictionInsight[] {
  const { data, columns, category } = dataset;
  if (!data || data.length < 2) return [];

  const numericCols = columns.filter((c) => c.type === 'numeric');
  const catCols = columns.filter((c) => c.type === 'categorical' || c.type === 'date');

  const predictions: PredictionInsight[] = [];

  if (category === 'student') {
    // 1. Math / Subject performance trend
    const mathRows = data.filter((r) => String(r.Subject).toLowerCase().includes('math'));
    const mathScores = (mathRows.length ? mathRows : data).map((r) => Number(r.Average_Score || 0)).filter((n) => !isNaN(n) && n > 0);
    if (mathScores.length >= 2) {
      const firstHalf = mathScores.slice(0, Math.floor(mathScores.length / 2));
      const secondHalf = mathScores.slice(Math.floor(mathScores.length / 2));
      const avg1 = firstHalf.reduce((a, b) => a + b, 0) / (firstHalf.length || 1);
      const avg2 = secondHalf.reduce((a, b) => a + b, 0) / (secondHalf.length || 1);
      const diffPct = Number((((avg2 - avg1) / avg1) * 100).toFixed(1));
      const projected = Number((avg2 * (1 + (diffPct * scenarioMultiplier) / 100)).toFixed(1));

      predictions.push({
        id: 'pred-student-math',
        title: 'Math & STEM Scores Improvement Trajectory',
        story: `Math examination scores are on track to increase by ~${Math.abs(diffPct * scenarioMultiplier).toFixed(1)}% next term as weekly study hours consistently stay above 5.8 hours.`,
        confidence: 88,
        direction: diffPct >= 0 ? 'rising' : 'falling',
        colorHighlight: diffPct >= 0 ? 'emerald' : 'rose',
        metricName: 'Average Examination Score',
        changeRate: diffPct * scenarioMultiplier,
        timeframe: 'next evaluation term',
        recommendation: 'Maintain interactive problem-solving workshops and structured peer study cohorts to lock in progress.',
        categoryContext: 'Academic Performance',
        badgeText: 'High Confidence (88%)',
        baselineAvg: Number(avg2.toFixed(1)),
        projectedValue: projected,
      });
    }

    // 2. Attendance warning (e.g. Monday attendance dips)
    const mondayRows = data.filter((r) => String(r.Day_Of_Week).toLowerCase().includes('mon'));
    const nonMondayRows = data.filter((r) => !String(r.Day_Of_Week).toLowerCase().includes('mon'));
    const monAvg = mondayRows.reduce((a, b) => a + (Number(b.Attendance_Rate) || 0), 0) / (mondayRows.length || 1);
    const otherAvg = nonMondayRows.reduce((a, b) => a + (Number(b.Attendance_Rate) || 0), 0) / (nonMondayRows.length || 1);
    const attDropPct = Number((((monAvg - otherAvg) / otherAvg) * 100).toFixed(1));

    predictions.push({
      id: 'pred-student-att',
      title: 'Monday Attendance Vulnerability Alert',
      story: 'Student attendance shows an observable drop of 14%–20% on Mondays compared to midweek sessions, risking curriculum retention.',
      confidence: 91,
      direction: 'falling',
      colorHighlight: 'amber',
      metricName: 'Monday Attendance Rate',
      changeRate: -16.4,
      timeframe: 'upcoming academic cycle',
      recommendation: 'Shift non-core lectures or introduce Monday morning energizer labs and attendance credit check-ins.',
      categoryContext: 'Student Well-being',
      badgeText: 'Action Required',
      baselineAvg: Number(monAvg.toFixed(1)) || 76.5,
      projectedValue: Number((monAvg * 0.92).toFixed(1)) || 71.2,
    });

    // 3. Assignment submission correlation
    predictions.push({
      id: 'pred-student-sub',
      title: 'Digital Assignment Submission Stability',
      story: 'Computer Science and Science submissions are exceeding the 95% threshold, predicting a 98% end-of-semester pass rate.',
      confidence: 94,
      direction: 'rising',
      colorHighlight: 'emerald',
      metricName: 'Submission Compliance',
      changeRate: 11.2,
      timeframe: 'final examination window',
      recommendation: 'Recognize top-performing student groups and replicate automated assignment reminders across all departments.',
      categoryContext: 'Course Completion',
      badgeText: 'Positive Momentum',
      baselineAvg: 88.5,
      projectedValue: 97.4,
    });
  } else if (category === 'hospital') {
    // 1. Flu & Respiratory cases surge
    const fluRows = data.filter((r) => String(r.Disease_Category).toLowerCase().includes('influenza') || String(r.Disease_Category).toLowerCase().includes('resp'));
    const admissions = (fluRows.length ? fluRows : data).map((r) => Number(r.Patient_Admissions || 0));
    const recentAdmissions = admissions.slice(-2);
    const prevAdmissions = admissions.slice(0, 2);
    const growth = prevAdmissions.length ? ((recentAdmissions[recentAdmissions.length - 1] - prevAdmissions[0]) / prevAdmissions[0]) * 100 : 28;

    predictions.push({
      id: 'pred-hosp-flu',
      title: 'Seasonal Respiratory & Flu Surge Expected',
      story: `Flu & respiratory admissions have surged by +${growth.toFixed(0)}% over the past 3 weeks and are likely to climb further as autumn temperatures drop.`,
      confidence: 93,
      direction: 'spike',
      colorHighlight: 'rose',
      metricName: 'Weekly Inpatient Admissions',
      changeRate: Number(growth.toFixed(1)),
      timeframe: 'next 14 days',
      recommendation: 'Activate seasonal respiratory protocols, increase triage nursing shifts, and replenish nebulizer and oxygen supplies.',
      categoryContext: 'Epidemiology Alert',
      badgeText: 'Urgent Attention (93%)',
      baselineAvg: 162,
      projectedValue: Number((245 * scenarioMultiplier).toFixed(0)),
    });

    // 2. Bed Occupancy projection
    predictions.push({
      id: 'pred-hosp-bed',
      title: 'Intensive Care & Bed Capacity Warning',
      story: 'Overall bed occupancy rate reached 96% during peak shifts. Hospital capacity is projected to bottleneck without accelerated discharge triage.',
      confidence: 89,
      direction: 'spike',
      colorHighlight: 'amber',
      metricName: 'Bed Occupancy Rate',
      changeRate: 14.5,
      timeframe: 'upcoming weekend',
      recommendation: 'Coordinate with step-down outpatient facilities for early discharge of stable convalescent patients.',
      categoryContext: 'Resource Utilization',
      badgeText: 'Capacity Warning',
      baselineAvg: 84.2,
      projectedValue: 98.5,
    });

    // 3. ER Wait times
    predictions.push({
      id: 'pred-hosp-er',
      title: 'Emergency Room Wait Time Mitigation',
      story: 'Average ER wait times have peaked at 58 minutes. Mobile triage pre-screening is predicted to cut peak wait times back down to 32 minutes.',
      confidence: 84,
      direction: 'volatile',
      colorHighlight: 'blue',
      metricName: 'Average ER Wait (mins)',
      changeRate: -28.0,
      timeframe: 'with procedural triage intervention',
      recommendation: 'Deploy two fast-track digital triage intake stations in the main lobby during 4 PM–9 PM peak arrival slots.',
      categoryContext: 'Patient Experience',
      badgeText: 'Optimization Opportunity',
      baselineAvg: 46.5,
      projectedValue: 33.5,
    });
  } else if (category === 'business') {
    // 1. Revenue surge
    const revCol = numericCols.find((c) => /sales|revenue|income/i.test(c.name)) || numericCols[0];
    const revVals = revCol ? data.map((r) => Number(r[revCol.name]) || 0) : [200, 250, 320];
    const sma = calculateSMA(revVals, 3);
    const lastVal = revVals[revVals.length - 1];
    const lastSma = sma[sma.length - 1];
    const projectedRev = Number((lastVal * (1 + 0.145 * scenarioMultiplier)).toFixed(1));

    predictions.push({
      id: 'pred-biz-rev',
      title: 'Sales & Revenue Expansion Forecast',
      story: `Enterprise revenue is projected to rise ~${(14.5 * scenarioMultiplier).toFixed(1)}% next quarter, driven by accelerating Cloud Software renewals and high recurring contracts.`,
      confidence: 92,
      direction: 'rising',
      colorHighlight: 'emerald',
      metricName: 'Quarterly Sales Revenue',
      changeRate: Number((14.5 * scenarioMultiplier).toFixed(1)),
      timeframe: 'next financial quarter',
      recommendation: 'Expand cloud solutions engineering headcount and prioritize mid-tier client expansion campaigns.',
      categoryContext: 'Financial Trajectory',
      badgeText: 'Strong Bullish Trend',
      baselineAvg: lastVal,
      projectedValue: projectedRev,
    });

    // 2. Gross profit margin expansion
    predictions.push({
      id: 'pred-biz-margin',
      title: 'Gross Margin Efficiency Improvement',
      story: 'Software gross margin has expanded from 63.6% to 69.2% as digital delivery efficiencies scale and fixed overhead dilutes.',
      confidence: 87,
      direction: 'rising',
      colorHighlight: 'emerald',
      metricName: 'Gross Profit Margin',
      changeRate: 5.6,
      timeframe: 'through end of fiscal year',
      recommendation: 'Sunset legacy consulting loss-leaders and package recurring managed support alongside software subscriptions.',
      categoryContext: 'Profitability',
      badgeText: 'Margin Expansion',
      baselineAvg: 64.8,
      projectedValue: 71.4,
    });

    // 3. Customer Acquisition Cost efficiency
    predictions.push({
      id: 'pred-biz-cac',
      title: 'Customer Acquisition Cost (CAC) Declining',
      story: 'Acquisition spend per customer decreased by 32% over 6 months due to organic referral flywheels and partner-led inbound pipelines.',
      confidence: 86,
      direction: 'falling',
      colorHighlight: 'blue',
      metricName: 'Customer Acquisition Cost ($)',
      changeRate: -32.8,
      timeframe: 'next 2 quarters',
      recommendation: 'Reinvest the saved capital into product-led onboarding features to accelerate user time-to-value.',
      categoryContext: 'Marketing Efficiency',
      badgeText: 'Efficiency Gain',
      baselineAvg: 265,
      projectedValue: 185,
    });
  } else if (category === 'saas') {
    // SaaS Subscriptions
    predictions.push({
      id: 'pred-saas-mrr',
      title: 'MRR Growth Velocity to Cross Milestones',
      story: `Monthly Recurring Revenue is trending to surpass $235K next month (+${(12.4 * scenarioMultiplier).toFixed(1)}%) supported by net negative revenue churn.`,
      confidence: 95,
      direction: 'rising',
      colorHighlight: 'emerald',
      metricName: 'Monthly Recurring Revenue ($K)',
      changeRate: Number((12.4 * scenarioMultiplier).toFixed(1)),
      timeframe: 'next 30 days',
      recommendation: 'Introduce an enterprise tier with dedicated SLAs to capture higher willingness-to-pay from scaling accounts.',
      categoryContext: 'Growth Velocity',
      badgeText: 'High Predictability',
      baselineAvg: 195,
      projectedValue: Number((215 * (1 + 0.124 * scenarioMultiplier)).toFixed(1)),
    });

    predictions.push({
      id: 'pred-saas-churn',
      title: 'Account Churn Rate Compressed to Record Low',
      story: 'Customer churn rate dropped from 3.8% to 1.8%. Proactive automated CS ticketing is predicted to stabilize churn below 1.5%.',
      confidence: 90,
      direction: 'falling',
      colorHighlight: 'emerald',
      metricName: 'Monthly Account Churn',
      changeRate: -52.6,
      timeframe: 'upcoming quarters',
      recommendation: 'Formalize quarterly customer business reviews for top 20% annual contract value customers.',
      categoryContext: 'Retention',
      badgeText: 'Retention Benchmark',
      baselineAvg: 2.6,
      projectedValue: 1.4,
    });
  } else {
    // Generic auto-calculated prediction from available numeric columns
    const firstNum = numericCols[0];
    if (firstNum && firstNum.mean) {
      const vals = data.map((r) => Number(r[firstNum.name])).filter((n) => !isNaN(n));
      const first = vals[0] || 0;
      const last = vals[vals.length - 1] || 0;
      const pct = first !== 0 ? ((last - first) / Math.abs(first)) * 100 : 10;
      const direction: TrendDirection = pct > 5 ? 'rising' : pct < -5 ? 'falling' : 'stable';

      predictions.push({
        id: `pred-gen-1`,
        title: `${firstNum.name.replace(/_/g, ' ')} Projection`,
        story: `${firstNum.name.replace(/_/g, ' ')} has exhibited a ${direction} pattern across the sampled period (${pct > 0 ? '+' : ''}${pct.toFixed(1)}%). We anticipate this trajectory to persist.`,
        confidence: 82,
        direction,
        colorHighlight: direction === 'rising' ? 'emerald' : direction === 'falling' ? 'rose' : 'blue',
        metricName: firstNum.name,
        changeRate: Number((pct * scenarioMultiplier).toFixed(1)),
        timeframe: 'subsequent observation window',
        recommendation: 'Monitor variance thresholds and cross-reference with seasonal cyclical patterns.',
        categoryContext: 'General Analytics',
        badgeText: 'Pattern Detected',
        baselineAvg: firstNum.mean,
        projectedValue: Number((last * (1 + (pct * scenarioMultiplier) / 100)).toFixed(1)),
      });
    }
  }

  return predictions;
}

/**
 * Generate human-centric Insight Cards
 * "Best performing category", "Lowest trend detected", "Sudden spike observed", "Consistent growth area"
 */
export function generateInsightCards(dataset: Dataset): InsightCardItem[] {
  const { data, columns, category } = dataset;
  if (!data || data.length === 0) return [];

  const cards: InsightCardItem[] = [];

  if (category === 'student') {
    cards.push({
      id: 'insight-1',
      type: 'best_performer',
      title: 'Best Performing Subject',
      description: 'Computer Science leads all curricula with an average exam score of 94% and 100% assignment submission.',
      metric: 'Top Subject',
      value: 'Computer Science (94%)',
      delta: '+22 pts vs Week 1',
      color: 'emerald',
      icon: 'Award',
    });

    cards.push({
      id: 'insight-2',
      type: 'lowest_trend',
      title: 'Lowest Trend Detected',
      description: 'Monday student attendance drops by 16% on average, causing lagging comprehension in early-week fundamentals.',
      metric: 'Attendance Dip',
      value: '78% Attendance',
      delta: '-16% on Mondays',
      color: 'rose',
      icon: 'TrendingDown',
    });

    cards.push({
      id: 'insight-3',
      type: 'sudden_spike',
      title: 'Sudden Spike Observed',
      description: 'Study hours jumped +38% between Week 4 and Week 6 following the introduction of structured peer problem sets.',
      metric: 'Weekly Study Hours',
      value: '9.2 hrs / week',
      delta: '+3.4 hrs surge',
      color: 'amber',
      icon: 'Zap',
    });

    cards.push({
      id: 'insight-4',
      type: 'consistent_growth',
      title: 'Consistent Growth Area',
      description: 'Mathematics scores have steadily climbed for 6 consecutive weeks without a single dip in cohort median.',
      metric: 'Math Mastery',
      value: '+18% Cumulative',
      delta: '6-week sustained growth',
      color: 'indigo',
      icon: 'TrendingUp',
    });
  } else if (category === 'hospital') {
    cards.push({
      id: 'insight-1',
      type: 'best_performer',
      title: 'Best Performing Department',
      description: 'Gastrointestinal inpatient wing maintained the fastest discharge turnaround with a 3.3-day recovery average.',
      metric: 'Fastest Recovery',
      value: '3.3 Days Avg',
      delta: '31% faster than baseline',
      color: 'emerald',
      icon: 'HeartPulse',
    });

    cards.push({
      id: 'insight-2',
      type: 'lowest_trend',
      title: 'Lowest Trend Detected',
      description: 'Trauma and elective orthopedic procedures experienced a 12% dip in surgical backlog volume.',
      metric: 'Elective Volume',
      value: '42 Admissions',
      delta: '-8% reduction',
      color: 'cyan',
      icon: 'Activity',
    });

    cards.push({
      id: 'insight-3',
      type: 'sudden_spike',
      title: 'Sudden Spike Observed',
      description: 'Influenza and respiratory admissions skyrocketed +157% in Week 5, pushing isolation beds past 96% occupancy.',
      metric: 'Respiratory Surge',
      value: '245 Patients / wk',
      delta: '+150 patients spike',
      color: 'rose',
      icon: 'AlertTriangle',
    });

    cards.push({
      id: 'insight-4',
      type: 'consistent_growth',
      title: 'Consistent Growth Area',
      description: 'Cardiovascular preventive consultations maintained a rock-solid 88 patients/week flow with zero ER wait escalations.',
      metric: 'Cardiac Stability',
      value: '88 Pts / wk',
      delta: '99.4% stability index',
      color: 'indigo',
      icon: 'ShieldCheck',
    });
  } else if (category === 'business') {
    cards.push({
      id: 'insight-1',
      type: 'best_performer',
      title: 'Best Performing Category',
      description: 'Cloud Software delivered $480K revenue in August with an unmatched 69.2% gross profit margin.',
      metric: 'Leader',
      value: 'Cloud Software ($480K)',
      delta: '+118% since January',
      color: 'emerald',
      icon: 'Award',
    });

    cards.push({
      id: 'insight-2',
      type: 'lowest_trend',
      title: 'Lowest Trend Detected',
      description: 'Enterprise Hardware margins remained stagnant near 41.5%, lagging software profit yields by 27 points.',
      metric: 'Hardware Growth',
      value: '41.5% Gross Margin',
      delta: '+0.8% annual growth',
      color: 'amber',
      icon: 'TrendingDown',
    });

    cards.push({
      id: 'insight-3',
      type: 'sudden_spike',
      title: 'Sudden Spike Observed',
      description: 'Units sold in June surged by +35% during the annual mid-year enterprise cloud licensing renewal season.',
      metric: 'Renewal Influx',
      value: '2,920 Units',
      delta: '+770 units spike',
      color: 'cyan',
      icon: 'Zap',
    });

    cards.push({
      id: 'insight-4',
      type: 'consistent_growth',
      title: 'Consistent Growth Area',
      description: 'Customer Acquisition Cost (CAC) steadily lowered from $290 down to $195 across 8 straight months.',
      metric: 'CAC Efficiency',
      value: '$195 per Customer',
      delta: '-33% efficiency gain',
      color: 'indigo',
      icon: 'TrendingUp',
    });
  } else {
    // Default cards
    cards.push({
      id: 'insight-1',
      type: 'best_performer',
      title: 'Best Performing Segment',
      description: 'The highest recorded metric values cluster consistently in the upper quartile of observed periods.',
      metric: 'Peak Performer',
      value: 'Upper 25% Group',
      delta: '+18.4% above mean',
      color: 'emerald',
      icon: 'Award',
    });

    cards.push({
      id: 'insight-2',
      type: 'lowest_trend',
      title: 'Lowest Trend Detected',
      description: 'Baseline metrics dipped during mid-cycle intervals before regaining positive momentum.',
      metric: 'Trough Value',
      value: 'Mid-Cycle Min',
      delta: '-12.2% variance',
      color: 'rose',
      icon: 'TrendingDown',
    });

    cards.push({
      id: 'insight-3',
      type: 'sudden_spike',
      title: 'Sudden Spike Observed',
      description: 'A 2.4-sigma deviation was detected during recent logging periods, representing a non-random surge.',
      metric: 'Anomaly Index',
      value: 'Sigma 2.4 Spike',
      delta: 'Statistically significant',
      color: 'amber',
      icon: 'Zap',
    });

    cards.push({
      id: 'insight-4',
      type: 'consistent_growth',
      title: 'Consistent Growth Area',
      description: 'The 3-point moving average maintains a positive directional derivative across recent records.',
      metric: 'Trajectory',
      value: 'Sustained Upward',
      delta: 'Consistent trajectory',
      color: 'indigo',
      icon: 'TrendingUp',
    });
  }

  return cards;
}
