import { useEffect, useState } from 'react';
import { Eye, Download, GripVertical } from 'lucide-react';
import { getDashboardCharts, getDashboardDeals, getDashboardSpvs, getDashboardSummary } from './services/apiClient';
import {
  DashboardChartsData,
  DashboardDeal,
  DashboardSpv,
  DashboardSummaryData,
  getDealDisplayName,
  hasMeaningfulFundingProgress,
} from './services/dashboardAdapters';

interface DocumentsProps {
  isDark: boolean;
}

interface Activity {
  id: number;
  type: 'submission' | 'participation' | 'upload';
  description: string;
  timestamp: string;
}

interface DocumentRecord {
  id: number;
  name: string;
  opportunity: string;
  status: string;
  date: string;
  actions: number;
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
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
  });
}

function mapActivityType(value: number): Activity['type'] {
  if (value >= 100) {
    return 'upload';
  }

  if (value >= 50) {
    return 'participation';
  }

  return 'submission';
}

function mapDealActivityType(deal: DashboardDeal): Activity['type'] {
  const normalizedStatus = (deal.status || '').toLowerCase();

  if ((deal.unitsSold ?? 0) > 0) {
    return 'participation';
  }

  if (normalizedStatus.includes('approved') || normalizedStatus.includes('closed')) {
    return 'upload';
  }

  return 'submission';
}

function mapDocumentStatus(status?: string) {
  const normalized = (status || '').toLowerCase();

  if (normalized.includes('review')) {
    return 'Under Review';
  }

  if (normalized.includes('closed') || normalized.includes('approved')) {
    return 'Approved';
  }

  if (normalized.includes('open') || normalized.includes('closing') || normalized.includes('new')) {
    return 'Pending';
  }

  return 'Pending';
}

function buildActivities(
  charts: DashboardChartsData,
  deals: DashboardDeal[],
  summary: DashboardSummaryData,
): Activity[] {
  const chartActivities = hasMeaningfulFundingProgress(charts, deals.length)
    ? charts.fundingProgressByDeal?.slice(0, 6).map((item, index) => ({
        id: index + 1,
        type: mapActivityType(item.value),
        description: `${item.label} funding progress updated`,
        timestamp: `${Math.round(item.value)}% funded`,
      }))
    : [];

  if (chartActivities && chartActivities.length > 0) {
    return chartActivities;
  }

  return deals.slice(0, 6).map((deal, index) => ({
    id: index + 1,
    type: mapDealActivityType(deal),
    description: `${getDealDisplayName(deal)} moved to ${deal.status || 'active'}`,
    timestamp: formatDate(deal.updatedAt || summary.latestUpdatedAt),
  }));
}

function buildDocuments(
  deals: DashboardDeal[],
  spvs: DashboardSpv[],
  summary: DashboardSummaryData,
): DocumentRecord[] {
  const spvMap = new Map(spvs.map((spv) => [spv.spvId || spv.dealId || '', spv]));

  return [...deals]
    .sort((a, b) => new Date(b.updatedAt || 0).valueOf() - new Date(a.updatedAt || 0).valueOf())
    .slice(0, 8)
    .map((deal, index) => {
      const matchingSpv = spvMap.get(deal.spvId || deal.dealId || '');

      return {
        id: index + 1,
        name: `${deal.title || deal.dealId || `Deal ${index + 1}`} Investment Memo`,
        opportunity: deal.propertyAddress || deal.title || deal.dealId || 'Active opportunity',
        status: mapDocumentStatus(deal.status),
        date: formatDate(deal.updatedAt || summary.latestUpdatedAt),
        actions: matchingSpv?.investorCount ?? Math.round(deal.unitsSold ?? 0),
      };
    });
}

export default function Documents({ isDark }: DocumentsProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [draggedItem, setDraggedItem] = useState<number | null>(null);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadDocuments() {
      try {
        const [dealsData, spvData, chartsData, summaryData] = await Promise.all([
          getDashboardDeals(),
          getDashboardSpvs(),
          getDashboardCharts(),
          getDashboardSummary(),
        ]);

        if (!isMounted) {
          return;
        }

        setActivities(buildActivities(chartsData, dealsData, summaryData));
        setDocuments(buildDocuments(dealsData, spvData, summaryData));
      } catch (error) {
        if (isMounted) {
          setLoadError(error instanceof Error ? error.message : 'Failed to load documents.');
        }
      }
    }

    loadDocuments();

    return () => {
      isMounted = false;
    };
  }, []);

  const getStatusColor = (type: string) => {
    switch (type) {
      case 'submission':
        return 'bg-blue-500';
      case 'participation':
        return 'bg-green-500';
      case 'upload':
        return 'bg-[#f59e0b]';
      default:
        return 'bg-gray-500';
    }
  };

  const getDocStatusColor = (status: string) => {
    switch (status) {
      case 'Approved':
        return isDark ? 'bg-green-500/10 text-green-400' : 'bg-green-100 text-green-700';
      case 'Under Review':
        return isDark ? 'bg-[#f59e0b]/10 text-[#f59e0b]' : 'bg-orange-100 text-orange-700';
      case 'Pending':
        return isDark ? 'bg-gray-500/10 text-gray-400' : 'bg-gray-100 text-gray-700';
      default:
        return isDark ? 'bg-gray-500/10 text-gray-400' : 'bg-gray-100 text-gray-700';
    }
  };

  const handleDragStart = (index: number) => {
    setDraggedItem(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();

    if (draggedItem === null || draggedItem === index) return;

    const newDocuments = [...documents];
    const draggedDoc = newDocuments[draggedItem];
    newDocuments.splice(draggedItem, 1);
    newDocuments.splice(index, 0, draggedDoc);

    setDocuments(newDocuments);
    setDraggedItem(index);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  const handleView = (docName: string) => {
    console.log('View document:', docName);
  };

  const handleDownload = (docName: string) => {
    console.log('Download document:', docName);
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Documents
        </h2>
        <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Platform document activity and access
        </p>
        {loadError && (
          <p className="mt-2 text-sm text-red-400">
            {loadError}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className={`dashboard-card p-4 ${!isDark && 'bg-white border-gray-200 shadow-sm'}`}>
          <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Document Activity Feed
          </h3>
          {activities.length > 0 ? (
            <div className="space-y-3">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className={`p-3 rounded-lg transition-colors ${
                    isDark ? 'bg-[#0f172a] hover:bg-[#1e293b]' : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${getStatusColor(activity.type)}`} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                        {activity.description}
                      </p>
                      <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                        {activity.timestamp}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
              No document activity is available from the live dashboard feed yet.
            </p>
          )}
        </div>

        <div className={`xl:col-span-2 dashboard-card p-4 ${!isDark && 'bg-white border-gray-200 shadow-sm'}`}>
          <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Document Center
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`border-b ${isDark ? 'border-[#1f2937]' : 'border-gray-200'}`}>
                  <th className="pb-3 text-left">
                    <span className={`text-xs font-semibold uppercase ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Document
                    </span>
                  </th>
                  <th className="pb-3 text-left">
                    <span className={`text-xs font-semibold uppercase ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Opportunity
                    </span>
                  </th>
                  <th className="pb-3 text-left">
                    <span className={`text-xs font-semibold uppercase ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Status
                    </span>
                  </th>
                  <th className="pb-3 text-left">
                    <span className={`text-xs font-semibold uppercase ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Today's Date
                    </span>
                  </th>
                  <th className="pb-3 text-left">
                    <span className={`text-xs font-semibold uppercase ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Actions Taken (No.)
                    </span>
                  </th>
                  <th className="pb-3 text-right">
                    <span className={`text-xs font-semibold uppercase ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Actions
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {documents.length > 0 ? (
                  documents.map((doc, index) => (
                    <tr
                      key={doc.id}
                      draggable
                      onDragStart={() => handleDragStart(index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragEnd={handleDragEnd}
                      className={`border-b transition-colors cursor-move ${
                        isDark ? 'border-[#1f2937] hover:bg-[#0f172a]' : 'border-gray-100 hover:bg-gray-50'
                      } ${draggedItem === index ? 'opacity-50' : 'opacity-100'}`}
                    >
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <GripVertical
                            size={16}
                            className={`flex-shrink-0 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}
                          />
                          <span className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                            {doc.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-3">
                        <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {doc.opportunity}
                        </span>
                      </td>
                      <td className="py-3">
                        <span className={`inline-block px-2 py-1 rounded-md text-xs font-medium ${getDocStatusColor(doc.status)}`}>
                          {doc.status}
                        </span>
                      </td>
                      <td className="py-3">
                        <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {doc.date}
                        </span>
                      </td>
                      <td className="py-3">
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold ${
                          isDark ? 'bg-[#f59e0b]/10 text-[#f59e0b]' : 'bg-orange-100 text-orange-700'
                        }`}>
                          {doc.actions}
                        </span>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleView(doc.name)}
                            className={`p-1.5 rounded hover:bg-[#f59e0b]/10 transition-colors ${
                              isDark ? 'text-gray-400 hover:text-[#f59e0b]' : 'text-gray-600 hover:text-[#f59e0b]'
                            }`}
                            title="View"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => handleDownload(doc.name)}
                            className={`p-1.5 rounded hover:bg-[#f59e0b]/10 transition-colors ${
                              isDark ? 'text-gray-400 hover:text-[#f59e0b]' : 'text-gray-600 hover:text-[#f59e0b]'
                            }`}
                            title="Download"
                          >
                            <Download size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className={`py-6 text-center text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}
                    >
                      No documents are available from the live dashboard feed.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
