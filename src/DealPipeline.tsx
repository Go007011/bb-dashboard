import { useEffect, useState } from 'react';
import { getDashboardDeals } from './services/apiClient';
import { DashboardDeal, getDealCapitalRequested, getDealDisplayName } from './services/dashboardAdapters';

interface Opportunity {
  id: string;
  name: string;
  capitalRequested: string;
  submissionDate: string;
  status: string;
}

interface Column {
  id: string;
  title: string;
  opportunities: Opportunity[];
  statusColor: string;
}

interface DealPipelineProps {
  isDark: boolean;
}

function createEmptyColumns(): Column[] {
  return [
    { id: 'submitted', title: 'Submitted', statusColor: '#3b82f6', opportunities: [] },
    { id: 'review', title: 'Review', statusColor: '#f59e0b', opportunities: [] },
    { id: 'approved', title: 'Approved', statusColor: '#10b981', opportunities: [] },
    { id: 'funding', title: 'Funding', statusColor: '#8b5cf6', opportunities: [] },
    { id: 'closed', title: 'Closed', statusColor: '#6b7280', opportunities: [] },
  ];
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function formatShortDate(value?: string) {
  if (!value) {
    return 'latest sync';
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.valueOf())) {
    return 'latest sync';
  }

  return parsed.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

function mapDealStatusToColumnId(status?: string) {
  const normalized = (status || '').toLowerCase();

  if (normalized.includes('review')) {
    return 'review';
  }

  if (normalized.includes('approved')) {
    return 'approved';
  }

  if (normalized.includes('closing') || normalized.includes('funding')) {
    return 'funding';
  }

  if (normalized.includes('closed')) {
    return 'closed';
  }

  if (normalized.includes('open') || normalized.includes('new') || normalized.includes('submitted')) {
    return 'submitted';
  }

  return 'review';
}

function buildColumnsFromDeals(deals: DashboardDeal[]) {
  const columns = createEmptyColumns();
  const indexById = new Map(columns.map((column, index) => [column.id, index]));

  [...deals]
    .sort((a, b) => new Date(b.updatedAt || 0).valueOf() - new Date(a.updatedAt || 0).valueOf())
    .forEach((deal) => {
      const columnId = mapDealStatusToColumnId(deal.status);
      const columnIndex = indexById.get(columnId);

      if (columnIndex === undefined) {
        return;
      }

      columns[columnIndex].opportunities.push({
        id: deal.dealId || deal.id || `deal-${columnIndex}`,
        name: getDealDisplayName(deal),
        capitalRequested: formatCurrency(getDealCapitalRequested(deal)),
        submissionDate: formatShortDate(deal.updatedAt),
        status: deal.status || 'Under Review',
      });
    });

  return columns;
}

export default function DealPipeline({ isDark }: DealPipelineProps) {
  const [columns, setColumns] = useState<Column[]>(createEmptyColumns());
  const [draggedItem, setDraggedItem] = useState<{ opportunity: Opportunity; sourceColumnId: string } | null>(null);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadDeals() {
      try {
        const deals = await getDashboardDeals();
        if (isMounted) {
          setColumns(buildColumnsFromDeals(deals));
        }
      } catch (error) {
        if (isMounted) {
          setLoadError(error instanceof Error ? error.message : 'Failed to load dashboard deals.');
        }
      }
    }

    loadDeals();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleDragStart = (opportunity: Opportunity, columnId: string) => {
    setDraggedItem({ opportunity, sourceColumnId: columnId });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetColumnId: string) => {
    if (!draggedItem) return;

    const { opportunity, sourceColumnId } = draggedItem;

    if (sourceColumnId === targetColumnId) {
      setDraggedItem(null);
      return;
    }

    setColumns((prevColumns) => {
      const newColumns = prevColumns.map((col) => ({ ...col, opportunities: [...col.opportunities] }));

      const sourceColumn = newColumns.find((col) => col.id === sourceColumnId);
      const targetColumn = newColumns.find((col) => col.id === targetColumnId);

      if (sourceColumn && targetColumn) {
        sourceColumn.opportunities = sourceColumn.opportunities.filter((opp) => opp.id !== opportunity.id);
        targetColumn.opportunities = [...targetColumn.opportunities, { ...opportunity, status: targetColumn.title }];
      }

      return newColumns;
    });

    setDraggedItem(null);
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Deal Pipeline
        </h2>
        <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Opportunity review workflow
        </p>
        {loadError && (
          <p className="mt-2 text-sm text-red-400">
            {loadError}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
        {columns.map((column) => (
          <div
            key={column.id}
            className={`dashboard-card p-4 ${!isDark && 'bg-white border-gray-200 shadow-sm'} min-h-[500px]`}
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(column.id)}
          >
            <div className="mb-4">
              <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-1`}>
                {column.title}
              </h3>
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: column.statusColor }}
                />
                <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  {column.opportunities.length} {column.opportunities.length === 1 ? 'item' : 'items'}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              {column.opportunities.map((opportunity) => (
                <div
                  key={opportunity.id}
                  draggable
                  onDragStart={() => handleDragStart(opportunity, column.id)}
                  className={`cursor-move p-3.5 rounded-xl border transition-all duration-200 ${
                    isDark
                      ? 'bg-gradient-to-br from-[#1e293b] to-[#0f172a] border-[#1f2937] hover:border-[#f59e0b]/30'
                      : 'bg-white border-gray-200 hover:border-[#f59e0b]/50'
                  } hover:transform hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(0,0,0,0.55)]`}
                >
                  <div className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {opportunity.name}
                  </div>
                  <div className={`text-sm mb-1.5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {opportunity.capitalRequested} requested
                  </div>
                  <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'} mb-2`}>
                    Updated {opportunity.submissionDate}
                  </div>
                  <div className="flex items-center gap-1.5 pt-2 border-t border-[#1f2937]">
                    <div
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: column.statusColor }}
                    />
                    <span className={`text-xs capitalize ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {opportunity.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
