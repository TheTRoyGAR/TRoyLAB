'use client';

import { useState, useMemo } from 'react';
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Pencil,
  Trash2,
  X,
} from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { bookings, Booking, BookingStatus, getContactName } from '@/lib/data/crm';
import { format } from 'date-fns';

// ─── Status config ────────────────────────────────────────────────────────────
const statusConfig: Record<
  BookingStatus,
  { label: string; bg: string; color: string; border?: string }
> = {
  inquiry:      { label: 'Inquiry',      bg: '#f3f4f6', color: '#374151' },
  quoted:       { label: 'Quoted',       bg: '#fef3c7', color: '#92400e' },
  confirmed:    { label: 'Confirmed',    bg: '#d1fae5', color: '#065f46' },
  deposit_paid: { label: 'Deposit Paid', bg: '#dbeafe', color: '#1e40af' },
  fully_paid:   { label: 'Fully Paid',   bg: '#f0fdf4', color: '#14532d' },
  cancelled:    { label: 'Cancelled',    bg: '#fee2e2', color: '#991b1b' },
};

function StatusBadge({ status }: { status: BookingStatus }) {
  const cfg = statusConfig[status];
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap"
      style={{ background: cfg.bg, color: cfg.color }}
    >
      {cfg.label}
    </span>
  );
}

// ─── Tab config ───────────────────────────────────────────────────────────────
const tabs: { key: string; label: string; statuses: BookingStatus[] | null }[] = [
  { key: 'all',         label: 'All',        statuses: null },
  { key: 'inquiry',     label: 'Inquiries',  statuses: ['inquiry'] },
  { key: 'quoted',      label: 'Quoted',     statuses: ['quoted'] },
  { key: 'confirmed',   label: 'Confirmed',  statuses: ['confirmed'] },
  { key: 'paid',        label: 'Paid',       statuses: ['deposit_paid', 'fully_paid'] },
  { key: 'cancelled',   label: 'Cancelled',  statuses: ['cancelled'] },
];

// ─── Confirmation Modal ──────────────────────────────────────────────────────
function ConfirmModal({
  booking,
  onConfirm,
  onCancel,
}: {
  booking: Booking;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const contactName = getContactName(booking.contactId);
  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
          {/* Modal header */}
          <div
            className="flex items-center justify-between px-6 py-4 border-b border-gray-100"
            style={{ background: '#0A1628' }}
          >
            <h2 className="font-bold text-white flex items-center gap-2">
              <CheckCircle size={18} style={{ color: '#FFD700' }} />
              Approve Sale Confirmation
            </h2>
            <button onClick={onCancel}>
              <X size={20} className="text-gray-400 hover:text-white" />
            </button>
          </div>

          {/* Warning */}
          <div
            className="mx-6 mt-6 p-4 rounded-lg border-2 flex items-start gap-3"
            style={{ borderColor: '#FFD700', background: '#fffbeb' }}
          >
            <AlertTriangle size={20} style={{ color: '#FFD700', flexShrink: 0, marginTop: 2 }} />
            <div>
              <p className="text-sm font-bold" style={{ color: '#0A1628' }}>
                Owner Approval Required
              </p>
              <p className="text-sm text-gray-600 mt-1">
                You are about to confirm this sale for{' '}
                <strong style={{ color: '#0A1628' }}>
                  ${booking.totalAmount.toLocaleString()}
                </strong>
                . This will trigger payment collection and confirmation emails to {contactName}.
              </p>
            </div>
          </div>

          {/* Booking details */}
          <div className="px-6 py-4 space-y-2">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Booking Details
            </h3>
            {[
              { label: 'Booking ID', value: `#${booking.id}` },
              { label: 'Client', value: contactName },
              { label: 'Package', value: booking.packageName },
              { label: 'Destination', value: booking.destination },
              { label: 'Departure', value: format(new Date(booking.departureDate), 'MMMM d, yyyy') },
              { label: 'Return', value: format(new Date(booking.returnDate), 'MMMM d, yyyy') },
              {
                label: 'Travelers',
                value: `${booking.travelers.adults} adult${booking.travelers.adults !== 1 ? 's' : ''}${
                  booking.travelers.children > 0
                    ? `, ${booking.travelers.children} child${booking.travelers.children !== 1 ? 'ren' : ''}`
                    : ''
                }`,
              },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between py-1.5 border-b border-gray-100">
                <span className="text-xs text-gray-500">{label}</span>
                <span className="text-sm font-medium" style={{ color: '#0A1628' }}>{value}</span>
              </div>
            ))}
            <div className="flex items-center justify-between py-2 mt-1">
              <span className="text-sm font-bold" style={{ color: '#0A1628' }}>Total Amount</span>
              <span className="text-xl font-bold" style={{ color: '#FFD700' }}>
                ${booking.totalAmount.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Agent notes */}
          {booking.agentNotes && (
            <div className="mx-6 mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
              <p className="text-xs font-semibold text-blue-700 mb-1">Agent Notes</p>
              <p className="text-xs text-blue-600">{booking.agentNotes}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 px-6 pb-6">
            <button
              onClick={onConfirm}
              className="flex-1 py-3 rounded-xl font-bold text-sm transition-opacity hover:opacity-90 flex items-center justify-center gap-2"
              style={{ background: '#10b981', color: '#fff' }}
            >
              <CheckCircle size={16} />
              Confirm Sale — ${booking.totalAmount.toLocaleString()}
            </button>
            <button
              onClick={onCancel}
              className="px-5 py-3 rounded-xl font-semibold text-sm border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Bookings Table ───────────────────────────────────────────────────────────
function BookingsTable({
  data,
  onApprove,
}: {
  data: Booking[];
  onApprove: (b: Booking) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            {[
              'Booking ID', 'Client', 'Package', 'Destination',
              'Departure', 'Travelers', 'Amount', 'Status', 'Actions',
            ].map((h) => (
              <th
                key={h}
                className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((b) => (
            <tr
              key={b.id}
              className="border-t border-gray-100 hover:bg-gray-50 transition-colors"
            >
              <td className="px-4 py-3.5 font-mono text-xs font-semibold text-gray-500">
                #{b.id}
              </td>
              <td className="px-4 py-3.5">
                <div className="flex items-center gap-2">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{ background: '#0A1628', color: '#FFD700' }}
                  >
                    {getContactName(b.contactId).charAt(0)}
                  </div>
                  <span className="font-medium" style={{ color: '#0A1628' }}>
                    {getContactName(b.contactId)}
                  </span>
                </div>
              </td>
              <td className="px-4 py-3.5 text-gray-600 max-w-[200px]">
                <span className="truncate block" title={b.packageName}>{b.packageName}</span>
              </td>
              <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap">{b.destination}</td>
              <td className="px-4 py-3.5 text-gray-500 whitespace-nowrap">
                {format(new Date(b.departureDate), 'MMM d, yyyy')}
              </td>
              <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap">
                {b.travelers.adults}A
                {b.travelers.children > 0 && ` + ${b.travelers.children}C`}
              </td>
              <td className="px-4 py-3.5 font-bold whitespace-nowrap" style={{ color: '#0A1628' }}>
                ${b.totalAmount.toLocaleString()}
              </td>
              <td className="px-4 py-3.5">
                <div className="flex items-center gap-1.5">
                  <StatusBadge status={b.status} />
                  {b.requiresOwnerApproval && (
                    <span
                      title="Requires Owner Approval"
                      className="w-4 h-4 flex items-center justify-center rounded-full text-xs"
                      style={{ background: '#fef3c7', color: '#d97706' }}
                    >
                      ★
                    </span>
                  )}
                </div>
              </td>
              <td className="px-4 py-3.5">
                <div className="flex items-center gap-1">
                  {b.requiresOwnerApproval &&
                    (b.status === 'quoted' || b.status === 'confirmed') && (
                      <button
                        onClick={() => onApprove(b)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-opacity hover:opacity-90 mr-1"
                        style={{ background: '#FFD700', color: '#0A1628' }}
                      >
                        <CheckCircle size={12} />
                        Approve Sale
                      </button>
                    )}
                  <button
                    className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-blue-100"
                    style={{ color: '#3b82f6' }}
                  >
                    <Eye size={14} />
                  </button>
                  <button
                    className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-yellow-100"
                    style={{ color: '#f59e0b' }}
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-red-100"
                    style={{ color: '#ef4444' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {data.length === 0 && (
            <tr>
              <td colSpan={9} className="py-16 text-center text-gray-400 text-sm">
                No bookings in this category
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

// ─── Main Bookings Page ────────────────────────────────────────────────────────
export default function BookingsPage() {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [modalBooking, setModalBooking] = useState<Booking | null>(null);
  const [approvedIds, setApprovedIds] = useState<Set<string>>(new Set());
  const [declinedIds, setDeclinedIds] = useState<Set<string>>(new Set());

  // Pending approval: requiresOwnerApproval AND (quoted|confirmed) AND not yet processed
  const pendingApproval = useMemo(
    () =>
      bookings.filter(
        (b) =>
          b.requiresOwnerApproval &&
          (b.status === 'quoted' || b.status === 'confirmed') &&
          !approvedIds.has(b.id) &&
          !declinedIds.has(b.id)
      ),
    [approvedIds, declinedIds]
  );

  const tabData = useMemo(() => {
    const tab = tabs.find((t) => t.key === activeTab);
    if (!tab || !tab.statuses) return bookings;
    return bookings.filter((b) => tab.statuses!.includes(b.status));
  }, [activeTab]);

  const handleConfirmSale = async () => {
    if (!modalBooking) return;
    try {
      const res = await fetch('/api/bookings/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: modalBooking.id,
          ownerApproved: true,
          ownerNotes: 'Approved via dashboard',
        }),
      });
      const data = await res.json();
      console.log('Confirm response:', data);
    } catch {
      console.error('Failed to confirm booking');
    }
    setApprovedIds((prev) => new Set([...prev, modalBooking.id]));
    setModalBooking(null);
  };

  const handleDecline = (bookingId: string) => {
    setDeclinedIds((prev) => new Set([...prev, bookingId]));
  };

  const totalRevenue = bookings
    .filter((b) => ['confirmed', 'deposit_paid', 'fully_paid'].includes(b.status))
    .reduce((s, b) => s + b.totalAmount, 0);

  return (
    <DashboardLayout>
      <div className="p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#0A1628' }}>
              Bookings
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {bookings.length} total bookings · ${totalRevenue.toLocaleString()} confirmed revenue
            </p>
          </div>
          <button
            className="px-4 py-2 rounded-lg text-sm font-semibold"
            style={{ background: '#FFD700', color: '#0A1628' }}
          >
            + New Booking
          </button>
        </div>

        {/* ⚠️ Pending Owner Approval Section */}
        {pendingApproval.length > 0 && (
          <div
            className="rounded-xl border-2 p-5 space-y-3"
            style={{ borderColor: '#FFD700', background: '#fffbeb' }}
          >
            <div className="flex items-center gap-2">
              <AlertTriangle size={22} style={{ color: '#FFD700' }} />
              <h2 className="text-base font-bold" style={{ color: '#0A1628' }}>
                Pending Owner Approval ({pendingApproval.length})
              </h2>
              <span className="ml-auto text-xs text-gray-500">
                Troy must approve before any sale is completed
              </span>
            </div>

            <div className="space-y-3">
              {pendingApproval.map((b) => (
                <div
                  key={b.id}
                  className="bg-white rounded-xl border border-yellow-200 p-4 flex items-start gap-4"
                >
                  {/* Booking info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm" style={{ color: '#0A1628' }}>
                        {getContactName(b.contactId)}
                      </span>
                      <StatusBadge status={b.status} />
                      <span className="text-xs font-mono text-gray-400">#{b.id}</span>
                    </div>
                    <p className="text-sm text-gray-700 mt-1">
                      <strong>{b.packageName}</strong> → {b.destination}
                    </p>
                    <div className="flex items-center gap-4 mt-1.5 flex-wrap">
                      <span className="text-xs text-gray-500">
                        ✈ Departs {format(new Date(b.departureDate), 'MMM d, yyyy')}
                      </span>
                      <span className="text-xs text-gray-500">
                        👥 {b.travelers.adults + b.travelers.children} travelers
                      </span>
                      {b.agentNotes && (
                        <span className="text-xs text-blue-500 italic truncate max-w-[200px]">
                          {b.agentNotes}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="text-right flex-shrink-0">
                    <p className="text-xl font-bold" style={{ color: '#0A1628' }}>
                      ${b.totalAmount.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-400">total sale</p>
                  </div>

                  {/* Buttons */}
                  <div className="flex items-center gap-2 flex-shrink-0 self-center">
                    <button
                      onClick={() => setModalBooking(b)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-bold transition-opacity hover:opacity-90"
                      style={{ background: '#FFD700', color: '#0A1628' }}
                    >
                      <CheckCircle size={15} />
                      Approve Sale
                    </button>
                    <button
                      onClick={() => handleDecline(b.id)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold border transition-colors hover:bg-red-50"
                      style={{ borderColor: '#ef4444', color: '#ef4444' }}
                    >
                      <XCircle size={15} />
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recently processed */}
        {(approvedIds.size > 0 || declinedIds.size > 0) && (
          <div className="flex flex-wrap gap-2">
            {[...approvedIds].map((id) => (
              <span
                key={id}
                className="text-xs px-2.5 py-1 rounded-full font-medium"
                style={{ background: '#d1fae5', color: '#065f46' }}
              >
                ✓ #{id} Approved
              </span>
            ))}
            {[...declinedIds].map((id) => (
              <span
                key={id}
                className="text-xs px-2.5 py-1 rounded-full font-medium"
                style={{ background: '#fee2e2', color: '#991b1b' }}
              >
                ✗ #{id} Declined
              </span>
            ))}
          </div>
        )}

        {/* Tabs + Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-200 overflow-x-auto">
            {tabs.map((tab) => {
              const count = tab.statuses
                ? bookings.filter((b) => tab.statuses!.includes(b.status)).length
                : bookings.length;
              const active = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className="flex items-center gap-1.5 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2"
                  style={{
                    borderBottomColor: active ? '#0A1628' : 'transparent',
                    color: active ? '#0A1628' : '#6b7280',
                    background: active ? '#f9fafb' : 'white',
                  }}
                >
                  {tab.label}
                  <span
                    className="text-xs px-1.5 py-0.5 rounded-full font-semibold"
                    style={{
                      background: active ? '#0A1628' : '#f3f4f6',
                      color: active ? '#FFD700' : '#6b7280',
                    }}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <BookingsTable data={tabData} onApprove={(b) => setModalBooking(b)} />
        </div>
      </div>

      {/* Confirmation Modal */}
      {modalBooking && (
        <ConfirmModal
          booking={modalBooking}
          onConfirm={handleConfirmSale}
          onCancel={() => setModalBooking(null)}
        />
      )}
    </DashboardLayout>
  );
}
