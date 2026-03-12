export interface DashboardSummaryData {
  totalDeals?: number;
  activeDeals?: number;
  totalCapitalRequired?: number;
  totalRaised?: number;
  totalSPVs?: number;
  totalSpvs?: number;
  totalInvestors?: number;
  unitsSold?: number;
  unitsRemaining?: number;
  fundingProgressPercent?: number;
  latestUpdatedAt?: string;
}

export interface DashboardDeal {
  id?: string;
  dealId?: string;
  spvId?: string;
  title?: string;
  buyboxType?: string;
  status?: string;
  state?: string;
  propertyAddress?: string;
  capitalRequired?: number;
  raised?: number;
  unitsSold?: number;
  unitsRemaining?: number;
  totalUnits?: number;
  sentMail?: boolean;
  updatedAt?: string;
}

export interface DashboardSpv {
  id?: string;
  name?: string;
  spvId?: string;
  dealId?: string;
  status?: string;
  state?: string;
  propertyAddress?: string;
  capitalRequired?: number;
  totalCapitalRequired?: number;
  totalRaised?: number;
  fundingProgressPercent?: number;
  unitsSold?: number;
  unitsRemaining?: number;
  investorCount?: number;
}

export interface ChartPoint {
  label: string;
  value: number;
}

export interface DashboardChartsData {
  stateDistribution?: ChartPoint[];
  statusDistribution?: ChartPoint[];
  unitsSoldVsRemaining?: ChartPoint[];
  fundingProgressByDeal?: ChartPoint[];
}

function normalizeLabel(label?: string) {
  return (label || "").toLowerCase();
}

function sumMatchingPoints(points: ChartPoint[], matcher: (label: string) => boolean) {
  return points.reduce((sum, point) => (
    matcher(normalizeLabel(point.label)) ? sum + (point.value || 0) : sum
  ), 0);
}

export function getStatusDistribution(charts?: DashboardChartsData | null) {
  return charts?.statusDistribution ?? [];
}

export function getUnderReviewCount(summary?: DashboardSummaryData | null, charts?: DashboardChartsData | null) {
  const totalDeals = summary?.totalDeals ?? 0;
  const statusDistribution = getStatusDistribution(charts);

  if (statusDistribution.length > 0) {
    return sumMatchingPoints(statusDistribution, (label) => (
      label.includes("review") || label.includes("submitted")
    ));
  }

  return Math.max(totalDeals - (summary?.activeDeals ?? 0), 0);
}

export function getActiveDealCount(summary?: DashboardSummaryData | null, charts?: DashboardChartsData | null) {
  const statusDistribution = getStatusDistribution(charts);

  if (statusDistribution.length > 0) {
    return sumMatchingPoints(statusDistribution, (label) => (
      label.includes("active") ||
      label.includes("approved") ||
      label.includes("funding") ||
      label.includes("closing") ||
      label.includes("open")
    ));
  }

  return summary?.activeDeals ?? 0;
}

export function getTotalSpvCount(summary?: DashboardSummaryData | null, spvs: DashboardSpv[] = []) {
  return summary?.totalSPVs ?? summary?.totalSpvs ?? spvs.length;
}

export function getUnitsMetric(charts?: DashboardChartsData | null, summary?: DashboardSummaryData | null, label?: string) {
  const normalizedLabel = normalizeLabel(label);
  const chartValue = charts?.unitsSoldVsRemaining?.find((item) => normalizeLabel(item.label) === normalizedLabel)?.value;

  if (typeof chartValue === "number") {
    return chartValue;
  }

  if (normalizedLabel === "units sold") {
    return summary?.unitsSold ?? 0;
  }

  if (normalizedLabel === "units remaining") {
    return summary?.unitsRemaining ?? 0;
  }

  return 0;
}

export function getDealDisplayName(deal: DashboardDeal) {
  return deal.propertyAddress || deal.title || deal.dealId || deal.id || "Untitled deal";
}

export function getDealCapitalRequested(deal: DashboardDeal) {
  return deal.capitalRequired ?? 0;
}

export function getSpvCapitalAmount(spv: DashboardSpv) {
  const totalRaised = spv.totalRaised ?? 0;

  if (totalRaised > 0) {
    return totalRaised;
  }

  return spv.capitalRequired ?? spv.totalCapitalRequired ?? 0;
}

export function hasMeaningfulFundingProgress(charts?: DashboardChartsData | null, expectedCount = 0) {
  const entries = charts?.fundingProgressByDeal ?? [];

  if (entries.length === 0) {
    return false;
  }

  if (expectedCount <= 1) {
    return true;
  }

  return entries.length >= Math.min(3, expectedCount);
}
