'use client';

import { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import { AlertCircle, CheckCircle2, ExternalLink, FileText, Handshake, Loader2, Mail, ShieldAlert, ShieldCheck } from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

type Status = 'pending_review' | 'reviewing' | 'needs_info' | 'approved' | 'declined';

interface Registration {
  kind: 'abn' | 'other' | 'none';
  digits?: string;
  checksumOk?: boolean;
  lookupUrl?: string;
}

interface Submission {
  id: string;
  organisation: string | null;
  name: string;
  email: string;
  country: string | null;
  website: string | null;
  registration_number: string | null;
  specialization: string;
  destinations_covered: string;
  credentials: string | null;
  message: string | null;
  document_name: string | null;
  has_document: boolean;
  status: Status;
  reviewer_notes: string | null;
  created_at: string;
  reviewed_at: string | null;
  registration: Registration;
}

const STATUS: Record<Status, { label: string; bg: string; color: string }> = {
  pending_review: { label: 'New', bg: '#dbeafe', color: '#1d4ed8' },
  reviewing: { label: 'Reviewing', bg: '#fef9c3', color: '#92400e' },
  needs_info: { label: 'Needs info', bg: '#ffedd5', color: '#9a3412' },
  approved: { label: 'Approved', bg: '#dcfce7', color: '#14532d' },
  declined: { label: 'Declined', bg: '#fee2e2', color: '#991b1b' },
};

const TABS: Array<{ key: 'all' | Status; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'pending_review', label: 'New' },
  { key: 'reviewing', label: 'Reviewing' },
  { key: 'needs_info', label: 'Needs info' },
  { key: 'approved', label: 'Approved' },
  { key: 'declined', label: 'Declined' },
];

function StatusBadge({ status }: { status: Status }) {
  const c = STATUS[status] ?? STATUS.pending_review;
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: c.bg, color: c.color }}>
      {c.label}
    </span>
  );
}

function fmt(iso: string | null): string {
  if (!iso) return '';
  try { return format(new Date(iso), 'd MMM yyyy, HH:mm'); } catch { return iso; }
}

function RegistrationCheck({ s }: { s: Submission }) {
  const r = s.registration;
  if (!s.registration_number) {
    return <p className="text-sm text-amber-700 flex items-center gap-1.5"><ShieldAlert className="h-4 w-4" /> No registration number given. Ask for one, or for a licence and insurance certificate.</p>;
  }
  if (r.kind === 'abn') {
    return (
      <div className="space-y-1">
        <p className={`text-sm flex items-center gap-1.5 ${r.checksumOk ? 'text-green-700' : 'text-red-700'}`}>
          {r.checksumOk ? <ShieldCheck className="h-4 w-4" /> : <ShieldAlert className="h-4 w-4" />}
          ABN {r.digits}: {r.checksumOk ? 'the number is correctly formed' : 'the number is NOT a valid ABN (checksum fails)'}
        </p>
        {r.lookupUrl && r.checksumOk && (
          <a href={r.lookupUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-[#00B4D8] hover:underline inline-flex items-center gap-1">
            Open it on the ABR to see if it is active and who holds it <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}
        <p className="text-xs text-gray-500">A correct format only proves the number is well formed. Always check the ABR page.</p>
      </div>
    );
  }
  return <p className="text-sm text-gray-700">Registration number: <strong>{s.registration_number}</strong>. Not an Australian ABN: check it with that country&apos;s company registry, and ask for their licence and insurance.</p>;
}

export default function PartnersDashboardPage() {
  const [items, setItems] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true); // true until the first load finishes
  const [loadError, setLoadError] = useState<string | null>(null);
  const [tab, setTab] = useState<'all' | Status>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState<Status | null>(null);
  const [message, setMessage] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/partners/apply');
        const json = await res.json();
        if (cancelled) return;
        if (json.success) setItems(json.submissions as Submission[]);
        else setLoadError(json.error ?? 'Failed to load applications.');
      } catch {
        if (!cancelled) setLoadError('Failed to load applications. Check your connection.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: items.length };
    for (const i of items) c[i.status] = (c[i.status] ?? 0) + 1;
    return c;
  }, [items]);

  const shown = useMemo(() => (tab === 'all' ? items : items.filter((i) => i.status === tab)), [items, tab]);
  const selected = useMemo(() => items.find((i) => i.id === selectedId) ?? null, [items, selectedId]);

  function selectRow(id: string) {
    setSelectedId(id);
    setNotes(items.find((i) => i.id === id)?.reviewer_notes ?? '');
    setMessage(null);
  }

  async function setStatus(status: Status) {
    if (!selected) return;
    if (status === 'approved' && !window.confirm('Approve this partner? Approving only marks them as verified by you. Nothing is published yet.')) return;
    setSaving(status);
    setMessage(null);
    try {
      const res = await fetch('/api/partners/apply', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selected.id, status, reviewerNotes: notes }),
      });
      const json = await res.json();
      if (!json.success) {
        setMessage({ kind: 'error', text: json.error ?? 'Could not save.' });
      } else {
        setItems((prev) => prev.map((i) => (i.id === selected.id ? { ...i, status, reviewer_notes: json.submission.reviewer_notes, reviewed_at: json.submission.reviewed_at } : i)));
        setMessage({ kind: 'ok', text: `Saved: ${STATUS[status].label}.` });
      }
    } catch {
      setMessage({ kind: 'error', text: 'Could not save. Check your connection.' });
    } finally {
      setSaving(null);
    }
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-5">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: '#0A1628' }}>
            <Handshake className="h-6 w-6" style={{ color: '#00B4D8' }} /> Partners
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Applications from tour operators, agencies and guides who want to list their packages. Nothing on this page is published to the public site.
          </p>
        </div>

        <div className="flex flex-wrap gap-2" role="tablist">
          {TABS.map((t) => (
            <button
              key={t.key}
              role="tab"
              onClick={() => { setTab(t.key); setSelectedId(null); }}
              className={`px-3 py-1.5 rounded-full text-sm font-semibold border transition-colors ${tab === t.key ? 'text-white border-transparent' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}
              style={tab === t.key ? { background: '#0A1628' } : undefined}
            >
              {t.label} <span className="opacity-70">({counts[t.key] ?? 0})</span>
            </button>
          ))}
        </div>

        {loading && <p className="text-sm text-gray-500 flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Loading applications…</p>}
        {loadError && <p className="text-sm text-red-600 flex items-center gap-2"><AlertCircle className="h-4 w-4" /> {loadError}</p>}
        {!loading && !loadError && shown.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center text-sm text-gray-500">
            {items.length === 0 ? 'No applications yet. They will appear here when someone applies on the Partners page.' : 'No applications in this group.'}
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">
          <div className="xl:col-span-2 space-y-2">
            {shown.map((s) => (
              <button
                key={s.id}
                onClick={() => selectRow(s.id)}
                className={`w-full text-left bg-white rounded-xl border p-4 transition-shadow hover:shadow-md ${selectedId === s.id ? 'border-[#00B4D8] ring-1 ring-[#00B4D8]' : 'border-gray-200'}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-[#0A1628] truncate">{s.organisation || s.name}</p>
                    <p className="text-xs text-gray-500 truncate">{s.country ?? 'Country not given'} · {s.name}</p>
                  </div>
                  <StatusBadge status={s.status} />
                </div>
                <p className="text-xs text-gray-400 mt-2">Applied {fmt(s.created_at)}</p>
              </button>
            ))}
          </div>

          <div className="xl:col-span-3">
            {!selected ? (
              <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-10 text-center text-sm text-gray-500">Pick an application to read it.</div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5" data-testid="partner-detail">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-bold text-[#0A1628]">{selected.organisation || selected.name}</h2>
                    <p className="text-sm text-gray-500">{selected.country ?? 'Country not given'}</p>
                  </div>
                  <StatusBadge status={selected.status} />
                </div>

                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                  <div><dt className="text-gray-500">Contact</dt><dd className="font-medium text-[#0A1628]">{selected.name}</dd></div>
                  <div><dt className="text-gray-500">Email</dt><dd><a className="text-[#00B4D8] hover:underline inline-flex items-center gap-1" href={`mailto:${selected.email}`}><Mail className="h-3.5 w-3.5" />{selected.email}</a></dd></div>
                  <div><dt className="text-gray-500">Website</dt><dd>{selected.website && /^https?:\/\//i.test(selected.website) ? <a className="text-[#00B4D8] hover:underline inline-flex items-center gap-1 break-all" href={selected.website} target="_blank" rel="noopener noreferrer nofollow">{selected.website}<ExternalLink className="h-3.5 w-3.5 shrink-0" /></a> : <span className="text-gray-400">{selected.website ? 'not a web address' : 'not given'}</span>}</dd></div>
                  <div><dt className="text-gray-500">Applied</dt><dd className="font-medium text-[#0A1628]">{fmt(selected.created_at)}</dd></div>
                </dl>

                <div className="rounded-xl bg-gray-50 border border-gray-200 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">Business check</p>
                  <RegistrationCheck s={selected} />
                </div>

                <div className="space-y-3 text-sm">
                  <div><p className="text-gray-500">Specialises in</p><p className="text-[#0A1628]">{selected.specialization}</p></div>
                  <div><p className="text-gray-500">Destinations</p><p className="text-[#0A1628]">{selected.destinations_covered}</p></div>
                  {selected.credentials && <div><p className="text-gray-500">Credentials they gave</p><p className="text-[#0A1628]">{selected.credentials}</p></div>}
                  {selected.message && <div><p className="text-gray-500">Their message</p><p className="text-[#0A1628] whitespace-pre-wrap">{selected.message}</p></div>}
                  <div>
                    <p className="text-gray-500">Document</p>
                    {selected.has_document ? (
                      <a className="text-[#00B4D8] hover:underline inline-flex items-center gap-1.5" href={`/api/partners/document?id=${encodeURIComponent(selected.id)}`}>
                        <FileText className="h-4 w-4" /> Download {selected.document_name ?? 'document'}
                      </a>
                    ) : <p className="text-gray-400">none attached</p>}
                  </div>
                </div>

                <div>
                  <label htmlFor="reviewer-notes" className="block text-sm font-semibold text-[#0A1628] mb-1.5">Your notes (only you see these)</label>
                  <textarea
                    id="reviewer-notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    maxLength={2000}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00B4D8]"
                    placeholder="What you checked, what you still need…"
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  {([
                    ['reviewing', 'Mark as reviewing', '#92400e'],
                    ['needs_info', 'Needs more info', '#9a3412'],
                    ['approved', 'Approve', '#14532d'],
                    ['declined', 'Decline', '#991b1b'],
                  ] as const).map(([status, label, color]) => (
                    <button
                      key={status}
                      onClick={() => setStatus(status)}
                      disabled={saving !== null}
                      className="px-4 py-2 rounded-lg text-sm font-semibold border bg-white disabled:opacity-50 hover:bg-gray-50"
                      style={{ color, borderColor: color }}
                    >
                      {saving === status ? 'Saving…' : label}
                    </button>
                  ))}
                </div>
                {selected.reviewed_at && <p className="text-xs text-gray-400">Last reviewed {fmt(selected.reviewed_at)}</p>}
                {message && (
                  <p className={`text-sm flex items-center gap-1.5 ${message.kind === 'ok' ? 'text-green-700' : 'text-red-600'}`}>
                    {message.kind === 'ok' ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />} {message.text}
                  </p>
                )}
                <p className="text-xs text-gray-400">Approving only marks the partner as verified by you. Publishing a partner&apos;s packages comes in the next step.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
