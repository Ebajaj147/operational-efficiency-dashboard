export type TabId = 'overview' | 'staff' | 'locations' | 'vendors' | 'reports';

export type DateRangePreset = '7d' | '30d' | '90d';

export type PerformanceCategory = 'Exceptional' | 'Above Average' | 'Average' | 'Below Average' | 'Needs Attention';

export type InsightSeverity = 'critical' | 'warning' | 'opportunity';

export type InsightType = 'staff_performance' | 'location_performance' | 'vendor_issue' | 'training_opportunity' | 'best_practice';

export interface Location {
  id: string;
  name: string;
  region: string;
  timezone: string;
  isActive: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  locationId: string;
  isActive: boolean;
}

export interface Vendor {
  id: string;
  name: string;
  isActive: boolean;
}

export interface FilterState {
  selectedLocations: string[];
  dateRange: DateRangePreset;
}

export interface OverviewMetrics {
  totalInvoices: number;
  totalInvoicesTrend: number;
  avgProcessingDays: number;
  avgProcessingDaysTrend: number;
  editRate: number;  // Renamed from exceptionRate - % of invoices requiring manual edits
  editRateTrend: number;
  touchlessRate: number;
  touchlessRateTrend: number;
  manualMinutesPerInvoice: number;  // Renamed from costPerInvoice - avg manual time per invoice
  manualMinutesTrend: number;
  totalManualHours: number;  // Total manual hours spent (replaces totalAPCost)
  totalManualHoursTrend: number;
  fteSaved: number;  // FTE equivalent saved by automation
  potentialFTESavings: number;  // Additional FTE that could be saved
}

export interface UserMetrics {
  id: string;
  name: string;
  locationId: string;
  locationName: string;
  invoiceCount: number;
  dailyAverage: number;
  avgProcessingHours: number;
  editRate: number;  // % of invoices that required manual edits (Ottimate gaps, not user fault)
  editCount: number;  // Number of invoices requiring edits
  vsTeamAverage: number;
  performanceCategory: PerformanceCategory;
  manualMinutesPerInvoice: number;  // Avg manual time per invoice
  trend: number;
}

export interface LocationMetrics {
  id: string;
  name: string;
  region: string;
  invoiceCount: number;
  touchlessRate: number;
  editRate: number;  // % of invoices requiring edits
  avgProcessingHours: number;
  manualMinutesPerInvoice: number;  // Avg manual time per invoice
  weeklyManualHours: number;  // Total manual hours per week
  score: number;
  staffCount: number;
  trend: number;
}

export interface VendorMetrics {
  id: string;
  name: string;
  invoiceCount: number;
  totalSpend: number;
  poMatchRate: number;
  glMappingRate: number;
  errorRate: number;
  avgProcessingDays: number;
  score: number;
  trend: number;
}

export interface Insight {
  id: string;
  type: InsightType;
  severity: InsightSeverity;
  title: string;
  description: string;
  timeImpactMinutes: number;  // Time impact in minutes (replaces costImpact)
  recommendation: string;
  actions: string[];
  entities: {
    userId?: string;
    locationId?: string;
    vendorId?: string;
  };
  generatedAt: string;
}

export interface TrendDataPoint {
  date: string;
  value: number;
  label: string;
}

// ROI Summary Types
export interface TimeCategory {
  id: string;
  name: string;
  hours_weekly: number;
  percentage: number;
  invoice_count: number;
  color: string;
  drilldown_filter: string;
}

export interface TimeBreakdown {
  total_hours_weekly: number;
  total_invoices: number;
  vs_previous_period: number;
  fte_equivalent: number;
  categories: TimeCategory[];
}

export type OpportunityType =
  | 'vendor_portal_gap'
  | 'location_edit_spike'
  | 'gl_rule_gap'
  | 'vendor_quality'
  | 'training_opportunity';

export interface OpportunityAction {
  label: string;
  description: string;
  action_type: string;
  action_params: Record<string, string>;
}

export interface Opportunity {
  rank: number;
  id: string;
  entity_type: 'vendor' | 'location' | 'category';
  entity_name: string;
  entity_id: string;
  issue_summary: string;
  issue_metric: number;
  issue_metric_label: string;
  hours_weekly: number;
  invoices_affected: number;
  root_cause: string;
  root_cause_type: OpportunityType;
  action: OpportunityAction;
}

export interface ROISummary {
  addressable_hours_weekly: number;
  addressable_fte: number;
  current_edit_rate: number;
  projected_edit_rate: number;
}

export interface ROISummaryResponse {
  time_breakdown: TimeBreakdown;
  opportunities: Opportunity[];
  summary: ROISummary;
}
