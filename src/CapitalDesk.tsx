import { useEffect, useState } from 'react';
import { GripVertical } from 'lucide-react';
import { getDashboardCharts, getDashboardSpvs, getDashboardSummary } from './services/apiClient';
import {
  DashboardChartsData,
  DashboardSpv,
  DashboardSummaryData,
  getActiveDealCount,
  getTotalSpvCount,
  getUnderReviewCount,
  getUnitsMetric,
} from './services/dashboardAdapters';

interface CapitalDeskProps {
  isDark: boolean;
}

interface MetricCard {
  id: number;
  label: string;
  value: string;
  change: string;
  isPositive: boolean;
}

interface Activity {
  id: number;
  description: string;
  timestamp: string;
  type: 'submission' | 'participation' | 'approval';
}

interface QuickStat {
  label: string;
  value: string;
}

function formatCompactCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value || 0);
}

function toPercent(value: number, total: number) {
  if (!total) {
    return '0.0%';
  }

  return `${((value / total) * 100).toFixed(1)}%`;
}

function buildMetricRows(summary: DashboardSummaryData, spvs: DashboardSpv[], charts: DashboardChartsData) {
  const totalDeals = summary.totalDeals ?? 0;
  const underReview = getUnderReviewCount(summary, charts);
  const activeDeals = getActiveDealCount(summary, charts);
  const totalSpvs = getTotalSpvCount(summary, spvs);
  const fundingProgress = summary.fundingProgressPercent ?? 0;
  const totalInvestors = summary.totalInvestors ?? spvs.reduce((sum, spv) => sum + (spv.investorCount ?? 0), 0);

  const metricsRow1: MetricCard[] = [
    { id: 1, label: 'Opportunities Submitted', value: String(totalDeals), change: '100.0%', isPositive: true },
    { id: 2, label: 'Under Review', value: String(underReview), change: toPercent(underReview, totalDeals), isPositive: underReview <= activeDeals },
    { id: 3, label: 'Active Deals', value: String(activeDeals), change: toPercent(activeDeals, totalDeals), isPositive: activeDeals > 0 },
    { id: 4, label: 'Total SPVs', value: String(totalSpvs), change: `${totalSpvs} tracked`, isPositive: totalSpvs > 0 },
  ];

  const metricsRow2: MetricCard[] = [
    {
      id: 5,
      label: 'Capital Requested',
      value: formatCompactCurrency(summary.totalCapitalRequired ?? 0),
      change: toPercent(summary.totalCapitalRequired ?? 0, Math.max(summary.totalCapitalRequired ?? 0, 1)),
      isPositive: true,
    },
    {
      id: 6,
      label: 'Capital Committed',
      value: formatCompactCurrency(summary.totalRaised ?? 0),
      change: `${fundingProgress.toFixed(1)}%`,
      isPositive: fundingProgress >= 50,
    },
    {
      id: 7,
      label: 'Funding Progress',
      value: `${fundingProgress.toFixed(1)}%`,
      change: `${fundingProgress.toFixed(1)}%`,
      isPositive: fundingProgress >= 50,
    },
    {
      id: 8,
      label: 'Total Investors',
      value: String(totalInvestors),
      change: `${totalInvestors} active`,
      isPositive: totalInvestors > 0,
    },
  ];

  return { metricsRow1, metricsRow2 };
}

function buildActivities(spvs: DashboardSpv[]): Activity[] {
  return [...spvs]
    .sort((a, b) => (b.fundingProgressPercent ?? 0) - (a.fundingProgressPercent ?? 0))
    .slice(0, 6)
    .map((spv, index) => {
      const progress = Math.round(spv.fundingProgressPercent ?? 0);
      const status = spv.status || 'Under Review';
      const normalizedStatus = status.toLowerCase();
      let type: Activity['type'] = 'submission';

      if (normalizedStatus.includes('close') || progress >= 100) {
        type = 'approval';
      } else if (progress > 0) {
        type = 'participation';
      }

      return {
        id: index + 1,
        description: `${spv.spvId || `SPV-${index + 1}`} for ${spv.dealId || 'active lane'} is ${status.toLowerCase()}.`,
        timestamp: `${spv.investorCount ?? 0} investors • ${progress}% funded`,
        type,
      };
    });
}

function buildQuickStats(summary: DashboardSummaryData, charts: DashboardChartsData, spvs: DashboardSpv[]) {
  const sold = getUnitsMetric(charts, summary, 'Units Sold');
  const remaining = getUnitsMetric(charts, summary, 'Units Remaining');

  return [
    { label: 'Total SPVs', value: String(getTotalSpvCount(summary, spvs)) },
    { label: 'Tracked States', value: String(charts.stateDistribution?.length ?? 0) },
    { label: 'Units Sold', value: String(sold) },
    { label: 'Units Remaining', value: String(remaining) },
  ];
}

export default function CapitalDesk({ isDark }: CapitalDeskProps) {
  const [metricsRow1, setMetricsRow1] = useState<MetricCard[]>([]);
  const [metricsRow2, setMetricsRow2] = useState<MetricCard[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [quickStats, setQuickStats] = useState<QuickStat[]>([]);
  const [draggedItem, setDraggedItem] = useState<{ row: number; index: number } | null>(null);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadCapitalDesk() {
      try {
        const [summaryData, spvData, chartsData] = await Promise.all([
          getDashboardSummary(),
          getDashboardSpvs(),
          getDashboardCharts(),
        ]);

        if (!isMounted) {
          return;
        }

        const { metricsRow1: row1, metricsRow2: row2 } = buildMetricRows(summaryData, spvData, chartsData);
        setMetricsRow1(row1);
        setMetricsRow2(row2);
        setActivities(buildActivities(spvData));
        setQuickStats(buildQuickStats(summaryData, chartsData, spvData));
      } catch (error) {
        if (isMounted) {
          setLoadError(error instanceof Error ? error.message : 'Failed to load capital desk.');
        }
      }
    }

    loadCapitalDesk();

    return () => {
      isMounted = false;
    };
  }, []);

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'submission':
        return 'bg-blue-500';
      case 'participation':
        return 'bg-green-500';
      case 'approval':
        return 'bg-[#f59e0b]';
      default:
        return 'bg-gray-500';
    }
  };

  const handleDragStart = (row: number, index: number) => {
    setDraggedItem({ row, index });
  };

  const handleDragOver = (e: React.DragEvent, row: number, index: number) => {
    e.preventDefault();

    if (!draggedItem || draggedItem.row !== row || draggedItem.index === index) return;

    if (row === 1) {
      const newMetrics = [...metricsRow1];
      const draggedCard = newMetrics[draggedItem.index];
      newMetrics.splice(draggedItem.index, 1);
      newMetrics.splice(index, 0, draggedCard);
      setMetricsRow1(newMetrics);
      setDraggedItem({ row, index });
    } else if (row === 2) {
      const newMetrics = [...metricsRow2];
      const draggedCard = newMetrics[draggedItem.index];
      newMetrics.splice(draggedItem.index, 1);
      newMetrics.splice(index, 0, draggedCard);
      setMetricsRow2(newMetrics);
      setDraggedItem({ row, index });
    }
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  const renderMetricCard = (metric: MetricCard, row: number, index: number) => {
    const isDragging = draggedItem?.row === row && draggedItem?.index === index;

    return (
      <div
        key={metric.id}
        draggable
        onDragStart={() => handleDragStart(row, index)}
        onDragOver={(e) => handleDragOver(e, row, index)}
        onDragEnd={handleDragEnd}
        className={`dashboard-card p-6 cursor-move transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${
          !isDark && 'bg-white border-gray-200 shadow-sm'
        } ${isDragging ? 'opacity-50' : 'opacity-100'}`}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className={`text-4xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {metric.value}
            </div>
            <div className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {metric.label}
            </div>
          </div>
          <GripVertical size={20} className={isDark ? 'text-gray-600' : 'text-gray-400'} />
        </div>
        <div className="flex items-center gap-1 text-xs">
          <span className={metric.isPositive ? 'text-green-400' : 'text-red-400'}>
            {metric.isPositive ? '↑' : '↓'} {metric.change}
          </span>
          <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>live snapshot</span>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Capital Desk
        </h2>
        <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Capital participation overview
        </p>
        {loadError && (
          <p className="mt-2 text-sm text-red-400">
            {loadError}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-4">
        {metricsRow1.map((metric, index) => renderMetricCard(metric, 1, index))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {metricsRow2.map((metric, index) => renderMetricCard(metric, 2, index))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className={`dashboard-card p-6 ${!isDark && 'bg-white border-gray-200 shadow-sm'}`}>
          <h3 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Recent Activity
          </h3>
          {activities.length > 0 ? (
            <div className="space-y-3">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className={`flex items-center gap-4 p-3 rounded-lg transition-colors ${
                    isDark ? 'bg-[#0f172a] hover:bg-[#1e293b]' : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${getActivityColor(activity.type)}`} />
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {activity.description}
                    </p>
                    <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                      {activity.timestamp}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
              No recent capital activity is available yet.
            </p>
          )}
        </div>

        <div className={`dashboard-card p-6 ${!isDark && 'bg-white border-gray-200 shadow-sm'}`}>
          <h3 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Quick Capital Stats
          </h3>
          {quickStats.length > 0 ? (
            <div className="space-y-4">
              {quickStats.map((stat) => (
                <div
                  key={stat.label}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    isDark ? 'bg-[#0f172a]' : 'bg-gray-50'
                  }`}
                >
                  <span className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {stat.label}
                  </span>
                  <span className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {stat.value}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
              No quick stats are available yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
