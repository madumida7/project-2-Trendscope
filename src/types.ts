export type UserRole = 'admin' | 'user' | 'analyst';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt: string;
  lastLogin: string;
  status: 'active' | 'suspended';
}

export type ColumnType = 'numeric' | 'categorical' | 'date' | 'boolean' | 'text';

export interface ColumnProfile {
  name: string;
  type: ColumnType;
  distinctCount: number;
  nullCount: number;
  sampleValues: (string | number)[];
  min?: number;
  max?: number;
  mean?: number;
}

export interface Dataset {
  id: string;
  name: string;
  description: string;
  category: 'student' | 'hospital' | 'business' | 'saas' | 'general';
  rowCount: number;
  columnCount: number;
  columns: ColumnProfile[];
  data: Record<string, any>[];
  uploadedAt: string;
  uploadedBy: string;
  tags: string[];
}

export type ChartType = 'line' | 'bar' | 'pie' | 'area' | 'donut';

export interface ChartConfig {
  type: ChartType;
  xAxisKey: string;
  yAxisKey: string;
  groupByKey?: string;
  aggregation: 'sum' | 'avg' | 'count' | 'max' | 'min';
  title?: string;
  dateRange?: [string, string];
}

export type TrendDirection = 'rising' | 'falling' | 'stable' | 'volatile' | 'spike';

export interface PredictionInsight {
  id: string;
  title: string;
  story: string; // Plain-English narrative description
  confidence: number; // 0 to 100%
  direction: TrendDirection;
  colorHighlight: 'emerald' | 'rose' | 'amber' | 'blue' | 'purple';
  metricName: string;
  changeRate: number; // e.g., +14.8% or -22%
  timeframe: string; // "next month", "this weekend", "Q3"
  recommendation: string;
  categoryContext: string;
  badgeText: string;
  baselineAvg: number;
  projectedValue: number;
}

export interface InsightCardItem {
  id: string;
  type: 'best_performer' | 'lowest_trend' | 'sudden_spike' | 'consistent_growth' | 'anomaly';
  title: string;
  description: string;
  metric: string;
  value: string;
  delta: string;
  color: 'emerald' | 'rose' | 'amber' | 'indigo' | 'cyan';
  icon: string;
}

export interface ActivityLog {
  id: string;
  action: string;
  timestamp: string;
  user: string;
  details: string;
  iconType: 'upload' | 'prediction' | 'chart' | 'login' | 'export' | 'admin';
}

export interface AdminStats {
  totalUsers: number;
  totalDatasets: number;
  totalDataRows: number;
  totalPredictionsGenerated: number;
  systemHealth: 'healthy' | 'degraded';
  storageUsedMb: number;
  activeSessions: number;
}

export type ThemePalette = 'indigo' | 'emerald' | 'sunset' | 'azure' | 'luxe';
