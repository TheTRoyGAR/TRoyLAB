'use client';

import { useMemo, useState, useEffect, useCallback } from 'react';
import { TrendingUp, DollarSign, Award, Users, X, Check } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { formatDistanceToNow, differenceInDays } from 'date-fns';

// Real types (matches /api/leads and /api/contacts, backed by real
// Postgres tables - no fabricated demo pipeline data).
export type LeadStage =
  | 'new' | 'contacted' | 'qualified' | 'proposal_sent'
  | 'negotiating' | 'closed_won' | 'closed_lost';

export interface Lead {
  id: string;
  contactId: string;
  contactName: string;
  contactEmail: string;
  packageInterest: string;
  estimatedValue: number;
  stage: LeadStage;
  probability: number;
  expectedClose: string | null;
  lastActivity: string;
  createdAt: string;
}

interface ContactOption {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

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
  const days = getDaysInStage(lead.lastActivity);
  const initials = lead.contactName.split(' ').map((n) => n[0]).join('').slice(0, 2);
  const stale = days > 7;

  return (
    <div
      className="bg-white rounded-lg border p-3 shadow-sm hover:shadow-md transition-shadow"
      style={{ borderColor: stale ? '#fca5a5' : '#e5e7eb', borderLeft: '3px solid #00B4D8' }}
    >
      <div className="flex items-start gap-2 mb-2">
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
          style={{ background: '#0A1628', color: '#FFD700' }}
        >
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-gray-900 truncate">{lead.contactName}</p>
          <p className="text-xs text-gray-500 truncate">{lead.packageInterest}</p>
        </div>
      </div>

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

// ─── Add Lead form ──────────────────────────────────────────────────────────
const leadSchema = z.object({
  contactId: z.string().min(1, 'Select a contact'),
  packageInterest: z.string().min(1, 'Required'),
  estimatedValue: z.number().min(0, 'Must be 0 or more'),
  stage: z.enum(['new', 'contacted', 'qualified', 'proposal_sent', 'negotiating', 'closed_won', 'closed_lost']),
  probability: z.number().min(0).max(100),
});
type LeadFormData = z.infer<typeof leadSchema>;

function AddLeadPanel({
  open,
  onClose,
  onSaved,
  contactOptions,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  contactOptions: ContactOption[];
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema),
    defaultValues: { stage: 'new', probability: 20 },
  });
  const [saveError, setSaveError] = useState<string | null>(null);

  const onSubmit = async (data: LeadFormData) => {
    setSaveError(null);
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!json.success) {
        setSaveError(json.error ?? 'Failed to save lead.');
        return;
      }
      reset();
      onSaved();
      onClose();
    } catch {
      setSaveError('Failed to save lead — check your connection and try again.');
    }
  };

  if (!open) return null;

  const fieldCls =
    'w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent';
  const labelCls = 'block text-xs font-semibold text-gray-600 mb-1';

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
      <div
        className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 overflow-y-auto flex flex-col"
        style={{ borderLeft: '3px solid #00B4D8' }}
      >
        <div
          className="flex items-center justify-between px-6 py-4 border-b border-gray-100"
          style={{ background: '#0A1628' }}
        >
          <h2 className="font-bold text-white">Add New Lead</h2>
          <button onClick={onClose}>
            <X size={20} className="text-gray-400 hover:text-white" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 p-6 space-y-4">
          <div>
            <label className={labelCls}>Contact *</label>
            <select className={fieldCls} {...register('contactId')}>
              <option value="">Select a contact…</option>
              {contactOptions.map((c) => (
                <option key={c.id} value={c.id}>{c.firstName} {c.lastName} ({c.email})</option>
              ))}
            </select>
            {errors.contactId && <p className="text-red-500 text-xs mt-1">{errors.contactId.message}</p>}
          </div>

          <div>
            <label className={labelCls}>Package / Interest *</label>
            <input className={fieldCls} {...register('packageInterest')} placeholder="e.g. Gallipoli & Troy Remembrance Journey" />
            {errors.packageInterest && <p className="text-red-500 text-xs mt-1">{errors.packageInterest.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Estimated Value ($) *</label>
              <input type="number" className={fieldCls} {...register('estimatedValue', { valueAsNumber: true })} />
              {errors.estimatedValue && <p className="text-red-500 text-xs mt-1">{errors.estimatedValue.message}</p>}
            </div>
            <div>
              <label className={labelCls}>Probability (%)</label>
              <input type="number" min={0} max={100} className={fieldCls} {...register('probability', { valueAsNumber: true })} />
            </div>
          </div>

          <div>
            <label className={labelCls}>Stage</label>
            <select className={fieldCls} {...register('stage')}>
              {stages.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
            </select>
          </div>

          {saveError && <p className="text-red-500 text-xs">{saveError}</p>}

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 rounded-lg font-semibold text-sm transition-opacity hover:opacity-90 flex items-center justify-center gap-2 disabled:opacity-50"
              style={{ background: '#FFD700', color: '#0A1628' }}
            >
              <Check size={16} />
              {isSubmitting ? 'Saving…' : 'Add Lead'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-lg font-semibold text-sm border border-gray-300 text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

// ─── CRM Page ─────────────────────────────────────────────────────────────
export default function CRMPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [contactOptions, setContactOptions] = useState<ContactOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const [leadsRes, contactsRes] = await Promise.all([
        fetch('/api/leads'),
        fetch('/api/contacts'),
      ]);
      const leadsJson = await leadsRes.json();
      const contactsJson = await contactsRes.json();
      if (leadsJson.success) setLeads(leadsJson.leads);
      else setLoadError(leadsJson.error ?? 'Failed to load leads.');
      if (contactsJson.success) setContactOptions(contactsJson.contacts);
    } catch {
      setLoadError('Failed to load pipeline — check your connection.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const leadsByStage = useMemo(() => {
    const map: Record<LeadStage, Lead[]> = {
      new: [], contacted: [], qualified: [], proposal_sent: [],
      negotiating: [], closed_won: [], closed_lost: [],
    };
    leads.forEach((l) => map[l.stage].push(l));
    return map;
  }, [leads]);

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
              {loading ? 'Loading…' : loadError ?? 'Manage and track leads across all pipeline stages'}
            </p>
          </div>
          <button
            onClick={() => setPanelOpen(true)}
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

                  {stageLeads.length > 0 && (
                    <div
                      className="px-3 py-1.5 text-xs font-medium border-b border-gray-200"
                      style={{ color: stage.color }}
                    >
                      ${stageValue.toLocaleString()} pipeline
                    </div>
                  )}

                  <div className="flex-1 p-2 space-y-2 overflow-y-auto" style={{ maxHeight: '520px' }}>
                    {stageLeads.length === 0 ? (
                      <div className="text-center py-8 text-gray-400 text-xs">
                        {loading ? 'Loading…' : 'No leads'}
                      </div>
                    ) : (
                      stageLeads.map((lead) => (
                        <LeadCard key={lead.id} lead={lead} />
                      ))
                    )}
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

      <AddLeadPanel
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
        onSaved={load}
        contactOptions={contactOptions}
      />
    </DashboardLayout>
  );
}
