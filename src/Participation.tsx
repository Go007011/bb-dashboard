import { useEffect, useState } from 'react';
import { ChevronUp, ChevronDown, GripVertical, Eye, FileText } from 'lucide-react';
import { getDashboardSpvs, getDashboardSummary } from './services/apiClient';
import { DashboardSpv, DashboardSummaryData, getSpvCapitalAmount } from './services/dashboardAdapters';

interface ParticipationProps {
  isDark: boolean;
}

interface ParticipationRecord {
  id: number;
  businessId: string;
  opportunity: string;
  capitalAmount: string;
  participationPct: number;
  status: 'Approved' | 'Pending' | 'Review' | 'Declined';
  date: string;
  progress: number;
}

type SortField = 'businessId' | 'opportunity' | 'capitalAmount' | 'participationPct' | 'status' | 'date' | 'progress';
type SortDirection = 'asc' | 'desc' | null;

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function formatDate(value?: string) {
  if (!value) {
    return 'N/A';
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.valueOf())) {
    return 'N/A';
  }

  return parsed.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  });
}

function mapParticipationStatus(status?: string, progress?: number): ParticipationRecord['status'] {
  const normalized = (status || '').toLowerCase();

  if (normalized.includes('declined') || normalized.includes('paused')) {
    return 'Declined';
  }

  if (normalized.includes('review')) {
    return 'Review';
  }

  if (normalized.includes('closed') || (progress ?? 0) >= 100) {
    return 'Approved';
  }

  if (normalized.includes('open') || normalized.includes('closing') || normalized.includes('new')) {
    return 'Pending';
  }

  return 'Pending';
}

function buildParticipationRecords(spvs: DashboardSpv[], summary: DashboardSummaryData): ParticipationRecord[] {
  return [...spvs]
    .sort((a, b) => (b.fundingProgressPercent ?? 0) - (a.fundingProgressPercent ?? 0))
    .map((spv, index) => {
      const progress = Math.round(spv.fundingProgressPercent ?? 0);

      return {
        id: index + 1,
        businessId: spv.spvId || `SPV-${index + 1}`,
        opportunity: spv.propertyAddress || spv.dealId || spv.spvId || 'Active deal',
        capitalAmount: formatCurrency(getSpvCapitalAmount(spv)),
        participationPct: progress,
        status: mapParticipationStatus(spv.status, progress),
        date: formatDate(summary.latestUpdatedAt),
        progress,
      };
    });
}

export default function Participation({ isDark }: ParticipationProps) {
  const [records, setRecords] = useState<ParticipationRecord[]>([]);
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [draggedItem, setDraggedItem] = useState<number | null>(null);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadParticipation() {
      try {
        const [spvData, summaryData] = await Promise.all([
          getDashboardSpvs(),
          getDashboardSummary(),
        ]);

        if (isMounted) {
          setRecords(buildParticipationRecords(spvData, summaryData));
        }
      } catch (error) {
        if (isMounted) {
          setLoadError(error instanceof Error ? error.message : 'Failed to load participation.');
        }
      }
    }

    loadParticipation();

    return () => {
      isMounted = false;
    };
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved':
        return isDark ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-green-100 text-green-700 border-green-200';
      case 'Pending':
        return isDark ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' : 'bg-orange-100 text-orange-700 border-orange-200';
      case 'Review':
        return isDark ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Declined':
        return isDark ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-red-100 text-red-700 border-red-200';
      default:
        return isDark ? 'bg-gray-500/20 text-gray-400 border-gray-500/30' : 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const handleSort = (field: SortField) => {
    let direction: SortDirection = 'asc';

    if (sortField === field) {
      if (sortDirection === 'asc') {
        direction = 'desc';
      } else if (sortDirection === 'desc') {
        direction = null;
        setSortField(null);
        setSortDirection(null);
        return;
      }
    }

    setSortField(field);
    setSortDirection(direction);

    const sorted = [...records].sort((a, b) => {
      let aValue: string | number = a[field];
      let bValue: string | number = b[field];

      if (field === 'capitalAmount') {
        aValue = parseInt(a.capitalAmount.replace(/[$,]/g, ''));
        bValue = parseInt(b.capitalAmount.replace(/[$,]/g, ''));
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return direction === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return direction === 'asc'
        ? (aValue as number) - (bValue as number)
        : (bValue as number) - (aValue as number);
    });

    setRecords(sorted);
  };

  const handleDragStart = (index: number) => {
    setDraggedItem(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();

    if (draggedItem === null || draggedItem === index) return;

    const newRecords = [...records];
    const draggedRecord = newRecords[draggedItem];
    newRecords.splice(draggedItem, 1);
    newRecords.splice(index, 0, draggedRecord);
    setRecords(newRecords);
    setDraggedItem(index);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return (
        <span className={`inline-flex flex-col ml-1 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
          <ChevronUp size={12} className="-mb-1" />
          <ChevronDown size={12} />
        </span>
      );
    }

    return sortDirection === 'asc' ? (
      <ChevronUp size={14} className="inline ml-1" />
    ) : (
      <ChevronDown size={14} className="inline ml-1" />
    );
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Participation
        </h2>
        <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Participation activity across opportunities
        </p>
        {loadError && (
          <p className="mt-2 text-sm text-red-400">
            {loadError}
          </p>
        )}
      </div>

      <div className={`dashboard-card overflow-hidden ${!isDark && 'bg-white border-gray-200 shadow-sm'}`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`border-b ${isDark ? 'border-gray-700 bg-[#0f172a]' : 'border-gray-200 bg-gray-50'}`}>
                <th className={`text-left p-4 font-semibold text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  <div className="flex items-center gap-2">
                    <GripVertical size={16} className={isDark ? 'text-gray-600' : 'text-gray-400'} />
                  </div>
                </th>
                <th
                  className={`text-left p-4 font-semibold text-sm cursor-pointer hover:${isDark ? 'text-white' : 'text-gray-900'} ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
                  onClick={() => handleSort('businessId')}
                >
                  Business <SortIcon field="businessId" />
                </th>
                <th
                  className={`text-left p-4 font-semibold text-sm cursor-pointer hover:${isDark ? 'text-white' : 'text-gray-900'} ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
                  onClick={() => handleSort('opportunity')}
                >
                  Opportunity <SortIcon field="opportunity" />
                </th>
                <th
                  className={`text-left p-4 font-semibold text-sm cursor-pointer hover:${isDark ? 'text-white' : 'text-gray-900'} ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
                  onClick={() => handleSort('capitalAmount')}
                >
                  Capital Amount <SortIcon field="capitalAmount" />
                </th>
                <th
                  className={`text-left p-4 font-semibold text-sm cursor-pointer hover:${isDark ? 'text-white' : 'text-gray-900'} ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
                  onClick={() => handleSort('participationPct')}
                >
                  Participation % <SortIcon field="participationPct" />
                </th>
                <th
                  className={`text-left p-4 font-semibold text-sm cursor-pointer hover:${isDark ? 'text-white' : 'text-gray-900'} ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
                  onClick={() => handleSort('status')}
                >
                  Status <SortIcon field="status" />
                </th>
                <th
                  className={`text-left p-4 font-semibold text-sm cursor-pointer hover:${isDark ? 'text-white' : 'text-gray-900'} ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
                  onClick={() => handleSort('date')}
                >
                  Date <SortIcon field="date" />
                </th>
                <th
                  className={`text-left p-4 font-semibold text-sm cursor-pointer hover:${isDark ? 'text-white' : 'text-gray-900'} ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
                  onClick={() => handleSort('progress')}
                >
                  Progress <SortIcon field="progress" />
                </th>
                <th className={`text-left p-4 font-semibold text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {records.length > 0 ? (
                records.map((record, index) => (
                  <tr
                    key={record.id}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                    className={`border-b cursor-move transition-colors ${
                      isDark
                        ? 'border-gray-700 hover:bg-[#1e293b]'
                        : 'border-gray-100 hover:bg-gray-50'
                    } ${draggedItem === index ? 'opacity-50' : 'opacity-100'}`}
                  >
                    <td className="p-4">
                      <GripVertical size={16} className={isDark ? 'text-gray-600' : 'text-gray-400'} />
                    </td>
                    <td className={`p-4 text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {record.businessId}
                    </td>
                    <td className={`p-4 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {record.opportunity}
                    </td>
                    <td className={`p-4 text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {record.capitalAmount}
                    </td>
                    <td className={`p-4 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {record.participationPct}%
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border ${getStatusColor(record.status)}`}>
                        {record.status}
                      </span>
                    </td>
                    <td className={`p-4 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {record.date}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className={`flex-1 h-2 rounded-full overflow-hidden ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                          <div
                            className="h-full bg-blue-500 transition-all duration-300"
                            style={{ width: `${record.progress}%` }}
                          />
                        </div>
                        <span className={`text-xs font-medium min-w-[3ch] ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {record.progress}%
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => console.log('View clicked', record.id)}
                          className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                            isDark
                              ? 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/30'
                              : 'bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200'
                          }`}
                        >
                          <Eye size={14} />
                          View
                        </button>
                        <button
                          onClick={() => console.log('Details clicked', record.id)}
                          className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                            isDark
                              ? 'bg-gray-500/10 text-gray-400 hover:bg-gray-500/20 border border-gray-500/30'
                              : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                          }`}
                        >
                          <FileText size={14} />
                          Details
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={9}
                    className={`p-6 text-center text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}
                  >
                    No participation records are available from the live dashboard feed.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
