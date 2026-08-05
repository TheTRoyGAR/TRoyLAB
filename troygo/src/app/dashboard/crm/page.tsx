'use client';

import { useMemo, useState } from 'react';
import { TrendingUp, DollarSign, Award, Users } from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { leads, contacts, Lead, LeadStage } from '@/lib/data/crm';
import { formatDistanceToNow, differenceInDays } from 'date-fns';

// ─── Stage config ──────────────────────────────────────────────────────────
const stages: { key: LeadStage; label: string; color: string; headerBg: string }[] = [
  { key: 'new',           label: 'New',           color: '#6b7280', headerBg: '#f3f4f6' },
  { key: 'contacted',     label: 'Contacted',     color: '#3b82f6', headerBg: '#dbeafe' },
  { key: 'qualified',     label: 'Qualified',     color: '#8b5cf6', headerBg: '#ede9fe' },
  { key: 'proposal_sent', label: 'Proposal Sent', color: '#f59e0b', headerBg: '#fef3c7' },
  { key: 'negotiating',   label: 'Negotiating',   color: '#ef4444', headerBg: '#fee2e2' },
  { key: 'closed_won',    label: 'Closed Won',    color: '#10b981', headerBg: '#d1fae5' },
  { key: 'closed_lost',   label: 'Closed Lost',   color: '#6b7280', headerBg: '#f3f4f6' },
];

function getContactName(contactId: string) {
  const c = contacts.find((c) => c.id === contactId);
  return c ? `${c.firstName} ${c.lastName}` : 'Unknown';
}

function getDaysInStage(lastActivity: string) {
  return differenceInDays(new Date(), new Date(lastActivity));
}

function probabilityColor(p: number) {
  if (p >= 75) return '#10b981';
  if (p >= 50) return '#f59e0b';
  return '#ef4444';
}

// ─── Lead Card ────────────────────────────────────────────────────────────
function LeadCard({ lead }: { lead: Lead }) {
  const name = getContactName(lead.contactId);
  const days = getDaysInStage(lead.lastActivity);
  const initials = name.split(' ').map((n) => n[0]).join('').slice(0, 2);
  const stale = days > 7;

  return (
    <div
      className="bg-white rounded-lg border p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      style={{ borderColor: stale ? '#fca5a5' : '#e5e7eb', borderLeft: '3px solid #00B4D8' }}
    >
      {/* Header row */}
      <div className="flex items-start gap-2 mb-2">
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
          style={{ background: '#0A1628', color: '#FFD700' }}
        >
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-gray-900 truncate">{name}</p>
          <p className="text-xs text-gray-500 truncate">{lead.packageInterest}</p>
        </div>
      </div>

      {/* Value + probability */}
      <div className="flex items-center justify-between mt-2">
        <span className="text-sm font-bold" style={{ color: '#0A1628' }}>
          ${lead.estimatedValue.toLocaleString()}
        </span>
        <span
          className="text-xs font-semibold px-1.5 py-0.5 rounded-full"
          style={{
            background: `${probabilityColor(lead.probability)}22`,
            color: probabilityColor(lead.probability),
          }}
        >
          {lead.probability}%
        </span>
      </div>

      {/* Days badge */}
      <div className="flex items-center justify-between mt-2">
        <span
          className="text-xs px-1.5 py-0.5 rounded"
          style={{
            background: stale ? '#fee2e2' : '#f3f4f6',
            color: stale ? '#ef4444' : '#6b7280',
          }}
        >
          {days}d in stage
        </span>
        <span className="text-xs text-gray-400">
          {formatDistanceToNow(new Date(lead.lastActivity), { addSuffix: true })}
        </span>
      </div>

      {/* Progress bar */}
      <div className="mt-2.5 h-1 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{
            width: `${lead.probability}%`,
            background: probabilityColor(lead.probability),
          }}
        />
      </div>
    </div>
  );
}

// ─── CRM Page ─────────────────────────────────────────────────────────────
export default function CRMPage() {
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);

  const leadsByStage = useMemo(() => {
    const map: Record<LeadStage, Lead[]> = {
      new: [], contacted: [], qualified: [], proposal_sent: [],
      negotiating: [], closed_won: [], closed_lost: [],
    };
    leads.forEach((l) => map[l.stage].push(l));
    return map;
  }, []);

  // Summary metrics
  const activePipelineLeads = leads.filter(
    (l) => !['closed_won', 'closed_lost'].includes(l.stage)
  );
  const totalPipeline = activePipelineLeads.reduce((s, l) => s + l.estimatedValue, 0);
  const weightedValue = activePipelineLeads.reduce(
    (s, l) => s + (l.estimatedValue * l.probability) / 100,
    0
  );
  const wonLeads = leads.filter((l) => l.stage === 'closed_won');
  const closedLeads = leads.filter((l) =>
    ['closed_won', 'closed_lost'].includes(l.stage)
  );
  const winRate = closedLeads.length > 0
    ? Math.round((wonLeads.length / closedLeads.length) * 100)
    : 0;

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#0A1628' }}>
              Sales CRM Pipeline
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Manage and track leads across all pipeline stages
            </p>
          </div>
          <button
            onClick={() => setNoticeMessage('Adding new leads manually isn\'t built yet — this dashboard currently shows sample pipeline data.')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-opacity hover:opacity-90"
            style={{ background: '#FFD700', color: '#0A1628' }}
          >
            + Add Lead
          </button>
        </div>

        {/* Summary Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              label: 'Total Pipeline',
              value: `$${(totalPipeline / 1000).toFixed(0)}k`,
              icon: DollarSign,
              color: '#00B4D8',
              bg: '#f0f9ff',
            },
            {
              label: 'Weighted Value',
              value: `$${(weightedValue / 1000).toFixed(0)}k`,
              icon: TrendingUp,
              color: '#8b5cf6',
              bg: '#f5f3ff',
            },
            {
              label: 'Win Rate',
              value: `${winRate}%`,
              icon: Award,
              color: '#10b981',
              bg: '#f0fdf4',
            },
            {
              label: 'Active Leads',
              value: String(activePipelineLeads.length),
              icon: Users,
              color: '#f59e0b',
              bg: '#fffbeb',
            },
          ].map((metric) => {
            const Icon = metric.icon;
            return (
              <div
                key={metric.label}
                className="rounded-xl border border-gray-200 p-4 flex items-center gap-3 bg-white shadow-sm"
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: metric.bg }}
                >
                  <Icon size={18} style={{ color: metric.color }} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">{metric.label}</p>
                  <p className="text-xl font-bold" style={{ color: '#0A1628' }}>
                    {metric.value}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Kanban Board */}
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-4" style={{ minWidth: `${stages.length * 220}px` }}>
            {stages.map((stage) => {
              const stageLeads = leadsByStage[stage.key];
              const stageValue = stageLeads.reduce((s, l) => s + l.estimatedValue, 0);
              return (
                <div
                  key={stage.key}
                  className="flex flex-col rounded-xl border border-gray-200 overflow-hidden"
                  style={{ width: '220px', minWidth: '220px', background: '#f9fafb' }}
                >
                  {/* Column header */}
                  <div
                    className="px-3 py-2.5 flex items-center justify-between"
                    style={{ background: stage.headerBg }}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ background: stage.color }}
                      />
                      <span className="text-xs font-semibold" style={{ color: '#0A1628' }}>
                        {stage.label}
                      </span>
                    </div>
                    <span
                      className="text-xs font-bold px-1.5 py-0.5 rounded-full text-white"
                      style={{ background: stage.color }}
                    >
                      {stageLeads.length}
                    </span>
                  </div>

                  {/* Stage value */}
                  {stageLeads.length > 0 && (
                    <div
                      className="px-3 py-1.5 text-xs font-medium border-b border-gray-200"
                      style={{ color: stage.color }}
                    >
                      ${stageValue.toLocaleString()} pipeline
                    </div>
                  )}

                  {/* Cards */}
                  <div className="flex-1 p-2 space-y-2 overflow-y-auto" style={{ maxHeight: '520px' }}>
                    {stageLeads.length === 0 ? (
                      <div className="text-center py-8 text-gray-400 text-xs">
                        No leads
                      </div>
                    ) : (
                      stageLeads.map((lead) => (
                        <LeadCard key={lead.id} lead={lead} />
                      ))
                    )}
                  </div>

                  {/* Drop zone indicator */}
                  <div
                    className="h-10 mx-2 mb-2 border-2 border-dashed rounded-lg flex items-center justify-center text-xs text-gray-300"
                    style={{ borderColor: '#d1d5db' }}
                  >
                    + Drop here
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-6 text-xs text-gray-500 flex-wrap">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-1 rounded" style={{ background: '#00B4D8' }} />
            <span>Active lead card</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-1 rounded" style={{ background: '#ef4444' }} />
            <span>Stale &gt; 7 days</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-1 rounded" style={{ background: '#10b981' }} />
            <span>High probability (75%+)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-1 rounded" style={{ background: '#f59e0b' }} />
            <span>Medium probability (50–74%)</span>
          </div>
        </div>
      </div>

      {/* Lightweight notice for not-yet-built actions */}
      {noticeMessage && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <p className="text-sm text-gray-600 mb-5">{noticeMessage}</p>
            <button
              onClick={() => setNoticeMessage(null)}
              className="w-full py-2.5 rounded-xl font-semibold text-sm text-white"
              style={{ background: '#0A1628' }}
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
