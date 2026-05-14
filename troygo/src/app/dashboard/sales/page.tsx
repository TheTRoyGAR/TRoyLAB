'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Target, Percent, Clock } from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { format, formatDistanceToNow } from 'date-fns';

// ─── Mock data ───────────────────────────────────────────────────────────────
const monthlyData = [
  { month: 'Dec', target: 70000, actual: 92000 },
  { month: 'Jan', target: 55000, actual: 38000 },
  { month: 'Feb', target: 60000, actual: 55000 },
  { month: 'Mar', target: 65000, actual: 67000 },
  { month: 'Apr', target: 70000, actual: 74000 },
  { month: 'May', target: 75000, actual: 89000 },
];

const destinationSalesData = [
  { destination: 'Maldives',            revenue: 132000 },
  { destination: 'Japan',               revenue: 95500  },
  { destination: 'Bali, Indonesia',     revenue: 72000  },
  { destination: 'Europe Multi-City',   revenue: 65000  },
  { destination: 'Mediterranean',       revenue: 58000  },
  { destination: 'Africa Safari',       revenue: 44000  },
  { destination: 'Caribbean',           revenue: 38000  },
  { destination: 'South America',       revenue: 29000  },
];

const funnelStages = [
  { stage: 'New Leads',     count: 42, percent: 100, color: '#6b7280' },
  { stage: 'Contacted',     count: 35, percent: 83,  color: '#3b82f6' },
  { stage: 'Qualified',     count: 22, percent: 52,  color: '#8b5cf6' },
  { stage: 'Proposal Sent', count: 15, percent: 36,  color: '#f59e0b' },
  { stage: 'Negotiating',   count: 9,  percent: 21,  color: '#ef4444' },
  { stage: 'Closed Won',    count: 7,  percent: 17,  color: '#10b981' },
];

const packagePerformance = [
  { category: 'Luxury Resorts',      revenue: 195000, bookings: 12, avgDeal: 16250 },
  { category: 'Adventure Travel',    revenue: 87000,  bookings: 18, avgDeal: 4833  },
  { category: 'Cultural Tours',      revenue: 76000,  bookings: 14, avgDeal: 5429  },
  { category: 'Corporate Groups',    revenue: 165000, bookings: 4,  avgDeal: 41250 },
  { category: 'Honeymoon Packages',  revenue: 112000, bookings: 8,  avgDeal: 14000 },
  { category: 'Family Holidays',     revenue: 95000,  bookings: 11, avgDeal: 8636  },
];

const recentActivity = [
  { id: 1, type: 'payment',   text: 'Full payment received from Chen Wei',       time: '2026-05-14T09:15:00Z', amount: 32000, color: '#10b981' },
  { id: 2, type: 'quote',     text: 'Quote sent for F1 Monaco Package',           time: '2026-05-13T15:30:00Z', amount: 22500, color: '#f59e0b' },
  { id: 3, type: 'lead',      text: 'New VIP lead: Private yacht charter',        time: '2026-05-13T11:00:00Z', amount: 85000, color: '#8b5cf6' },
  { id: 4, type: 'booking',   text: 'Booking confirmed: Aman Tokyo wellness',     time: '2026-05-12T14:20:00Z', amount: 28000, color: '#00B4D8' },
  { id: 5, type: 'payment',   text: 'Deposit received from Aisha Al-Rashid',      time: '2026-05-12T10:00:00Z', amount: 7100,  color: '#10b981' },
  { id: 6, type: 'lead',      text: 'Corporate inquiry: 40-pax incentive travel', time: '2026-05-11T16:45:00Z', amount: 120000,color: '#8b5cf6' },
  { id: 7, type: 'approval',  text: 'Sale awaiting Troy approval: Maldives x2',   time: '2026-05-10T13:00:00Z', amount: 18500, color: '#FFD700' },
  { id: 8, type: 'lead',      text: 'New inquiry: Scandinavia Northern Lights',   time: '2026-05-09T09:30:00Z', amount: 7200,  color: '#8b5cf6' },
];

const activityTypeLabel: Record<string, string> = {
  payment:  'Payment',
  quote:    'Quote Sent',
  lead:     'New Lead',
  booking:  'Booking',
  approval: 'Needs Approval',
};

// ─── KPI mini-card ────────────────────────────────────────────────────────────
function MiniKPI({
  label,
  value,
  sub,
  icon: Icon,
  iconColor,
  iconBg,
  positive,
}: {
  label: string;
  value: string;
  sub: string;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  positive: boolean;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex items-start gap-3">
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: iconBg }}
      >
        <Icon size={18} style={{ color: iconColor }} />
      </div>
      <div>
        <p className="text-xs text-gray-500 font-medium">{label}</p>
        <p className="text-xl font-bold" style={{ color: '#0A1628' }}>{value}</p>
        <div className="flex items-center gap-1 mt-0.5">
          {positive ? (
            <TrendingUp size={11} className="text-emerald-500" />
          ) : (
            <TrendingDown size={11} className="text-red-500" />
          )}
          <span className="text-xs" style={{ color: positive ? '#10b981' : '#ef4444' }}>
            {sub}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Custom tooltip ───────────────────────────────────────────────────────────
const ChartTooltip = ({
  active, payload, label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-lg px-3 py-2 text-xs shadow-lg"
      style={{ background: '#0A1628', color: '#fff', border: '1px solid #152D55' }}
    >
      <p className="font-bold mb-1" style={{ color: '#FFD700' }}>{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: <strong>${p.value.toLocaleString()}</strong>
        </p>
      ))}
    </div>
  );
};

// ─── Main Sales Page ──────────────────────────────────────────────────────────
export default function SalesPage() {
  const totalActual = monthlyData.reduce((s, d) => s + d.actual, 0);
  const totalTarget = monthlyData.reduce((s, d) => s + d.target, 0);
  const overallConv = Math.round((funnelStages[5].count / funnelStages[0].count) * 100);

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6 max-w-[1400px]">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#0A1628' }}>
            Sales Pipeline & Analytics
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Revenue performance, conversion funnel, and deal tracking
          </p>
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MiniKPI
            label="YTD Revenue"
            value={`$${(totalActual / 1000).toFixed(0)}k`}
            sub={`+${Math.round(((totalActual - totalTarget) / totalTarget) * 100)}% vs target`}
            icon={DollarSign}
            iconColor="#ca8a04"
            iconBg="#fef9c3"
            positive
          />
          <MiniKPI
            label="Monthly Target"
            value="$75,000"
            sub="May target"
            icon={Target}
            iconColor="#16a34a"
            iconBg="#dcfce7"
            positive
          />
          <MiniKPI
            label="Conversion Rate"
            value={`${overallConv}%`}
            sub="+5% vs last quarter"
            icon={Percent}
            iconColor="#7c3aed"
            iconBg="#f5f3ff"
            positive
          />
          <MiniKPI
            label="Avg. Close Time"
            value="18 days"
            sub="-3 days vs prev"
            icon={Clock}
            iconColor="#0284c7"
            iconBg="#f0f9ff"
            positive
          />
        </div>

        {/* Revenue chart + Activity feed */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue Forecast Bar Chart */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-sm" style={{ color: '#0A1628' }}>
                  Monthly Revenue: Target vs Actual
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  ${totalActual.toLocaleString()} actual vs ${totalTarget.toLocaleString()} target
                </p>
              </div>
              <span
                className="text-xs px-2 py-1 rounded-full font-semibold"
                style={{ background: '#dcfce7', color: '#16a34a' }}
              >
                {Math.round(((totalActual / totalTarget) * 100) - 100)}% above target
              </span>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={monthlyData} barGap={4} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
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
                <Tooltip content={<ChartTooltip />} />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  formatter={(v) => <span style={{ fontSize: '11px', color: '#374151' }}>{v}</span>}
                />
                <Bar dataKey="target" name="Target" fill="#e5e7eb" radius={[4, 4, 0, 0]} />
                <Bar dataKey="actual" name="Actual" radius={[4, 4, 0, 0]}>
                  {monthlyData.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={entry.actual >= entry.target ? '#00B4D8' : '#f87171'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Activity Feed */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex flex-col">
            <h3 className="font-semibold text-sm mb-4" style={{ color: '#0A1628' }}>
              Recent Activity
            </h3>
            <div className="flex-1 space-y-3 overflow-y-auto" style={{ maxHeight: '280px' }}>
              {recentActivity.map((item) => (
                <div key={item.id} className="flex items-start gap-3">
                  <div
                    className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                    style={{ background: item.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-700 leading-snug">{item.text}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span
                        className="text-xs px-1.5 py-0.5 rounded font-medium"
                        style={{ background: `${item.color}22`, color: item.color }}
                      >
                        {activityTypeLabel[item.type]}
                      </span>
                      {item.amount > 0 && (
                        <span className="text-xs font-semibold" style={{ color: '#0A1628' }}>
                          ${item.amount.toLocaleString()}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {formatDistanceToNow(new Date(item.time), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Funnel + Destination sales */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Conversion Funnel */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <h3 className="font-semibold text-sm mb-5" style={{ color: '#0A1628' }}>
              Sales Conversion Funnel
            </h3>
            <div className="space-y-2">
              {funnelStages.map((stage, idx) => {
                const prevCount = idx > 0 ? funnelStages[idx - 1].count : stage.count;
                const dropRate = idx > 0 ? Math.round(((prevCount - stage.count) / prevCount) * 100) : 0;
                return (
                  <div key={stage.stage}>
                    {/* Stage row */}
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 w-28 text-right flex-shrink-0">
                        {stage.stage}
                      </span>
                      <div className="flex-1 relative">
                        <div
                          className="h-8 rounded-lg flex items-center px-3 transition-all"
                          style={{
                            width: `${stage.percent}%`,
                            background: `${stage.color}22`,
                            border: `2px solid ${stage.color}`,
                          }}
                        >
                          <span
                            className="text-xs font-bold"
                            style={{ color: stage.color }}
                          >
                            {stage.count}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs font-bold w-8 text-right" style={{ color: '#0A1628' }}>
                        {stage.percent}%
                      </span>
                    </div>
                    {/* Drop indicator */}
                    {idx > 0 && dropRate > 0 && (
                      <div className="flex justify-end pr-10 text-xs text-red-400 -mt-0.5 mb-0.5">
                        <span className="flex items-center gap-0.5">
                          <TrendingDown size={10} />
                          -{dropRate}% drop
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div
              className="mt-4 p-3 rounded-lg text-center text-sm font-bold"
              style={{ background: '#f0fdf4', color: '#16a34a' }}
            >
              Overall Conversion Rate: {overallConv}%
            </div>
          </div>

          {/* Sales by Destination — Horizontal Bar */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <h3 className="font-semibold text-sm mb-4" style={{ color: '#0A1628' }}>
              Revenue by Destination
            </h3>
            <div className="space-y-3">
              {destinationSalesData.map((d, i) => {
                const maxRev = destinationSalesData[0].revenue;
                const pct = Math.round((d.revenue / maxRev) * 100);
                const barColors = ['#00B4D8', '#FFD700', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#3b82f6', '#6b7280'];
                return (
                  <div key={d.destination}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-gray-700 font-medium">{d.destination}</span>
                      <span className="font-bold" style={{ color: '#0A1628' }}>
                        ${(d.revenue / 1000).toFixed(0)}k
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${pct}%`, background: barColors[i] }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Package Performance Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-sm" style={{ color: '#0A1628' }}>
              Performance by Package Category
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  {['Category', 'Revenue', 'Bookings', 'Avg. Deal Size', 'Revenue Share'].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide"
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {packagePerformance
                  .sort((a, b) => b.revenue - a.revenue)
                  .map((pkg, i) => {
                    const total = packagePerformance.reduce((s, p) => s + p.revenue, 0);
                    const share = Math.round((pkg.revenue / total) * 100);
                    return (
                      <tr
                        key={pkg.category}
                        className="border-t border-gray-100 hover:bg-gray-50"
                      >
                        <td className="px-5 py-3.5 font-medium" style={{ color: '#0A1628' }}>
                          <div className="flex items-center gap-2">
                            <span
                              className="w-2 h-2 rounded-full flex-shrink-0"
                              style={{
                                background: ['#00B4D8','#FFD700','#8b5cf6','#10b981','#f59e0b','#ef4444'][i],
                              }}
                            />
                            {pkg.category}
                          </div>
                        </td>
                        <td className="px-5 py-3.5 font-bold" style={{ color: '#0A1628' }}>
                          ${pkg.revenue.toLocaleString()}
                        </td>
                        <td className="px-5 py-3.5 text-gray-600">{pkg.bookings}</td>
                        <td className="px-5 py-3.5 text-gray-600">
                          ${pkg.avgDeal.toLocaleString()}
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden" style={{ maxWidth: '80px' }}>
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${share}%`,
                                  background: ['#00B4D8','#FFD700','#8b5cf6','#10b981','#f59e0b','#ef4444'][i],
                                }}
                              />
                            </div>
                            <span className="text-xs font-semibold" style={{ color: '#0A1628' }}>
                              {share}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
