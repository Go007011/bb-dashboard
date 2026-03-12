import { useEffect, useState } from 'react';
import { FileText, TrendingUp, Building2, Users, FolderOpen, Bell, X, ArrowRight } from 'lucide-react';
import OpportunityIntake from './OpportunityIntake';
import DealPipeline from './DealPipeline';
import CapitalDesk from './CapitalDesk';
import Participation from './Participation';
import Documents from './Documents';
import Notifications from './Notifications';
import { getDashboardCharts, getDashboardSummary } from './services/apiClient';
import {
  DashboardChartsData,
  DashboardSummaryData,
  getActiveDealCount,
  getUnderReviewCount,
} from './services/dashboardAdapters';

interface DashboardProps {
  isDark: boolean;
}

interface Module {
  id: string;
  name: string;
  description: string;
  icon: typeof FileText;
  component: React.ComponentType<{ isDark: boolean }>;
}

interface MetricCard {
  id: string;
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

function formatTimestamp(value?: string) {
  if (!value) {
    return 'Live dashboard data';
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.valueOf())) {
    return 'Live dashboard data';
  }

  return `Last updated ${parsed.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })}`;
}

export default function Dashboard({ isDark }: DashboardProps) {
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [summary, setSummary] = useState<DashboardSummaryData | null>(null);
  const [charts, setCharts] = useState<DashboardChartsData | null>(null);
  const [summaryError, setSummaryError] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      try {
        const [summaryData, chartsData] = await Promise.all([
          getDashboardSummary(),
          getDashboardCharts(),
        ]);

        if (isMounted) {
          setSummary(summaryData);
          setCharts(chartsData);
          setSummaryError('');
        }
      } catch (error) {
        if (isMounted) {
          setSummaryError(error instanceof Error ? error.message : 'Failed to load dashboard summary.');
        }
      }
    }

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  const modules: Module[] = [
    {
      id: 'opportunity-intake',
      name: 'Opportunity Intake',
      description: 'Submit and manage new investment opportunities',
      icon: FileText,
      component: OpportunityIntake
    },
    {
      id: 'deal-pipeline',
      name: 'Deal Pipeline',
      description: 'Track deals through your pipeline stages',
      icon: TrendingUp,
      component: DealPipeline
    },
    {
      id: 'capital-desk',
      name: 'Capital Desk',
      description: 'Monitor capital metrics and performance',
      icon: Building2,
      component: CapitalDesk
    },
    {
      id: 'participation',
      name: 'Participation',
      description: 'View participation activity across opportunities',
      icon: Users,
      component: Participation
    },
    {
      id: 'documents',
      name: 'Documents',
      description: 'Access and manage deal documents',
      icon: FolderOpen,
      component: Documents
    },
    {
      id: 'notifications',
      name: 'Notifications',
      description: 'Review system alerts and messages',
      icon: Bell,
      component: Notifications
    }
  ];

  const openModule = (module: Module) => {
    setSelectedModule(module);
  };

  const closeModule = () => {
    setSelectedModule(null);
  };

  const totalDeals = summary?.totalDeals ?? 0;
  const underReview = getUnderReviewCount(summary, charts);
  const activeDeals = getActiveDealCount(summary, charts);

  const metrics: MetricCard[] = [
    { id: 'opportunities-submitted', label: 'Opportunities Submitted', value: String(totalDeals) },
    { id: 'under-review', label: 'Under Review', value: String(underReview) },
    { id: 'active-deals', label: 'Active Deals', value: String(activeDeals) },
    { id: 'capital-requested', label: 'Capital Requested', value: formatCompactCurrency(summary?.totalCapitalRequired ?? 0) },
    { id: 'capital-committed', label: 'Capital Committed', value: formatCompactCurrency(summary?.totalRaised ?? 0) },
  ];

  return (
    <>
      <div className="mb-8">
        <h2 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Dashboard
        </h2>
        <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Command center
        </p>
        <p className={`mt-2 text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
          {formatTimestamp(summary?.latestUpdatedAt)}
        </p>
        {summaryError && (
          <p className="mt-2 text-sm text-red-400">
            {summaryError}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 mb-8">
        {metrics.map((metric) => (
          <div
            key={metric.id}
            className={`rounded-xl border p-5 ${
              isDark
                ? 'bg-gradient-to-br from-[#1e293b] to-[#0f172a] border-[#1f2937]'
                : 'bg-gradient-to-br from-white to-gray-50 border-gray-200 shadow-sm'
            }`}
          >
            <div className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {metric.label}
            </div>
            <div className={`mt-3 text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {metric.value}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {modules.map((module) => {
          const Icon = module.icon;
          return (
            <div
              key={module.id}
              onClick={() => openModule(module)}
              className={`group relative p-6 rounded-xl border cursor-pointer transition-all duration-300 hover:-translate-y-1 ${
                isDark
                  ? 'bg-gradient-to-br from-[#1e293b] to-[#0f172a] border-[#1f2937] hover:shadow-[0_20px_40px_rgba(0,0,0,0.55)]'
                  : 'bg-gradient-to-br from-white to-gray-50 border-gray-200 hover:shadow-xl'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg ${isDark ? 'bg-[#f59e0b]/10' : 'bg-orange-50'}`}>
                  <Icon className="text-[#f59e0b]" size={24} />
                </div>
                <ArrowRight
                  className={`transition-transform duration-300 group-hover:translate-x-1 ${
                    isDark ? 'text-gray-600' : 'text-gray-400'
                  }`}
                  size={20}
                />
              </div>

              <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {module.name}
              </h3>

              <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {module.description}
              </p>

              <button
                className={`w-full py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                  isDark
                    ? 'bg-[#f59e0b] text-white hover:bg-[#d97706]'
                    : 'bg-orange-500 text-white hover:bg-orange-600'
                }`}
              >
                Open
              </button>
            </div>
          );
        })}
      </div>

      {selectedModule && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={closeModule}
        >
          <div
            className={`relative w-full max-w-6xl max-h-[90vh] rounded-xl overflow-hidden ${
              isDark ? 'bg-[#0f172a]' : 'bg-white'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className={`sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b ${
                isDark ? 'bg-[#1e293b] border-gray-700' : 'bg-gray-50 border-gray-200'
              }`}
            >
              <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {selectedModule.name}
              </h2>
              <button
                onClick={closeModule}
                className={`p-2 rounded-lg transition-colors ${
                  isDark ? 'hover:bg-[#0f172a] text-gray-400' : 'hover:bg-gray-200 text-gray-600'
                }`}
              >
                <X size={24} />
              </button>
            </div>

            <div className="overflow-y-auto max-h-[calc(90vh-73px)] p-6">
              <selectedModule.component isDark={isDark} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
