'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Trash2,
  X,
} from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { format } from 'date-fns';

// Real type (matches /api/bookings, backed by the real Postgres bookings
// table). No packageName/destination/departureDate/returnDate fields -
// the real booking flow doesn't capture those yet, so this only shows
// what's actually real: type, item ID, lead traveler, amount, status.
export type BookingStatus =
  | 'inquiry' | 'quoted' | 'confirmed' | 'deposit_paid' | 'fully_paid'
  | 'declined' | 'cancelled';

export interface Booking {
  bookingRef: string;
  status: BookingStatus;
  requiresOwnerApproval: boolean;
  type: string;
  itemId: string;
  travelers: { firstName?: string; lastName?: string }[];
  totalAmount: number;
  leadTravelerName: string;
  leadTravelerEmail: string;
  ownerNotes: string | null;
  createdAt: string;
}

// ─── Status config ────────────────────────────────────────────────────────────
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
      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap"
      style={{ background: cfg.bg, color: cfg.color }}
    >
      {cfg.label}
    </span>
  );
}

// ─── Tab config ───────────────────────────────────────────────────────────────
const tabs: { key: string; label: string; statuses: BookingStatus[] | null }[] = [
  { key: 'all',       label: 'All',       statuses: null },
  { key: 'inquiry',   label: 'Inquiries', statuses: ['inquiry'] },
  { key: 'quoted',    label: 'Quoted',    statuses: ['quoted'] },
  { key: 'confirmed', label: 'Confirmed', statuses: ['confirmed'] },
  { key: 'paid',      label: 'Paid',      statuses: ['deposit_paid', 'fully_paid'] },
  { key: 'declined',  label: 'Declined/Cancelled', statuses: ['declined', 'cancelled'] },
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
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
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
              You are about to confirm this booking for{' '}
              <strong style={{ color: '#0A1628' }}>
                ${booking.totalAmount.toLocaleString()}
              </strong>
              . This will send a real confirmation email to {booking.leadTravelerName}.
            </p>
          </div>
        </div>

        <div className="px-6 py-4 space-y-2">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Booking Details
          </h3>
          {[
            { label: 'Booking Ref', value: booking.bookingRef },
            { label: 'Client', value: booking.leadTravelerName },
            { label: 'Type', value: booking.type },
            { label: 'Item', value: booking.itemId },
            { label: 'Created', value: format(new Date(booking.createdAt), 'MMMM d, yyyy') },
            { label: 'Travelers', value: `${booking.travelers.length}` },
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

        {booking.ownerNotes && (
          <div className="mx-6 mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
            <p className="text-xs font-semibold text-blue-700 mb-1">Owner Notes</p>
            <p className="text-xs text-blue-600">{booking.ownerNotes}</p>
          </div>
        )}

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
  );
}

// ─── Bookings Table ───────────────────────────────────────────────────────────
function BookingsTable({
  data,
  onApprove,
  onView,
  onDelete,
}: {
  data: Booking[];
  onApprove: (b: Booking) => void;
  onView: (b: Booking) => void;
  onDelete: (b: Booking) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            {['Booking Ref', 'Client', 'Type', 'Item', 'Created', 'Travelers', 'Amount', 'Status', 'Actions'].map((h) => (
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
              key={b.bookingRef}
              className="border-t border-gray-100 hover:bg-gray-50 transition-colors"
            >
              <td className="px-4 py-3.5 font-mono text-xs font-semibold text-gray-500">
                {b.bookingRef}
              </td>
              <td className="px-4 py-3.5">
                <div className="flex items-center gap-2">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{ background: '#0A1628', color: '#FFD700' }}
                  >
                    {b.leadTravelerName.charAt(0)}
                  </div>
                  <span className="font-medium" style={{ color: '#0A1628' }}>
                    {b.leadTravelerName}
                  </span>
                </div>
              </td>
              <td className="px-4 py-3.5 text-gray-600 capitalize">{b.type}</td>
              <td className="px-4 py-3.5 text-gray-600 max-w-[200px]">
                <span className="truncate block" title={b.itemId}>{b.itemId}</span>
              </td>
              <td className="px-4 py-3.5 text-gray-500 whitespace-nowrap">
                {format(new Date(b.createdAt), 'MMM d, yyyy')}
              </td>
              <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap">
                {b.travelers.length}
              </td>
              <td className="px-4 py-3.5 font-bold whitespace-nowrap" style={{ color: '#0A1628' }}>
                ${b.totalAmount.toLocaleString()}
              </td>
              <td className="px-4 py-3.5">
                <div className="flex items-center gap-1.5">
                  <StatusBadge status={b.status} />
                  {b.requiresOwnerApproval && b.status === 'inquiry' && (
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
                  {b.requiresOwnerApproval && b.status === 'inquiry' && (
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
                    onClick={() => onView(b)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-blue-100"
                    style={{ color: '#3b82f6' }}
                  >
                    <Eye size={14} />
                  </button>
                  <button
                    onClick={() => onDelete(b)}
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
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [modalBooking, setModalBooking] = useState<Booking | null>(null);
  const [viewBooking, setViewBooking] = useState<Booking | null>(null);
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);
  const [busyRefs, setBusyRefs] = useState<Set<string>>(new Set());

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch('/api/bookings');
      const json = await res.json();
      if (json.success) setBookings(json.bookings);
      else setLoadError(json.error ?? 'Failed to load bookings.');
    } catch {
      setLoadError('Failed to load bookings — check your connection.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const pendingApproval = useMemo(
    () => bookings.filter((b) => b.requiresOwnerApproval && b.status === 'inquiry'),
    [bookings]
  );

  const tabData = useMemo(() => {
    const tab = tabs.find((t) => t.key === activeTab);
    return !tab || !tab.statuses ? bookings : bookings.filter((b) => tab.statuses!.includes(b.status));
  }, [activeTab, bookings]);

  const handleDelete = async (b: Booking) => {
    if (!window.confirm(`Delete booking ${b.bookingRef} for ${b.leadTravelerName}? This can't be undone.`)) return;
    try {
      const res = await fetch(`/api/bookings/create?ref=${encodeURIComponent(b.bookingRef)}`, { method: 'DELETE' });
      const json = await res.json();
      if (!json.success) {
        setNoticeMessage(json.error ?? 'Failed to delete booking.');
        return;
      }
      setBookings((prev) => prev.filter((x) => x.bookingRef !== b.bookingRef));
    } catch {
      setNoticeMessage('Failed to delete booking — check your connection.');
    }
  };

  const setBusy = (ref: string, busy: boolean) => {
    setBusyRefs((prev) => {
      const next = new Set(prev);
      busy ? next.add(ref) : next.delete(ref);
      return next;
    });
  };

  const handleConfirmSale = async () => {
    if (!modalBooking) return;
    const ref = modalBooking.bookingRef;
    setBusy(ref, true);
    try {
      const res = await fetch('/api/bookings/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: ref, ownerApproved: true, ownerNotes: 'Approved via dashboard' }),
      });
      const json = await res.json();
      if (!json.success) {
        setNoticeMessage(json.error ?? 'Failed to confirm booking.');
      }
      await load();
    } catch {
      setNoticeMessage('Failed to confirm booking — check your connection.');
    } finally {
      setBusy(ref, false);
      setModalBooking(null);
    }
  };

  const handleDecline = async (booking: Booking) => {
    setBusy(booking.bookingRef, true);
    try {
      const res = await fetch('/api/bookings/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: booking.bookingRef, ownerApproved: false }),
      });
      const json = await res.json();
      if (!json.success) {
        setNoticeMessage(json.error ?? 'Failed to decline booking.');
      }
      await load();
    } catch {
      setNoticeMessage('Failed to decline booking — check your connection.');
    } finally {
      setBusy(booking.bookingRef, false);
    }
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
              {loading ? 'Loading…' : loadError ?? `${bookings.length} total bookings · $${totalRevenue.toLocaleString()} confirmed revenue`}
            </p>
          </div>
          <button
            onClick={() => setNoticeMessage('Manual booking creation isn\'t built yet — bookings currently come in through the site\'s own booking flow.')}
            className="px-4 py-2 rounded-lg text-sm font-semibold"
            style={{ background: '#FFD700', color: '#0A1628' }}
          >
            + New Booking
          </button>
        </div>

        {/* Pending Owner Approval */}
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
                  key={b.bookingRef}
                  className="bg-white rounded-xl border border-yellow-200 p-4 flex items-start gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm" style={{ color: '#0A1628' }}>
                        {b.leadTravelerName}
                      </span>
                      <StatusBadge status={b.status} />
                      <span className="text-xs font-mono text-gray-400">{b.bookingRef}</span>
                    </div>
                    <p className="text-sm text-gray-700 mt-1 capitalize">
                      <strong>{b.type}</strong> → {b.itemId}
                    </p>
                    <div className="flex items-center gap-4 mt-1.5 flex-wrap">
                      <span className="text-xs text-gray-500">
                        Created {format(new Date(b.createdAt), 'MMM d, yyyy')}
                      </span>
                      <span className="text-xs text-gray-500">
                        {b.travelers.length} traveler{b.travelers.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <p className="text-xl font-bold" style={{ color: '#0A1628' }}>
                      ${b.totalAmount.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-400">total sale</p>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0 self-center">
                    <button
                      onClick={() => setModalBooking(b)}
                      disabled={busyRefs.has(b.bookingRef)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-bold transition-opacity hover:opacity-90 disabled:opacity-50"
                      style={{ background: '#FFD700', color: '#0A1628' }}
                    >
                      <CheckCircle size={15} />
                      Approve Sale
                    </button>
                    <button
                      onClick={() => handleDecline(b)}
                      disabled={busyRefs.has(b.bookingRef)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold border transition-colors hover:bg-red-50 disabled:opacity-50"
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

        {/* Tabs + Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
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

          <BookingsTable
            data={tabData}
            onApprove={(b) => setModalBooking(b)}
            onView={(b) => setViewBooking(b)}
            onDelete={handleDelete}
          />
        </div>
      </div>

      {modalBooking && (
        <ConfirmModal
          booking={modalBooking}
          onConfirm={handleConfirmSale}
          onCancel={() => setModalBooking(null)}
        />
      )}

      {viewBooking && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div
              className="flex items-center justify-between px-6 py-4 border-b border-gray-100"
              style={{ background: '#0A1628' }}
            >
              <h2 className="font-bold text-white">{viewBooking.bookingRef}</h2>
              <button onClick={() => setViewBooking(null)}>
                <X size={20} className="text-gray-400 hover:text-white" />
              </button>
            </div>
            <div className="p-6 space-y-2.5 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Client</span><span className="font-semibold" style={{ color: '#0A1628' }}>{viewBooking.leadTravelerName}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Email</span><span className="font-semibold" style={{ color: '#0A1628' }}>{viewBooking.leadTravelerEmail}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Type</span><span className="font-semibold capitalize" style={{ color: '#0A1628' }}>{viewBooking.type}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Item</span><span className="font-semibold text-right" style={{ color: '#0A1628' }}>{viewBooking.itemId}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Created</span><span className="font-semibold" style={{ color: '#0A1628' }}>{format(new Date(viewBooking.createdAt), 'MMM d, yyyy')}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Travelers</span><span className="font-semibold" style={{ color: '#0A1628' }}>{viewBooking.travelers.length}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Amount</span><span className="font-semibold" style={{ color: '#0A1628' }}>${viewBooking.totalAmount.toLocaleString()}</span></div>
              <div className="flex justify-between items-center"><span className="text-gray-500">Status</span><StatusBadge status={viewBooking.status} /></div>
              {viewBooking.ownerNotes && (
                <div className="pt-2 border-t border-gray-100">
                  <p className="text-gray-500 mb-1">Owner Notes</p>
                  <p style={{ color: '#0A1628' }}>{viewBooking.ownerNotes}</p>
                </div>
              )}
            </div>
            <div className="px-6 pb-6">
              <button
                onClick={() => setViewBooking(null)}
                className="w-full py-2.5 rounded-xl font-semibold text-sm text-white"
                style={{ background: '#0A1628' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

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
