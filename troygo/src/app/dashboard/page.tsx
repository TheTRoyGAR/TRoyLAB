'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  BookOpen,
  Users,
  Target,
  Plus,
  CheckCircle,
  XCircle,
  AlertTriangle,
  BarChart3,
  Mail,
  UserPlus,
} from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { format, subMonths, startOfMonth } from 'date-fns';

// Real types (matches /api/bookings and /api/leads - real Postgres data,
// no fabricated demo bookings/leads/revenue).
interface RealBooking {
  bookingRef: string;
  status: string;
  requiresOwnerApproval: boolean;
  type: string;
  itemId: string;
  travelers: { firstName?: string; lastName?: string }[];
  totalAmount: number;
  leadTravelerName: string;
  leadTravelerEmail: string;
  createdAt: string;
}

interface RealLead {
  id: string;
  stage: string;
}

const CONFIRMED_STATUSES = ['confirmed', 'deposit_paid', 'fully_paid'];
const TYPE_COLORS: Record<string, string> = {
  flight: '#00B4D8',
  hotel: '#FFD700',
  package: '#10b981',
  cruise: '#8b5cf6',
  car: '#f97316',
};
const FALLBACK_COLORS = ['#00B4D8', '#FFD700', '#10b981', '#8b5cf6', '#f97316', '#6b7280'];

// ─── Status helpers ──────────────────────────────────────────────────────────
const statusConfig: Record<string, { label: string; bg: string; color: string }> = {
  inquiry:      { label: 'Inquiry',      bg: '#f3f4f6', color: '#374151' },
  quoted:       { label: 'Quoted',       bg: '#fef3c7', color: '#92400e' },
  confirmed:    { label: 'Confirmed',    bg: '#d1fae5', color: '#065f46' },
  deposit_paid: { label: 'Deposit Paid', bg: '#dbeafe', color: '#1e40af' },
  fully_paid:   { label: 'Fully Paid',   bg: '#f0fdf4', color: '#14532d' },
  declined:     { label: 'Declined',     bg: '#fee2e2', color: '#991b1b' },
  cancelled:    { label: 'Cancelled',    bg: '#fee2e2', color: '#991b1b' },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = statusConfig[status] ?? { label: status, bg: '#f3f4f6', color: '#374151' };
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold"
      style={{ background: cfg.bg, color: cfg.color }}
    >
      {cfg.label}
    </span>
  );
}

// ─── KPI Card ────────────────────────────────────────────────────────────────
interface KPICardProps {
  title: string;
  value: string;
  change: number | null;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
}

function KPICard({ title, value, change, icon: Icon, iconBg, iconColor }: KPICardProps) {
  const positive = (change ?? 0) >= 0;
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-start gap-4 shadow-sm">
      <div className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center" style={{ background: iconBg }}>
        <Icon size={22} style={{ color: iconColor }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{title}</p>
        <p className="text-2xl font-bold mt-0.5" style={{ color: '#0A1628' }}>{value}</p>
        <div className="flex items-center gap-1 mt-1">
          {change == null ? (
            <span className="text-xs text-gray-400">no prior month to compare</span>
          ) : (
            <>
              {positive ? (
                <TrendingUp size={13} className="text-emerald-500" />
              ) : (
                <TrendingDown size={13} className="text-red-500" />
              )}
              <span
                className="text-xs font-semibold"
                style={{ color: positive ? '#10b981' : '#ef4444' }}
              >
                {positive ? '+' : ''}{change}%
              </span>
              <span className="text-xs text-gray-400">vs last month</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Dashboard ──────────────────────────────────────────────────────────
export default function DashboardPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<RealBooking[]>([]);
  const [leads, setLeads] = useState<RealLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [approvalPending, setApprovalPending] = useState<Set<string>>(new Set());

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const [bookingsRes, leadsRes] = await Promise.all([
        fetch('/api/bookings'),
        fetch('/api/leads'),
      ]);
      const bookingsJson = await bookingsRes.json();
      const leadsJson = await leadsRes.json();
      if (bookingsJson.success) setBookings(bookingsJson.bookings);
      else setLoadError(bookingsJson.error ?? 'Failed to load bookings.');
      if (leadsJson.success) setLeads(leadsJson.leads);
    } catch {
      setLoadError('Failed to load dashboard data — check your connection.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Derived data - all computed from real fetched bookings/leads.
  const pendingApproval = bookings.filter(
    (b) => b.requiresOwnerApproval && b.status === 'inquiry'
  );
  const recentBookings = [...bookings]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const totalRevenue = bookings
    .filter((b) => CONFIRMED_STATUSES.includes(b.status))
    .reduce((sum, b) => sum + b.totalAmount, 0);

  const activeBookings = bookings.filter((b) => CONFIRMED_STATUSES.includes(b.status)).length;

  const newLeads = leads.filter((l) => l.stage === 'new' || l.stage === 'contacted').length;
  const wonLeads = leads.filter((l) => l.stage === 'closed_won').length;
  const totalClosed = leads.filter((l) =>
    ['closed_won', 'closed_lost'].includes(l.stage)
  ).length;
  const conversionRate = totalClosed > 0 ? Math.round((wonLeads / totalClosed) * 100) : 0;

  // Real revenue by month - last 12 months, confirmed+ bookings only.
  const revenueData = useMemo(() => {
    const months: { key: string; month: string; revenue: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = startOfMonth(subMonths(new Date(), i));
      months.push({ key: format(d, 'yyyy-MM'), month: format(d, 'MMM'), revenue: 0 });
    }
    const byKey = Object.fromEntries(months.map((m) => [m.key, m]));
    bookings
      .filter((b) => CONFIRMED_STATUSES.includes(b.status))
      .forEach((b) => {
        const key = format(new Date(b.createdAt), 'yyyy-MM');
        if (byKey[key]) byKey[key].revenue += b.totalAmount;
      });
    return months;
  }, [bookings]);

  const thisMonthRevenue = revenueData[revenueData.length - 1]?.revenue ?? 0;
  const lastMonthRevenue = revenueData[revenueData.length - 2]?.revenue ?? 0;
  const revenueChange = lastMonthRevenue > 0
    ? Math.round(((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100)
    : null;

  // Real bookings-by-type breakdown - replaces the old fake "Top Destinations"
  // pie, since destination isn't a field the real booking flow captures yet.
  const typeData = useMemo(() => {
    const counts: Record<string, number> = {};
    bookings.forEach((b) => { counts[b.type] = (counts[b.type] ?? 0) + 1; });
    return Object.entries(counts).map(([name, value], i) => ({
      name,
      value,
      color: TYPE_COLORS[name] ?? FALLBACK_COLORS[i % FALLBACK_COLORS.length],
    }));
  }, [bookings]);

  const handleApproval = async (bookingRef: string, approved: boolean) => {
    setApprovalPending((prev) => new Set(prev).add(bookingRef));
    try {
      const res = await fetch('/api/bookings/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: bookingRef, ownerApproved: approved }),
      });
      const json = await res.json();
      if (json.success) {
        await load();
      }
    } finally {
      setApprovalPending((prev) => { const next = new Set(prev); next.delete(bookingRef); return next; });
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6 max-w-[1600px]">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#0A1628' }}>
              Good morning, Troy 👋
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {format(new Date(), 'EEEE, MMMM d, yyyy')} — {loading ? 'Loading…' : loadError ?? "Here's your business overview"}
            </p>
          </div>
          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            {[
              { label: 'New Booking', icon: BookOpen, color: '#0A1628', href: '/dashboard/bookings' },
              { label: 'New Contact', icon: UserPlus, color: '#0A1628', href: '/dashboard/contacts' },
              { label: 'Send Email', icon: Mail, color: '#0A1628', href: '/dashboard/emails' },
              { label: 'Add Lead', icon: Plus, color: '#FFD700', text: '#0A1628', href: '/dashboard/crm' },
            ].map((action) => {
              const Icon = action.icon;
              const isGold = action.color === '#FFD700';
              return (
                <button
                  key={action.label}
                  onClick={() => router.push(action.href)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-opacity hover:opacity-90"
                  style={{
                    background: action.color,
                    color: isGold ? '#0A1628' : '#ffffff',
                    border: isGold ? 'none' : '1px solid #0A1628',
                  }}
                >
                  <Icon size={14} />
                  {action.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Revenue (This Month)"
            value={`$${thisMonthRevenue.toLocaleString()}`}
            change={revenueChange}
            icon={DollarSign}
            iconBg="#fef9c3"
            iconColor="#ca8a04"
          />
          <KPICard
            title="Active Bookings"
            value={String(activeBookings)}
            change={null}
            icon={BookOpen}
            iconBg="#dbeafe"
            iconColor="#1d4ed8"
          />
          <KPICard
            title="New Leads"
            value={String(newLeads)}
            change={null}
            icon={Users}
            iconBg="#f3e8ff"
            iconColor="#7c3aed"
          />
          <KPICard
            title="Conversion Rate"
            value={`${conversionRate}%`}
            change={null}
            icon={Target}
            iconBg="#dcfce7"
            iconColor="#16a34a"
          />
        </div>

        {/* Pending Approvals — Gold Alert */}
        {pendingApproval.length > 0 && (
          <div
            className="rounded-xl border-2 p-5"
            style={{ borderColor: '#FFD700', background: '#fffbeb' }}
          >
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle size={20} style={{ color: '#FFD700' }} />
              <h2 className="text-base font-bold" style={{ color: '#0A1628' }}>
                Pending Owner Approval ({pendingApproval.length})
              </h2>
              <span className="text-xs text-gray-500 ml-auto">
                These bookings cannot proceed until you approve
              </span>
            </div>
            <div className="space-y-3">
              {pendingApproval.map((booking) => (
                <div
                  key={booking.bookingRef}
                  className="flex items-center gap-4 bg-white rounded-lg border border-yellow-200 p-4"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm" style={{ color: '#0A1628' }}>
                        {booking.leadTravelerName}
                      </span>
                      <StatusBadge status={booking.status} />
                    </div>
                    <p className="text-xs text-gray-600 mt-0.5">
                      {booking.type} → {booking.itemId}
                    </p>
                    <p className="text-xs text-gray-400">
                      {format(new Date(booking.createdAt), 'MMM d, yyyy')} • {booking.bookingRef}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-lg" style={{ color: '#0A1628' }}>
                      ${booking.totalAmount.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleApproval(booking.bookingRef, true)}
                      disabled={approvalPending.has(booking.bookingRef)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50"
                      style={{ background: '#FFD700', color: '#0A1628' }}
                    >
                      <CheckCircle size={14} />
                      Approve
                    </button>
                    <button
                      onClick={() => handleApproval(booking.bookingRef, false)}
                      disabled={approvalPending.has(booking.bookingRef)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-semibold border transition-colors hover:bg-red-50 disabled:opacity-50"
                      style={{ borderColor: '#ef4444', color: '#ef4444' }}
                    >
                      <XCircle size={14} />
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue Line Chart */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-sm" style={{ color: '#0A1628' }}>
                  Revenue — Last 12 Months
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">Total: ${totalRevenue.toLocaleString()}</p>
              </div>
              <BarChart3 size={18} className="text-gray-300" />
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: '#9ca3af' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#9ca3af' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(v) => [`$${(v as number).toLocaleString()}`, "Revenue"]}
                  contentStyle={{
                    background: '#0A1628',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#00B4D8"
                  strokeWidth={2.5}
                  dot={{ fill: '#00B4D8', r: 3 }}
                  activeDot={{ r: 5, fill: '#FFD700' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Bookings by Type */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <h3 className="font-semibold text-sm mb-4" style={{ color: '#0A1628' }}>
              Bookings by Type
            </h3>
            {typeData.length === 0 ? (
              <div className="flex items-center justify-center h-[220px] text-xs text-gray-400">
                {loading ? 'Loading…' : 'No bookings yet'}
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={typeData}
                    cx="50%"
                    cy="45%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {typeData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    formatter={(value) => (
                      <span style={{ fontSize: '11px', color: '#374151' }}>{value}</span>
                    )}
                  />
                  <Tooltip
                    formatter={(v) => [`${v} booking${(v as number) !== 1 ? 's' : ''}`, "Count"]}
                    contentStyle={{
                      background: '#0A1628',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-sm" style={{ color: '#0A1628' }}>
              Recent Bookings
            </h3>
            <a
              href="/dashboard/bookings"
              className="text-xs font-medium"
              style={{ color: '#00B4D8' }}
            >
              View all →
            </a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                  <th className="px-5 py-3 text-left font-semibold">Client</th>
                  <th className="px-5 py-3 text-left font-semibold">Type</th>
                  <th className="px-5 py-3 text-left font-semibold">Item</th>
                  <th className="px-5 py-3 text-left font-semibold">Created</th>
                  <th className="px-5 py-3 text-right font-semibold">Amount</th>
                  <th className="px-5 py-3 text-left font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.map((b) => (
                  <tr
                    key={b.bookingRef}
                    className="border-t border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-5 py-3.5 font-medium" style={{ color: '#0A1628' }}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                          style={{ background: '#0A1628', color: '#FFD700' }}
                        >
                          {b.leadTravelerName.charAt(0)}
                        </div>
                        {b.leadTravelerName}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-gray-600 capitalize">{b.type}</td>
                    <td className="px-5 py-3.5 text-gray-600 max-w-[180px] truncate">
                      {b.itemId}
                    </td>
                    <td className="px-5 py-3.5 text-gray-500">
                      {format(new Date(b.createdAt), 'MMM d, yyyy')}
                    </td>
                    <td className="px-5 py-3.5 text-right font-semibold" style={{ color: '#0A1628' }}>
                      ${b.totalAmount.toLocaleString()}
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={b.status} />
                    </td>
                  </tr>
                ))}
                {recentBookings.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-gray-400 text-sm">
                      {loading ? 'Loading…' : 'No bookings yet'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
