'use client';

import { useState } from 'react';
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
import { bookings, contacts, leads, getContactName } from '@/lib/data/crm';
import { format } from 'date-fns';

// ─── Mock revenue data ───────────────────────────────────────────────────────
const revenueData = [
  { month: 'Jun', revenue: 42000 },
  { month: 'Jul', revenue: 58000 },
  { month: 'Aug', revenue: 71000 },
  { month: 'Sep', revenue: 53000 },
  { month: 'Oct', revenue: 65000 },
  { month: 'Nov', revenue: 48000 },
  { month: 'Dec', revenue: 92000 },
  { month: 'Jan', revenue: 38000 },
  { month: 'Feb', revenue: 55000 },
  { month: 'Mar', revenue: 67000 },
  { month: 'Apr', revenue: 74000 },
  { month: 'May', revenue: 89000 },
];

const destinationData = [
  { name: 'Maldives', value: 32, color: '#00B4D8' },
  { name: 'Japan', value: 22, color: '#FFD700' },
  { name: 'Bali', value: 18, color: '#10b981' },
  { name: 'Europe', value: 15, color: '#8b5cf6' },
  { name: 'Other', value: 13, color: '#6b7280' },
];

// ─── Status helpers ──────────────────────────────────────────────────────────
const statusConfig: Record<string, { label: string; bg: string; color: string }> = {
  inquiry:      { label: 'Inquiry',      bg: '#f3f4f6', color: '#374151' },
  quoted:       { label: 'Quoted',       bg: '#fef3c7', color: '#92400e' },
  confirmed:    { label: 'Confirmed',    bg: '#d1fae5', color: '#065f46' },
  deposit_paid: { label: 'Deposit Paid', bg: '#dbeafe', color: '#1e40af' },
  fully_paid:   { label: 'Fully Paid',   bg: '#f0fdf4', color: '#14532d' },
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
  change: number;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
}

function KPICard({ title, value, change, icon: Icon, iconBg, iconColor }: KPICardProps) {
  const positive = change >= 0;
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-start gap-4 shadow-sm">
      <div className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center" style={{ background: iconBg }}>
        <Icon size={22} style={{ color: iconColor }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{title}</p>
        <p className="text-2xl font-bold mt-0.5" style={{ color: '#0A1628' }}>{value}</p>
        <div className="flex items-center gap-1 mt-1">
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
        </div>
      </div>
    </div>
  );
}

// ─── Main Dashboard ──────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [approvalResults, setApprovalResults] = useState<Record<string, 'approved' | 'declined'>>({});

  // Derived data
  const pendingApproval = bookings.filter(
    (b) => b.requiresOwnerApproval && (b.status === 'quoted' || b.status === 'confirmed')
  );
  const recentBookings = [...bookings]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const totalRevenue = bookings
    .filter((b) => ['confirmed', 'deposit_paid', 'fully_paid'].includes(b.status))
    .reduce((sum, b) => sum + b.totalAmount, 0);

  const activeBookings = bookings.filter((b) =>
    ['confirmed', 'deposit_paid', 'fully_paid'].includes(b.status)
  ).length;

  const newLeads = leads.filter((l) => l.stage === 'new' || l.stage === 'contacted').length;
  const wonLeads = leads.filter((l) => l.stage === 'closed_won').length;
  const totalClosed = leads.filter((l) =>
    ['closed_won', 'closed_lost'].includes(l.stage)
  ).length;
  const conversionRate = totalClosed > 0 ? Math.round((wonLeads / totalClosed) * 100) : 0;

  const handleApproval = (bookingId: string, approved: boolean) => {
    setApprovalResults((prev) => ({
      ...prev,
      [bookingId]: approved ? 'approved' : 'declined',
    }));
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
              {format(new Date(), 'EEEE, MMMM d, yyyy')} — Here's your business overview
            </p>
          </div>
          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            {[
              { label: 'New Booking', icon: BookOpen, color: '#0A1628' },
              { label: 'New Contact', icon: UserPlus, color: '#0A1628' },
              { label: 'Send Email', icon: Mail, color: '#0A1628' },
              { label: 'Add Lead', icon: Plus, color: '#FFD700', text: '#0A1628' },
            ].map((action) => {
              const Icon = action.icon;
              const isGold = action.color === '#FFD700';
              return (
                <button
                  key={action.label}
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
            value={`$${(89000).toLocaleString()}`}
            change={20}
            icon={DollarSign}
            iconBg="#fef9c3"
            iconColor="#ca8a04"
          />
          <KPICard
            title="Active Bookings"
            value={String(activeBookings)}
            change={8}
            icon={BookOpen}
            iconBg="#dbeafe"
            iconColor="#1d4ed8"
          />
          <KPICard
            title="New Leads"
            value={String(newLeads)}
            change={-5}
            icon={Users}
            iconBg="#f3e8ff"
            iconColor="#7c3aed"
          />
          <KPICard
            title="Conversion Rate"
            value={`${conversionRate}%`}
            change={12}
            icon={Target}
            iconBg="#dcfce7"
            iconColor="#16a34a"
          />
        </div>

        {/* Pending Approvals — Gold Alert */}
        {pendingApproval.filter((b) => !approvalResults[b.id]).length > 0 && (
          <div
            className="rounded-xl border-2 p-5"
            style={{ borderColor: '#FFD700', background: '#fffbeb' }}
          >
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle size={20} style={{ color: '#FFD700' }} />
              <h2 className="text-base font-bold" style={{ color: '#0A1628' }}>
                Pending Owner Approval ({pendingApproval.filter((b) => !approvalResults[b.id]).length})
              </h2>
              <span className="text-xs text-gray-500 ml-auto">
                These bookings cannot proceed until you approve
              </span>
            </div>
            <div className="space-y-3">
              {pendingApproval
                .filter((b) => !approvalResults[b.id])
                .map((booking) => (
                  <div
                    key={booking.id}
                    className="flex items-center gap-4 bg-white rounded-lg border border-yellow-200 p-4"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm" style={{ color: '#0A1628' }}>
                          {getContactName(booking.contactId)}
                        </span>
                        <StatusBadge status={booking.status} />
                      </div>
                      <p className="text-xs text-gray-600 mt-0.5">
                        {booking.packageName} → {booking.destination}
                      </p>
                      <p className="text-xs text-gray-400">
                        {format(new Date(booking.departureDate), 'MMM d, yyyy')} •{' '}
                        {booking.travelers.adults + booking.travelers.children} travelers
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-lg" style={{ color: '#0A1628' }}>
                        ${booking.totalAmount.toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleApproval(booking.id, true)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-semibold transition-opacity hover:opacity-90"
                        style={{ background: '#FFD700', color: '#0A1628' }}
                      >
                        <CheckCircle size={14} />
                        Approve
                      </button>
                      <button
                        onClick={() => handleApproval(booking.id, false)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-semibold border transition-colors hover:bg-red-50"
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

          {/* Destination Pie */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <h3 className="font-semibold text-sm mb-4" style={{ color: '#0A1628' }}>
              Top Destinations
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={destinationData}
                  cx="50%"
                  cy="45%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {destinationData.map((entry, i) => (
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
                  formatter={(v) => [`${v as number}%`, "Share"]}
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
                  <th className="px-5 py-3 text-left font-semibold">Package</th>
                  <th className="px-5 py-3 text-left font-semibold">Destination</th>
                  <th className="px-5 py-3 text-left font-semibold">Departure</th>
                  <th className="px-5 py-3 text-right font-semibold">Amount</th>
                  <th className="px-5 py-3 text-left font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.map((b, idx) => (
                  <tr
                    key={b.id}
                    className="border-t border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-5 py-3.5 font-medium" style={{ color: '#0A1628' }}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                          style={{ background: '#0A1628', color: '#FFD700' }}
                        >
                          {getContactName(b.contactId).charAt(0)}
                        </div>
                        {getContactName(b.contactId)}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-gray-600 max-w-[180px] truncate">
                      {b.packageName}
                    </td>
                    <td className="px-5 py-3.5 text-gray-600">{b.destination}</td>
                    <td className="px-5 py-3.5 text-gray-500">
                      {format(new Date(b.departureDate), 'MMM d, yyyy')}
                    </td>
                    <td className="px-5 py-3.5 text-right font-semibold" style={{ color: '#0A1628' }}>
                      ${b.totalAmount.toLocaleString()}
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={b.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
