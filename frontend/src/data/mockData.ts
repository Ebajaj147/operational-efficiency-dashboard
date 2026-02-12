import type {
  Location, User, Vendor, UserMetrics, LocationMetrics,
  VendorMetrics, OverviewMetrics, Insight, PerformanceCategory, DateRangePreset, TrendDataPoint,
  TimeBreakdown, Opportunity, ROISummaryResponse,
} from '../types';

let seed = 42;
function seededRandom(): number {
  seed = (seed * 16807 + 0) % 2147483647;
  return (seed - 1) / 2147483646;
}

function gaussRandom(mean: number, std: number): number {
  const u1 = seededRandom();
  const u2 = seededRandom();
  return mean + std * Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

export const locations: Location[] = [
  { id: 'loc_austin', name: 'Austin', region: 'South', timezone: 'America/Chicago', isActive: true },
  { id: 'loc_chicago', name: 'Chicago', region: 'Midwest', timezone: 'America/Chicago', isActive: true },
  { id: 'loc_nyc', name: 'NYC', region: 'Northeast', timezone: 'America/New_York', isActive: true },
  { id: 'loc_la', name: 'LA', region: 'West', timezone: 'America/Los_Angeles', isActive: true },
  { id: 'loc_seattle', name: 'Seattle', region: 'West', timezone: 'America/Los_Angeles', isActive: true },
  { id: 'loc_denver', name: 'Denver', region: 'Mountain', timezone: 'America/Denver', isActive: true },
];

export const users: User[] = [
  { id: 'user_001', name: 'Lara Patel', email: 'lara.patel@company.com', role: 'AP Processor', locationId: 'loc_austin', isActive: true },
  { id: 'user_002', name: 'Marcus Johnson', email: 'marcus.johnson@company.com', role: 'AP Processor', locationId: 'loc_austin', isActive: true },
  { id: 'user_003', name: 'Sarah Wilson', email: 'sarah.wilson@company.com', role: 'AP Processor', locationId: 'loc_chicago', isActive: true },
  { id: 'user_004', name: 'Ana Martinez', email: 'ana.martinez@company.com', role: 'AP Processor', locationId: 'loc_chicago', isActive: true },
  { id: 'user_005', name: 'Joseph Kim', email: 'joseph.kim@company.com', role: 'AP Processor', locationId: 'loc_nyc', isActive: true },
  { id: 'user_006', name: 'Diana Chen', email: 'diana.chen@company.com', role: 'AP Processor', locationId: 'loc_nyc', isActive: true },
  { id: 'user_007', name: 'Mike Davis', email: 'mike.davis@company.com', role: 'AP Processor', locationId: 'loc_la', isActive: true },
  { id: 'user_008', name: 'John Miller', email: 'john.miller@company.com', role: 'AP Processor', locationId: 'loc_la', isActive: true },
  { id: 'user_009', name: 'Emily Garcia', email: 'emily.garcia@company.com', role: 'AP Processor', locationId: 'loc_seattle', isActive: true },
  { id: 'user_010', name: 'David Rodriguez', email: 'david.rodriguez@company.com', role: 'AP Processor', locationId: 'loc_seattle', isActive: true },
  { id: 'user_011', name: 'Lisa Lee', email: 'lisa.lee@company.com', role: 'AP Processor', locationId: 'loc_denver', isActive: true },
  { id: 'user_012', name: 'Robert Thompson', email: 'robert.thompson@company.com', role: 'AP Processor', locationId: 'loc_denver', isActive: true },
];

export const vendors: Vendor[] = [
  { id: 'vendor_001', name: 'Sysco', isActive: true },
  { id: 'vendor_002', name: 'US Foods', isActive: true },
  { id: 'vendor_003', name: 'Worldwide Produce', isActive: true },
  { id: 'vendor_004', name: 'Sunrise Produce', isActive: true },
  { id: 'vendor_005', name: 'Imperial Dade', isActive: true },
  { id: 'vendor_006', name: 'Ecolab', isActive: true },
  { id: 'vendor_007', name: 'Cintas', isActive: true },
  { id: 'vendor_008', name: 'PFG', isActive: true },
  { id: 'vendor_009', name: 'Gordon Food Service', isActive: true },
  { id: 'vendor_010', name: 'McLane Company', isActive: true },
];

// Time estimates per action (from CHANGELOG):
// - Invoice edit: 2-4 minutes (avg 3 min)
// - GL code mapping: 3-5 minutes (avg 4 min)
// - Approval: 1-2 minutes (avg 1.5 min)
// FTE baseline: 2,080 hours/year = 40 hrs/week

const locationProfiles: Record<string, { baseScore: number; editRate: number; processingHours: number; manualMinutesPerInvoice: number }> = {
  loc_austin: { baseScore: 93, editRate: 8.2, processingHours: 48, manualMinutesPerInvoice: 2.4 },
  loc_chicago: { baseScore: 90, editRate: 10.1, processingHours: 62, manualMinutesPerInvoice: 3.0 },
  loc_denver: { baseScore: 89, editRate: 10.5, processingHours: 65, manualMinutesPerInvoice: 3.2 },
  loc_seattle: { baseScore: 87, editRate: 11.8, processingHours: 72, manualMinutesPerInvoice: 3.6 },
  loc_nyc: { baseScore: 84, editRate: 13.2, processingHours: 84, manualMinutesPerInvoice: 4.2 },
  loc_la: { baseScore: 80, editRate: 16.1, processingHours: 96, manualMinutesPerInvoice: 4.8 },
};

// Note: editMult represents vendor mix complexity, NOT user performance
// Higher values = more complex vendor mix requiring more manual work
const userFactors: Record<string, { volumeFactor: number; editMult: number }> = {
  user_001: { volumeFactor: 1.40, editMult: 0.50 },
  user_002: { volumeFactor: 1.10, editMult: 0.85 },
  user_003: { volumeFactor: 1.15, editMult: 0.80 },
  user_004: { volumeFactor: 1.00, editMult: 1.00 },
  user_005: { volumeFactor: 0.95, editMult: 1.10 },
  user_006: { volumeFactor: 1.05, editMult: 0.90 },
  user_007: { volumeFactor: 0.85, editMult: 1.25 },
  user_008: { volumeFactor: 0.65, editMult: 1.80 },
  user_009: { volumeFactor: 1.00, editMult: 1.00 },
  user_010: { volumeFactor: 0.90, editMult: 1.15 },
  user_011: { volumeFactor: 1.20, editMult: 0.70 },
  user_012: { volumeFactor: 0.95, editMult: 1.05 },
};

const vendorProfiles: Record<string, { poMatchRate: number; glMappingRate: number; errorRate: number; avgProcessingDays: number; invoiceCount: number; totalSpend: number }> = {
  vendor_001: { poMatchRate: 97, glMappingRate: 96, errorRate: 3.2, avgProcessingDays: 1.8, invoiceCount: 892, totalSpend: 2450000 },
  vendor_002: { poMatchRate: 93, glMappingRate: 94, errorRate: 5.1, avgProcessingDays: 2.1, invoiceCount: 764, totalSpend: 1890000 },
  vendor_003: { poMatchRate: 42, glMappingRate: 61, errorRate: 28.4, avgProcessingDays: 8.7, invoiceCount: 234, totalSpend: 456000 },
  vendor_004: { poMatchRate: 58, glMappingRate: 72, errorRate: 19.2, avgProcessingDays: 6.2, invoiceCount: 187, totalSpend: 234000 },
  vendor_005: { poMatchRate: 96, glMappingRate: 98, errorRate: 2.1, avgProcessingDays: 1.4, invoiceCount: 145, totalSpend: 678000 },
  vendor_006: { poMatchRate: 91, glMappingRate: 93, errorRate: 6.8, avgProcessingDays: 2.5, invoiceCount: 198, totalSpend: 345000 },
  vendor_007: { poMatchRate: 89, glMappingRate: 88, errorRate: 8.2, avgProcessingDays: 3.1, invoiceCount: 156, totalSpend: 289000 },
  vendor_008: { poMatchRate: 94, glMappingRate: 95, errorRate: 4.5, avgProcessingDays: 1.9, invoiceCount: 543, totalSpend: 1230000 },
  vendor_009: { poMatchRate: 92, glMappingRate: 91, errorRate: 5.9, avgProcessingDays: 2.3, invoiceCount: 432, totalSpend: 987000 },
  vendor_010: { poMatchRate: 88, glMappingRate: 85, errorRate: 9.1, avgProcessingDays: 3.4, invoiceCount: 321, totalSpend: 567000 },
};

function getPerformanceCategory(vsAvg: number): PerformanceCategory {
  if (vsAvg > 20) return 'Exceptional';
  if (vsAvg > 5) return 'Above Average';
  if (vsAvg >= -5) return 'Average';
  if (vsAvg >= -20) return 'Below Average';
  return 'Needs Attention';
}

function getDaysMultiplier(range: DateRangePreset): number {
  switch (range) {
    case '7d': return 7;
    case '30d': return 30;
    case '90d': return 90;
  }
}

export function getOverviewMetrics(_selectedLocations: string[], dateRange: DateRangePreset): OverviewMetrics {
  seed = 42;
  const days = getDaysMultiplier(dateRange);
  const dailyBase = 55;
  const totalInvoices = Math.round(dailyBase * days * (0.9 + seededRandom() * 0.2));
  const avgProcessingDays = 3.2 + seededRandom() * 1.5;
  const editRate = 11.4 + seededRandom() * 2;  // % invoices requiring manual edits
  const touchlessRate = 100 - editRate - seededRandom() * 3;

  // Time-based metrics (avg 3 min per edit action)
  const manualMinutesPerInvoice = 3.2 + seededRandom() * 0.8;  // avg manual minutes per invoice
  const totalManualMinutes = totalInvoices * manualMinutesPerInvoice * (editRate / 100);
  const totalManualHours = totalManualMinutes / 60;

  // FTE calculations (2,080 hrs/year = 40 hrs/week)
  const weeksInRange = days / 7;
  const weeklyManualHours = totalManualHours / weeksInRange;

  // If touchless rate were 100%, we'd save all manual hours
  const potentialWeeklyHours = (totalInvoices / weeksInRange) * manualMinutesPerInvoice / 60;
  const fteSaved = (potentialWeeklyHours - weeklyManualHours) / 40;  // Already saved via automation
  const potentialFTESavings = weeklyManualHours / 40;  // Could save if 100% touchless

  return {
    totalInvoices,
    totalInvoicesTrend: 5.2 + gaussRandom(0, 3),
    avgProcessingDays,
    avgProcessingDaysTrend: -8.1 + gaussRandom(0, 4),
    editRate,
    editRateTrend: -3.2 + gaussRandom(0, 2),
    touchlessRate,
    touchlessRateTrend: 2.1 + gaussRandom(0, 2),
    manualMinutesPerInvoice,
    manualMinutesTrend: -4.5 + gaussRandom(0, 3),
    totalManualHours,
    totalManualHoursTrend: 1.2 + gaussRandom(0, 3),
    fteSaved: Math.max(0, fteSaved),
    potentialFTESavings: Math.max(0, potentialFTESavings),
  };
}

export function getUserMetrics(selectedLocations: string[], dateRange: DateRangePreset): UserMetrics[] {
  seed = 100;
  const days = getDaysMultiplier(dateRange);
  const baseDaily = 14;
  const filteredUsers = selectedLocations.length > 0 ? users.filter(u => selectedLocations.includes(u.locationId)) : users;
  const teamAvg = baseDaily;

  return filteredUsers.map(user => {
    const factor = userFactors[user.id];
    const locProfile = locationProfiles[user.locationId];
    const dailyAvg = baseDaily * factor.volumeFactor + gaussRandom(0, 1);
    const invoiceCount = Math.round(dailyAvg * days);
    const vsTeamAverage = ((dailyAvg - teamAvg) / teamAvg) * 100;
    // Edit rate reflects Ottimate gaps for this user's vendor mix, NOT user performance
    const editRate = locProfile.editRate * factor.editMult + gaussRandom(0, 1.5);
    const clampedEditRate = Math.max(1, Math.min(40, editRate));
    const editCount = Math.round(invoiceCount * clampedEditRate / 100);
    const avgProcessingHours = locProfile.processingHours / factor.volumeFactor + gaussRandom(0, 8);
    const loc = locations.find(l => l.id === user.locationId)!;

    // Time-based: manual minutes per invoice
    const manualMinutesPerInvoice = locProfile.manualMinutesPerInvoice / factor.volumeFactor + gaussRandom(0, 0.3);

    return {
      id: user.id,
      name: user.name,
      locationId: user.locationId,
      locationName: loc.name,
      invoiceCount,
      dailyAverage: Math.round(dailyAvg * 10) / 10,
      avgProcessingHours: Math.max(12, avgProcessingHours),
      editRate: Math.round(clampedEditRate * 10) / 10,
      editCount,
      vsTeamAverage: Math.round(vsTeamAverage * 10) / 10,
      performanceCategory: getPerformanceCategory(vsTeamAverage),
      manualMinutesPerInvoice: Math.round(manualMinutesPerInvoice * 10) / 10,
      trend: gaussRandom(0, 5),
    };
  });
}

export function getLocationMetrics(selectedLocations: string[], dateRange: DateRangePreset): LocationMetrics[] {
  seed = 200;
  const days = getDaysMultiplier(dateRange);
  const filteredLocs = selectedLocations.length > 0 ? locations.filter(l => selectedLocations.includes(l.id)) : locations;

  return filteredLocs.map(loc => {
    const profile = locationProfiles[loc.id];
    const staffCount = users.filter(u => u.locationId === loc.id).length;
    const dailyPerStaff = 14 + gaussRandom(0, 2);
    const invoiceCount = Math.round(dailyPerStaff * staffCount * days);
    const editRate = profile.editRate + gaussRandom(0, 1);
    const touchlessRate = 100 - editRate - gaussRandom(1, 1);

    // Time-based metrics
    const manualMinutesPerInvoice = profile.manualMinutesPerInvoice + gaussRandom(0, 0.3);
    const weeksInRange = days / 7;
    const editedInvoices = invoiceCount * (editRate / 100);
    const weeklyManualHours = (editedInvoices * manualMinutesPerInvoice) / 60 / weeksInRange;

    return {
      id: loc.id,
      name: loc.name,
      region: loc.region,
      invoiceCount,
      touchlessRate: Math.round(touchlessRate * 10) / 10,
      editRate: Math.round(Math.max(1, editRate) * 10) / 10,
      avgProcessingHours: profile.processingHours + gaussRandom(0, 6),
      manualMinutesPerInvoice: Math.round(manualMinutesPerInvoice * 10) / 10,
      weeklyManualHours: Math.round(weeklyManualHours * 10) / 10,
      score: Math.round((profile.baseScore + gaussRandom(0, 1.5)) * 10) / 10,
      staffCount,
      trend: gaussRandom(0, 4),
    };
  });
}

export function getVendorMetrics(_selectedLocations: string[], dateRange: DateRangePreset): VendorMetrics[] {
  seed = 300;
  const daysMult = getDaysMultiplier(dateRange) / 30;

  return vendors.map(vendor => {
    const profile = vendorProfiles[vendor.id];
    const invoiceCount = Math.round(profile.invoiceCount * daysMult + gaussRandom(0, 10));
    const poMatchRate = profile.poMatchRate + gaussRandom(0, 1);
    const glMappingRate = profile.glMappingRate + gaussRandom(0, 1);
    const errorRate = profile.errorRate + gaussRandom(0, 1);
    const score = Math.round(poMatchRate * 0.4 + glMappingRate * 0.3 + (100 - errorRate) * 0.3);

    return {
      id: vendor.id,
      name: vendor.name,
      invoiceCount: Math.max(1, invoiceCount),
      totalSpend: Math.round(profile.totalSpend * daysMult),
      poMatchRate: Math.round(Math.min(100, Math.max(0, poMatchRate)) * 10) / 10,
      glMappingRate: Math.round(Math.min(100, Math.max(0, glMappingRate)) * 10) / 10,
      errorRate: Math.round(Math.max(0, errorRate) * 10) / 10,
      avgProcessingDays: Math.round(profile.avgProcessingDays * 10) / 10,
      score: Math.min(100, Math.max(0, score)),
      trend: gaussRandom(0, 4),
    };
  });
}

export function getInsights(): Insight[] {
  return [
    {
      id: 'ins_001',
      type: 'vendor_issue',
      severity: 'critical',
      title: 'Worldwide Produce causing ~4.2 hrs/week of manual work',
      description: 'Worldwide Produce has a vendor score of 52. 58% of invoices are missing POs and GL mapping rate is only 61%. This vendor is forcing ~4.2 hours of manual edits per week.',
      timeImpactMinutes: 252,  // ~4.2 hours
      recommendation: 'Start a vendor improvement workflow to address PO compliance and invoice formatting.',
      actions: ['start_vendor_workflow'],
      entities: { vendorId: 'vendor_003' },
      generatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'ins_002',
      type: 'location_performance',
      severity: 'critical',
      title: 'LA spending ~6.5 hrs/week more than Austin on manual edits',
      description: 'LA has a score of 80, which is 14% below Austin (93). Key gaps: edit rate (16.1% vs 8.2%), processing time (4.0 days vs 2.0 days). This represents ~6.5 extra hours of manual work weekly.',
      timeImpactMinutes: 390,  // ~6.5 hours
      recommendation: 'Generate a location comparison report and set benchmark targets based on Austin\'s performance.',
      actions: ['generate_location_comparison', 'set_benchmark_target'],
      entities: { locationId: 'loc_la' },
      generatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'ins_003',
      type: 'vendor_issue',
      severity: 'warning',
      title: 'Sunrise Produce missing PO on 42% of invoices',
      description: '42% of invoices from Sunrise Produce are missing purchase orders. This creates ~1.8 hours of manual work per week and delays processing by an average of 6.2 days.',
      timeImpactMinutes: 108,  // ~1.8 hours
      recommendation: 'Contact Sunrise Produce to discuss PO compliance requirements.',
      actions: ['start_vendor_workflow'],
      entities: { vendorId: 'vendor_004' },
      generatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'ins_004',
      type: 'staff_performance',
      severity: 'warning',
      title: 'Complex vendor mix increasing manual work for LA team',
      description: 'The LA location handles vendors with higher edit rates (avg 16.1% vs company 11.4%). This is an Ottimate configuration gap, not a staff performance issue. Improving vendor integrations could save ~3.2 hrs/week.',
      timeImpactMinutes: 192,  // ~3.2 hours
      recommendation: 'Review vendor configurations for LA-specific vendors and prioritize integration improvements.',
      actions: ['generate_location_comparison'],
      entities: { locationId: 'loc_la' },
      generatedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'ins_005',
      type: 'best_practice',
      severity: 'opportunity',
      title: 'Austin best practices could save ~8.5 hrs/week company-wide',
      description: 'Austin is your top performer with a score of 93. Key strengths: 91.8% touchless rate, 8.2% edit rate, ~2.4 min manual time per invoice. Replicating these practices could save ~8.5 hours weekly.',
      timeImpactMinutes: 510,  // ~8.5 hours
      recommendation: 'Document Austin\'s processes and create a playbook for other locations.',
      actions: ['generate_location_comparison', 'request_sop_upload'],
      entities: { locationId: 'loc_austin' },
      generatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'ins_006',
      type: 'training_opportunity',
      severity: 'opportunity',
      title: 'GL code auto-mapping could save ~2.1 hrs/week',
      description: 'Currently 29% of invoices require manual GL code mapping (~3-5 min each). Improving GL mapping rules for top 5 vendors could reduce this to 15% and save ~2.1 hours weekly.',
      timeImpactMinutes: 126,  // ~2.1 hours
      recommendation: 'Review GL mapping rules for frequently-edited vendors and update configurations.',
      actions: ['start_vendor_workflow'],
      entities: {},
      generatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    },
  ];
}

export function getProcessingVolumeTrend(dateRange: DateRangePreset): TrendDataPoint[] {
  seed = 400;
  const days = getDaysMultiplier(dateRange);
  const points: TrendDataPoint[] = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const base = isWeekend ? 12 : 55;
    const value = Math.round(base + gaussRandom(0, 8));

    points.push({
      date: date.toISOString().split('T')[0],
      value: Math.max(0, value),
      label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    });
  }

  return points;
}

export function getEditRateTrend(dateRange: DateRangePreset): TrendDataPoint[] {
  seed = 500;
  const days = getDaysMultiplier(dateRange);
  const points: TrendDataPoint[] = [];
  const now = new Date();
  let trend = 13.5;

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    trend += gaussRandom(-0.05, 0.3);
    trend = Math.max(5, Math.min(25, trend));

    points.push({
      date: date.toISOString().split('T')[0],
      value: Math.round(trend * 10) / 10,
      label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    });
  }

  return points;
}

export function getEditBreakdown(): { type: string; count: number; percentage: number; avgMinutes: number }[] {
  return [
    { type: 'Missing PO', count: 412, percentage: 34, avgMinutes: 4 },
    { type: 'GL Code Mapping', count: 348, percentage: 29, avgMinutes: 4 },
    { type: 'Vendor Mapping', count: 181, percentage: 15, avgMinutes: 3 },
    { type: 'Amount Mismatch', count: 169, percentage: 14, avgMinutes: 3 },
    { type: 'Duplicate Check', count: 96, percentage: 8, avgMinutes: 2 },
  ];
}

// Week-on-week comparison data for staff performance
export interface WeeklyTeamMetrics {
  week: string;
  weekLabel: string;
  totalInvoices: number;
  avgDailyPerPerson: number;
  avgEditRate: number;  // Renamed from avgExceptionRate
  avgProcessingHours: number;
  avgManualMinutes: number;  // Renamed from avgCostPerInvoice
}

export interface WeeklyUserMetrics {
  userId: string;
  userName: string;
  weekData: {
    week: string;
    weekLabel: string;
    invoiceCount: number;
    dailyAverage: number;
    editRate: number;  // Renamed from exceptionRate
    avgProcessingHours: number;
    manualMinutes: number;  // Renamed from costPerInvoice
  }[];
}

export function getWeeklyTeamMetrics(selectedLocations: string[], dateRange: DateRangePreset): WeeklyTeamMetrics[] {
  seed = 600;
  const weeks = dateRange === '7d' ? 2 : dateRange === '30d' ? 5 : 13;
  const metrics: WeeklyTeamMetrics[] = [];
  const now = new Date();

  // Base metrics that improve over time
  let baseDaily = 12.5;
  let baseEditRate = 14.5;
  let baseProcessingHours = 72;
  let baseManualMinutes = 3.8;  // avg manual minutes per invoice

  for (let w = weeks - 1; w >= 0; w--) {
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - (w * 7) - 6);
    const weekEnd = new Date(now);
    weekEnd.setDate(weekEnd.getDate() - (w * 7));

    const weekLabel = `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    const weekId = weekStart.toISOString().split('T')[0];

    // Simulate gradual improvement
    const improvement = (weeks - w) * 0.08;
    const dailyAvg = baseDaily + improvement + gaussRandom(0, 0.5);
    const editRate = Math.max(5, baseEditRate - improvement * 2 + gaussRandom(0, 1));
    const processingHours = Math.max(36, baseProcessingHours - improvement * 3 + gaussRandom(0, 4));
    const manualMinutes = Math.max(2.0, baseManualMinutes - improvement * 0.1 + gaussRandom(0, 0.2));

    const filteredUsers = selectedLocations.length > 0 ? users.filter(u => selectedLocations.includes(u.locationId)) : users;
    const teamSize = filteredUsers.length;

    metrics.push({
      week: weekId,
      weekLabel,
      totalInvoices: Math.round(dailyAvg * 7 * teamSize),
      avgDailyPerPerson: Math.round(dailyAvg * 10) / 10,
      avgEditRate: Math.round(editRate * 10) / 10,
      avgProcessingHours: Math.round(processingHours),
      avgManualMinutes: Math.round(manualMinutes * 10) / 10,
    });
  }

  return metrics;
}

export function getWeeklyUserMetrics(selectedLocations: string[], dateRange: DateRangePreset): WeeklyUserMetrics[] {
  seed = 700;
  const weeks = dateRange === '7d' ? 2 : dateRange === '30d' ? 5 : 13;
  const filteredUsers = selectedLocations.length > 0 ? users.filter(u => selectedLocations.includes(u.locationId)) : users;
  const now = new Date();

  return filteredUsers.map(user => {
    const factor = userFactors[user.id];
    const locProfile = locationProfiles[user.locationId];
    const weekData: WeeklyUserMetrics['weekData'] = [];

    for (let w = weeks - 1; w >= 0; w--) {
      const weekStart = new Date(now);
      weekStart.setDate(weekStart.getDate() - (w * 7) - 6);
      const weekEnd = new Date(now);
      weekEnd.setDate(weekEnd.getDate() - (w * 7));

      const weekLabel = `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
      const weekId = weekStart.toISOString().split('T')[0];

      // User-specific variation over weeks
      const baseDaily = 14 * factor.volumeFactor;
      const weekVariation = gaussRandom(0, 1.2);
      const improvementFactor = (weeks - w) * 0.03;

      const dailyAvg = baseDaily + weekVariation + improvementFactor;
      const invoiceCount = Math.round(dailyAvg * 7);
      const editRate = Math.max(2, locProfile.editRate * factor.editMult - improvementFactor * 0.5 + gaussRandom(0, 1.5));
      const avgProcessingHours = Math.max(12, locProfile.processingHours / factor.volumeFactor - improvementFactor * 2 + gaussRandom(0, 6));
      const manualMinutes = Math.max(1.5, locProfile.manualMinutesPerInvoice / factor.volumeFactor - improvementFactor * 0.05 + gaussRandom(0, 0.3));

      weekData.push({
        week: weekId,
        weekLabel,
        invoiceCount,
        dailyAverage: Math.round(dailyAvg * 10) / 10,
        editRate: Math.round(editRate * 10) / 10,
        avgProcessingHours: Math.round(avgProcessingHours),
        manualMinutes: Math.round(manualMinutes * 10) / 10,
      });
    }

    return {
      userId: user.id,
      userName: user.name,
      weekData,
    };
  });
}

// Staff invoice history for drill-down
export interface StaffInvoice {
  id: string;
  invoiceNumber: string;
  vendorName: string;
  amount: number;
  status: 'processed' | 'edited' | 'pending';  // 'edited' replaces 'exception'
  editType?: string;  // Renamed from exceptionType - the type of manual edit required
  manualMinutes: number;  // Time spent on manual edits
  processedDate: string;
  touchless: boolean;
}

export function getStaffInvoices(userId: string, dateRange: DateRangePreset): StaffInvoice[] {
  seed = 800 + parseInt(userId.replace('user_', '')) * 100;
  const days = getDaysMultiplier(dateRange);
  const factor = userFactors[userId] || { volumeFactor: 1, editMult: 1 };
  const user = users.find(u => u.id === userId);
  const locProfile = user ? locationProfiles[user.locationId] : locationProfiles.loc_austin;

  const baseDaily = 14 * factor.volumeFactor;
  const invoiceCount = Math.round(baseDaily * days);
  const invoices: StaffInvoice[] = [];
  const now = new Date();

  // Edit types with their typical time requirements
  const editTypes = [
    { type: 'Missing PO', avgMinutes: 4 },
    { type: 'GL Code Mapping', avgMinutes: 4 },
    { type: 'Vendor Mapping', avgMinutes: 3 },
    { type: 'Amount Mismatch', avgMinutes: 3 },
    { type: 'Duplicate Check', avgMinutes: 2 },
  ];
  const vendorNames = vendors.map(v => v.name);

  for (let i = 0; i < invoiceCount; i++) {
    const daysAgo = Math.floor(seededRandom() * days);
    const processedDate = new Date(now);
    processedDate.setDate(processedDate.getDate() - daysAgo);

    const requiresEdit = seededRandom() < (locProfile.editRate * factor.editMult / 100);
    const isTouchless = !requiresEdit && seededRandom() > 0.15;
    const editInfo = editTypes[Math.floor(seededRandom() * editTypes.length)];

    invoices.push({
      id: `inv_${userId}_${i.toString().padStart(4, '0')}`,
      invoiceNumber: `INV-${(20240000 + Math.floor(seededRandom() * 99999)).toString()}`,
      vendorName: vendorNames[Math.floor(seededRandom() * vendorNames.length)],
      amount: Math.round((100 + seededRandom() * 9900) * 100) / 100,
      status: requiresEdit ? 'edited' : 'processed',
      editType: requiresEdit ? editInfo.type : undefined,
      manualMinutes: requiresEdit ? Math.round((editInfo.avgMinutes + gaussRandom(0, 1)) * 10) / 10 : 0,
      processedDate: processedDate.toISOString().split('T')[0],
      touchless: isTouchless,
    });
  }

  // Sort by date descending
  return invoices.sort((a, b) => b.processedDate.localeCompare(a.processedDate));
}

// Vendor edit time impact (time-based)
export interface VendorEditTime {
  vendorId: string;
  vendorName: string;
  editCount: number;
  avgMinutesPerEdit: number;
  totalManualMinutes: number;
  weeklyManualHours: number;  // Normalized to weekly hours
  potentialTimeSavingsMinutes: number;
}

export function getVendorEditTimes(dateRange: DateRangePreset): VendorEditTime[] {
  seed = 900;
  const daysMult = getDaysMultiplier(dateRange) / 30;
  const weeksInRange = getDaysMultiplier(dateRange) / 7;
  const avgMinutesPerEdit = 3.5; // Base time to resolve an edit (3-4 min avg)

  return vendors.map(vendor => {
    const profile = vendorProfiles[vendor.id];
    const invoiceCount = Math.round(profile.invoiceCount * daysMult);
    const editCount = Math.round(invoiceCount * (profile.errorRate / 100));
    const timeVariation = 1 + gaussRandom(0, 0.15);
    const vendorEditMinutes = avgMinutesPerEdit * timeVariation;
    const totalMinutes = editCount * vendorEditMinutes;
    const weeklyHours = (totalMinutes / 60) / weeksInRange;

    // Potential savings if they achieved best performer level (2.1% error rate)
    const bestErrorRate = 2.1;
    const potentialEdits = Math.round(invoiceCount * (bestErrorRate / 100));
    const potentialSavings = (editCount - potentialEdits) * vendorEditMinutes;

    return {
      vendorId: vendor.id,
      vendorName: vendor.name,
      editCount,
      avgMinutesPerEdit: Math.round(vendorEditMinutes * 10) / 10,
      totalManualMinutes: Math.round(totalMinutes),
      weeklyManualHours: Math.round(weeklyHours * 10) / 10,
      potentialTimeSavingsMinutes: Math.max(0, Math.round(potentialSavings)),
    };
  });
}

// ROI Summary Data Functions
const CATEGORY_COLORS: Record<string, string> = {
  field_correction: '#ef4444',  // red
  gl_mapping: '#f59e0b',        // amber
  po_resolution: '#3b82f6',     // blue
  vendor_error: '#8b5cf6',      // violet
  other: '#64748b',             // slate
};

const CATEGORY_NAMES: Record<string, string> = {
  field_correction: 'Invoice Edits',
  gl_mapping: 'GL Code Mapping',
  po_resolution: 'PO Resolution',
  vendor_error: 'Vendor Errors',
  other: 'Other',
};

export function getTimeBreakdown(selectedLocations: string[], dateRange: DateRangePreset): TimeBreakdown {
  seed = 1000;
  const days = getDaysMultiplier(dateRange);
  const weeksInRange = days / 7;

  // Base values that scale with date range
  const baseInvoices = Math.round(346 * (days / 30));
  const locationMult = selectedLocations.length > 0 ? selectedLocations.length / locations.length : 1;
  const totalInvoices = Math.round(baseInvoices * locationMult);

  // Category distribution (based on edit types)
  const categoryData = [
    { id: 'field_correction', basePercent: 40, baseMinutes: 3 },
    { id: 'gl_mapping', basePercent: 30, baseMinutes: 4 },
    { id: 'po_resolution', basePercent: 20, baseMinutes: 3 },
    { id: 'other', basePercent: 10, baseMinutes: 2.5 },
  ];

  let totalHoursWeekly = 0;
  const categories = categoryData.map(cat => {
    const invoiceCount = Math.round(totalInvoices * (cat.basePercent / 100) + gaussRandom(0, 5));
    const totalMinutes = invoiceCount * (cat.baseMinutes + gaussRandom(0, 0.3));
    const hoursWeekly = Math.round((totalMinutes / 60 / weeksInRange) * 10) / 10;
    totalHoursWeekly += hoursWeekly;

    return {
      id: cat.id,
      name: CATEGORY_NAMES[cat.id],
      hours_weekly: hoursWeekly,
      percentage: 0, // Will calculate after totals
      invoice_count: invoiceCount,
      color: CATEGORY_COLORS[cat.id],
      drilldown_filter: `edit_category=${cat.id}`,
    };
  });

  // Calculate percentages
  categories.forEach(cat => {
    cat.percentage = Math.round((cat.hours_weekly / totalHoursWeekly) * 100);
  });

  // Ensure percentages sum to 100
  const percentSum = categories.reduce((sum, c) => sum + c.percentage, 0);
  if (percentSum !== 100 && categories.length > 0) {
    categories[0].percentage += (100 - percentSum);
  }

  // Sort by hours descending
  categories.sort((a, b) => b.hours_weekly - a.hours_weekly);

  // Calculate vs previous period
  const vsPrevious = -2.8 + gaussRandom(0, 1.5);

  return {
    total_hours_weekly: Math.round(totalHoursWeekly * 10) / 10,
    total_invoices: categories.reduce((sum, c) => sum + c.invoice_count, 0),
    vs_previous_period: Math.round(vsPrevious * 10) / 10,
    fte_equivalent: Math.round((totalHoursWeekly / 40) * 100) / 100,
    categories,
  };
}

export function getOpportunities(selectedLocations: string[], dateRange: DateRangePreset): Opportunity[] {
  seed = 1100;
  const days = getDaysMultiplier(dateRange);
  const daysMult = days / 30;

  const opportunities: Opportunity[] = [
    {
      rank: 1,
      id: 'opp-001',
      entity_type: 'vendor',
      entity_name: 'Worldwide Produce',
      entity_id: 'vendor_003',
      issue_summary: 'Missing PO (68% of invoices)',
      issue_metric: 68,
      issue_metric_label: 'missing PO rate',
      hours_weekly: Math.round((1.8 * daysMult + gaussRandom(0, 0.2)) * 10) / 10,
      invoices_affected: Math.round(312 * daysMult),
      root_cause: 'Not on vendor portal',
      root_cause_type: 'vendor_portal_gap',
      action: {
        label: 'Add to Portal',
        description: 'Solves missing PO at source',
        action_type: 'vendor_portal_workflow',
        action_params: { vendor_id: 'vendor_003' },
      },
    },
    {
      rank: 2,
      id: 'opp-002',
      entity_type: 'location',
      entity_name: 'LA',
      entity_id: 'loc_la',
      issue_summary: 'High Edit Rate (42% vs 18% avg)',
      issue_metric: 42,
      issue_metric_label: 'edit rate',
      hours_weekly: Math.round((1.5 * daysMult + gaussRandom(0, 0.2)) * 10) / 10,
      invoices_affected: Math.round(89 * daysMult),
      root_cause: 'GL rules outdated',
      root_cause_type: 'gl_rule_gap',
      action: {
        label: 'Update GL Rules',
        description: 'Auto-map top 20 vendors',
        action_type: 'gl_rule_review',
        action_params: { location_id: 'loc_la' },
      },
    },
    {
      rank: 3,
      id: 'opp-003',
      entity_type: 'vendor',
      entity_name: 'Sysco',
      entity_id: 'vendor_001',
      issue_summary: 'GL Code Errors (24% error rate)',
      issue_metric: 24,
      issue_metric_label: 'GL error rate',
      hours_weekly: Math.round((1.5 * daysMult + gaussRandom(0, 0.2)) * 10) / 10,
      invoices_affected: Math.round(68 * daysMult),
      root_cause: 'New item codes not mapped',
      root_cause_type: 'gl_rule_gap',
      action: {
        label: 'Review GL Rules',
        description: 'Map 12 new item categories',
        action_type: 'gl_rule_review',
        action_params: { vendor_id: 'vendor_001' },
      },
    },
  ];

  // Filter opportunities if locations are selected
  if (selectedLocations.length > 0) {
    // Keep vendor opportunities, filter location opportunities
    return opportunities.filter(opp => {
      if (opp.entity_type === 'location') {
        return selectedLocations.includes(opp.entity_id);
      }
      return true;
    });
  }

  return opportunities;
}

export function getROISummary(selectedLocations: string[], dateRange: DateRangePreset): ROISummaryResponse {
  const timeBreakdown = getTimeBreakdown(selectedLocations, dateRange);
  const opportunities = getOpportunities(selectedLocations, dateRange);

  const addressableHoursWeekly = opportunities.reduce((sum, opp) => sum + opp.hours_weekly, 0);
  const currentEditRate = 28 + gaussRandom(0, 2);
  const addressableInvoices = opportunities.reduce((sum, opp) => sum + opp.invoices_affected, 0);
  const totalInvoices = timeBreakdown.total_invoices * 3; // Approx total including non-edited
  const projectedEditRate = Math.max(8, currentEditRate - (addressableInvoices / totalInvoices * 100));

  return {
    time_breakdown: timeBreakdown,
    opportunities,
    summary: {
      addressable_hours_weekly: Math.round(addressableHoursWeekly * 10) / 10,
      addressable_fte: Math.round((addressableHoursWeekly / 40) * 100) / 100,
      current_edit_rate: Math.round(currentEditRate),
      projected_edit_rate: Math.round(projectedEditRate),
    },
  };
}
