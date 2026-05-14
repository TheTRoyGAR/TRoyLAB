'use client';

import { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Filter,
  Download,
  Mail,
  Eye,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  X,
  Check,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { contacts, Contact, ContactStatus, ContactSource } from '@/lib/data/crm';
import { format } from 'date-fns';

// ─── Helpers ─────────────────────────────────────────────────────────────────
const statusConfig: Record<ContactStatus, { label: string; bg: string; color: string }> = {
  lead:     { label: 'Lead',     bg: '#dbeafe', color: '#1d4ed8' },
  prospect: { label: 'Prospect', bg: '#fef9c3', color: '#92400e' },
  customer: { label: 'Customer', bg: '#dcfce7', color: '#14532d' },
  vip:      { label: 'VIP',     bg: '#fef3c7', color: '#78350f' },
};

const vipGold = '#FFD700';

function StatusBadge({ status }: { status: ContactStatus }) {
  const cfg = statusConfig[status];
  const isVip = status === 'vip';
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
      style={{
        background: isVip ? '#fef9c3' : cfg.bg,
        color: isVip ? '#78350f' : cfg.color,
        border: isVip ? `1px solid ${vipGold}` : 'none',
      }}
    >
      {isVip && <span style={{ color: vipGold }}>★</span>}
      {cfg.label}
    </span>
  );
}

function Avatar({ name, status }: { name: string; status: ContactStatus }) {
  const initials = name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
  const bgMap: Record<ContactStatus, string> = {
    vip: vipGold,
    customer: '#0A1628',
    prospect: '#7c3aed',
    lead: '#3b82f6',
  };
  const fgMap: Record<ContactStatus, string> = {
    vip: '#0A1628',
    customer: '#FFD700',
    prospect: '#fff',
    lead: '#fff',
  };
  return (
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
      style={{ background: bgMap[status], color: fgMap[status] }}
    >
      {initials}
    </div>
  );
}

// ─── Contact form schema ───────────────────────────────────────────────────
const contactSchema = z.object({
  firstName:  z.string().min(1, 'First name required'),
  lastName:   z.string().min(1, 'Last name required'),
  email:      z.string().email('Invalid email'),
  phone:      z.string().min(1, 'Phone required'),
  country:    z.string().min(1, 'Country required'),
  status:     z.enum(['lead', 'prospect', 'customer', 'vip']),
  source:     z.enum(['website', 'referral', 'social', 'direct']),
  notes:      z.string().optional(),
});
type ContactFormData = z.infer<typeof contactSchema>;

// ─── Slide-in form panel ───────────────────────────────────────────────────
function AddContactPanel({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({ resolver: zodResolver(contactSchema) });

  const onSubmit = (data: ContactFormData) => {
    console.log('New contact:', data);
    reset();
    onClose();
  };

  if (!open) return null;

  const fieldCls =
    'w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent';
  const labelCls = 'block text-xs font-semibold text-gray-600 mb-1';

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40"
        onClick={onClose}
      />
      {/* Panel */}
      <div
        className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 overflow-y-auto flex flex-col"
        style={{ borderLeft: '3px solid #00B4D8' }}
      >
        {/* Panel header */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b border-gray-100"
          style={{ background: '#0A1628' }}
        >
          <h2 className="font-bold text-white">Add New Contact</h2>
          <button onClick={onClose}>
            <X size={20} className="text-gray-400 hover:text-white" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>First Name *</label>
              <input className={fieldCls} {...register('firstName')} />
              {errors.firstName && (
                <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>
              )}
            </div>
            <div>
              <label className={labelCls}>Last Name *</label>
              <input className={fieldCls} {...register('lastName')} />
              {errors.lastName && (
                <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className={labelCls}>Email *</label>
            <input type="email" className={fieldCls} {...register('email')} />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Phone *</label>
              <input className={fieldCls} {...register('phone')} />
              {errors.phone && (
                <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>
              )}
            </div>
            <div>
              <label className={labelCls}>Country *</label>
              <input className={fieldCls} {...register('country')} />
              {errors.country && (
                <p className="text-red-500 text-xs mt-1">{errors.country.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Status *</label>
              <select className={fieldCls} {...register('status')}>
                <option value="lead">Lead</option>
                <option value="prospect">Prospect</option>
                <option value="customer">Customer</option>
                <option value="vip">VIP</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Source *</label>
              <select className={fieldCls} {...register('source')}>
                <option value="website">Website</option>
                <option value="referral">Referral</option>
                <option value="social">Social</option>
                <option value="direct">Direct</option>
              </select>
            </div>
          </div>

          <div>
            <label className={labelCls}>Notes</label>
            <textarea
              className={`${fieldCls} resize-none`}
              rows={3}
              {...register('notes')}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-lg font-semibold text-sm transition-opacity hover:opacity-90 flex items-center justify-center gap-2"
              style={{ background: '#FFD700', color: '#0A1628' }}
            >
              <Check size={16} />
              Add Contact
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

// ─── Main Contacts Page ────────────────────────────────────────────────────
const PAGE_SIZE = 10;

export default function ContactsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [countryFilter, setCountryFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [panelOpen, setPanelOpen] = useState(false);

  const countries = useMemo(
    () => Array.from(new Set(contacts.map((c) => c.country))).sort(),
    []
  );

  const filtered = useMemo(() => {
    return contacts.filter((c) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        c.firstName.toLowerCase().includes(q) ||
        c.lastName.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone.includes(q);
      const matchStatus = statusFilter === 'all' || c.status === statusFilter;
      const matchSource = sourceFilter === 'all' || c.source === sourceFilter;
      const matchCountry = countryFilter === 'all' || c.country === countryFilter;
      return matchSearch && matchStatus && matchSource && matchCountry;
    });
  }, [search, statusFilter, sourceFilter, countryFilter]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const allSelected =
    paginated.length > 0 && paginated.every((c) => selected.has(c.id));

  const toggleAll = () => {
    if (allSelected) {
      const next = new Set(selected);
      paginated.forEach((c) => next.delete(c.id));
      setSelected(next);
    } else {
      const next = new Set(selected);
      paginated.forEach((c) => next.add(c.id));
      setSelected(next);
    }
  };

  const toggleOne = (id: string) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  const selectCfg: Record<string, string> =
    'w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white' as unknown as Record<string, string>;

  return (
    <DashboardLayout>
      <div className="p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#0A1628' }}>
              Contacts
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {contacts.length} contacts total
            </p>
          </div>
          <button
            onClick={() => setPanelOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-opacity hover:opacity-90"
            style={{ background: '#FFD700', color: '#0A1628' }}
          >
            <Plus size={16} />
            Add Contact
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          {/* Search */}
          <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2 flex-1 min-w-[200px]">
            <Search size={15} className="text-gray-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search by name, email, phone…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="flex-1 text-sm outline-none bg-transparent"
            />
          </div>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white"
          >
            <option value="all">All Statuses</option>
            <option value="lead">Lead</option>
            <option value="prospect">Prospect</option>
            <option value="customer">Customer</option>
            <option value="vip">VIP</option>
          </select>

          {/* Source filter */}
          <select
            value={sourceFilter}
            onChange={(e) => { setSourceFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white"
          >
            <option value="all">All Sources</option>
            <option value="website">Website</option>
            <option value="referral">Referral</option>
            <option value="social">Social</option>
            <option value="direct">Direct</option>
          </select>

          {/* Country filter */}
          <select
            value={countryFilter}
            onChange={(e) => { setCountryFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white"
          >
            <option value="all">All Countries</option>
            {countries.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <div className="text-xs text-gray-400">
            {filtered.length} result{filtered.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Bulk actions bar */}
        {selected.size > 0 && (
          <div
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg border"
            style={{ background: '#f0f9ff', borderColor: '#00B4D8' }}
          >
            <span className="text-sm font-medium" style={{ color: '#0A1628' }}>
              {selected.size} contact{selected.size !== 1 ? 's' : ''} selected
            </span>
            <div className="flex items-center gap-2 ml-auto">
              <button
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-300 bg-white hover:bg-gray-50 transition-colors"
              >
                <Download size={13} />
                Export CSV
              </button>
              <button
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-300 bg-white hover:bg-gray-50 transition-colors"
              >
                <Mail size={13} />
                Send Email
              </button>
              <button
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-300 bg-white hover:bg-gray-50 transition-colors"
              >
                <Filter size={13} />
                Change Status
              </button>
              <button
                onClick={() => setSelected(new Set())}
                className="text-gray-400 hover:text-gray-600 ml-1"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleAll}
                      className="w-4 h-4 rounded accent-teal-500"
                    />
                  </th>
                  {['Name', 'Email', 'Phone', 'Country', 'Status', 'Total Spent', 'Last Contact', 'Actions'].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap"
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {paginated.map((contact) => (
                  <tr
                    key={contact.id}
                    className={`border-t border-gray-100 hover:bg-gray-50 transition-colors ${
                      selected.has(contact.id) ? 'bg-blue-50' : ''
                    }`}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selected.has(contact.id)}
                        onChange={() => toggleOne(contact.id)}
                        className="w-4 h-4 rounded accent-teal-500"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar
                          name={`${contact.firstName} ${contact.lastName}`}
                          status={contact.status}
                        />
                        <div>
                          <p className="font-semibold text-sm" style={{ color: '#0A1628' }}>
                            {contact.firstName} {contact.lastName}
                          </p>
                          <p className="text-xs text-gray-400 capitalize">{contact.source}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{contact.email}</td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{contact.phone}</td>
                    <td className="px-4 py-3 text-gray-600">{contact.country}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={contact.status} />
                    </td>
                    <td className="px-4 py-3 font-semibold whitespace-nowrap" style={{ color: '#0A1628' }}>
                      {contact.totalSpent > 0
                        ? `$${contact.totalSpent.toLocaleString()}`
                        : <span className="text-gray-400 font-normal">—</span>
                      }
                    </td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap text-xs">
                      {format(new Date(contact.lastContact), 'MMM d, yyyy')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          title="View"
                          className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-blue-100 transition-colors"
                          style={{ color: '#3b82f6' }}
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          title="Edit"
                          className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-yellow-100 transition-colors"
                          style={{ color: '#f59e0b' }}
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          title="Delete"
                          className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-red-100 transition-colors"
                          style={{ color: '#ef4444' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {paginated.length === 0 && (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-gray-400 text-sm">
                      No contacts match your filters
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50">
            <span className="text-xs text-gray-500">
              Showing {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–
              {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-8 h-8 rounded-lg flex items-center justify-center border border-gray-300 hover:bg-white transition-colors disabled:opacity-40"
              >
                <ChevronLeft size={14} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center border text-xs font-medium transition-colors"
                  style={{
                    background: p === page ? '#0A1628' : 'white',
                    color: p === page ? '#FFD700' : '#374151',
                    borderColor: p === page ? '#0A1628' : '#d1d5db',
                  }}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="w-8 h-8 rounded-lg flex items-center justify-center border border-gray-300 hover:bg-white transition-colors disabled:opacity-40"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Slide-in Add Contact Panel */}
      <AddContactPanel open={panelOpen} onClose={() => setPanelOpen(false)} />
    </DashboardLayout>
  );
}
