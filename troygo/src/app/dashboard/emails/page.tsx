'use client'

import { useState, useEffect, useCallback } from 'react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { emailTemplates } from '@/lib/data/emailTemplates'
import { Send, Mail, Search, Plus, Eye, Clock, CheckCheck } from 'lucide-react'
import { format } from 'date-fns'

interface ContactOption {
  id: string
  firstName: string
  lastName: string
  email: string
}

interface SentEmail {
  id: string
  to: string
  subject: string
  status: 'sent' | 'failed'
  error: string | null
  sentAt: string
}

// Real statuses only - "sent" or "failed". No fabricated "opened"/"clicked"
// engagement data, since there's no real open/click tracking wired up.
const STATUS_STYLES: Record<string, string> = {
  sent: 'bg-green-50 text-green-700',
  failed: 'bg-red-50 text-red-700',
}

export default function EmailsPage() {
  const [contacts, setContacts] = useState<ContactOption[]>([])
  const [emails, setEmails] = useState<SentEmail[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [toSearch, setToSearch] = useState('')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [previewTemplate, setPreviewTemplate] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [activeTab, setActiveTab] = useState<'compose' | 'templates' | 'history'>('compose')
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [contactsRes, emailsRes] = await Promise.all([
        fetch('/api/contacts'),
        fetch('/api/emails'),
      ])
      const contactsJson = await contactsRes.json()
      const emailsJson = await emailsRes.json()
      if (contactsJson.success) setContacts(contactsJson.contacts)
      if (emailsJson.success) setEmails(emailsJson.emails)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  function loadTemplate(templateId: string) {
    const t = emailTemplates.find((e) => e.id === templateId)
    if (t) {
      setSubject(t.subject)
      setBody(t.body)
      setSelectedTemplate(templateId)
    }
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    setSending(true)
    setNoticeMessage(null)
    try {
      const res = await fetch('/api/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: toSearch, subject, body }),
      })
      const json = await res.json()
      if (!json.success) {
        setNoticeMessage(json.error ?? 'Failed to send email.')
        return
      }
      setSent(true)
      setSubject('')
      setBody('')
      setToSearch('')
      setSelectedTemplate('')
      await load()
      setTimeout(() => setSent(false), 3000)
    } catch {
      setNoticeMessage('Failed to send email — check your connection.')
    } finally {
      setSending(false)
    }
  }

  const filteredContacts = contacts
    .filter((c) => c.email.toLowerCase().includes(toSearch.toLowerCase()) || `${c.firstName} ${c.lastName}`.toLowerCase().includes(toSearch.toLowerCase()))
    .slice(0, 5)

  return (
    <DashboardLayout>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-black text-[#0A1628]">Email Center</h1>
          <button
            onClick={() => setNoticeMessage('Creating custom templates isn\'t built yet — pick from the existing templates in the Templates tab for now.')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white"
            style={{ background: '#00B4D8' }}
          >
            <Plus className="h-4 w-4" /> New Template
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-0 border-b border-gray-200 mb-6">
          {(['compose', 'templates', 'history'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-3 text-sm font-semibold capitalize border-b-2 transition-colors ${
                activeTab === tab ? 'border-[#00B4D8] text-[#00B4D8]' : 'border-transparent text-gray-500 hover:text-[#0A1628]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Compose */}
        {activeTab === 'compose' && (
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-bold text-[#0A1628] text-base mb-4 flex items-center gap-2">
                <Mail className="h-5 w-5 text-[#00B4D8]" /> Compose Email
              </h2>
              <form onSubmit={handleSend} className="space-y-4">
                {/* To */}
                <div className="relative">
                  <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">To</label>
                  <input
                    type="text"
                    placeholder="Search contacts or enter email…"
                    value={toSearch}
                    onChange={(e) => setToSearch(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#00B4D8]/40"
                  />
                  {toSearch && filteredContacts.length > 0 && (
                    <div className="absolute top-full mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg z-10 overflow-hidden">
                      {filteredContacts.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => setToSearch(c.email)}
                          className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center gap-2"
                        >
                          <span className="w-6 h-6 rounded-full bg-[#00B4D8]/20 text-[#00B4D8] text-xs font-bold flex items-center justify-center shrink-0">
                            {c.firstName[0]}
                          </span>
                          <span className="font-medium text-[#0A1628]">{c.firstName} {c.lastName}</span>
                          <span className="text-gray-400">{c.email}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Template */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Template (optional)</label>
                  <select
                    value={selectedTemplate}
                    onChange={(e) => loadTemplate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#00B4D8]/40"
                  >
                    <option value="">Select a template…</option>
                    {emailTemplates.map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Subject</label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#00B4D8]/40"
                    placeholder="Email subject…"
                  />
                </div>

                {/* Body */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Message</label>
                  <textarea
                    required
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    rows={8}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#00B4D8]/40"
                    placeholder="Write your email or load a template above…"
                  />
                </div>

                {noticeMessage && (
                  <p className="text-red-500 text-xs">{noticeMessage}</p>
                )}

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={sending}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white hover:opacity-90 transition-all disabled:opacity-50"
                    style={{ background: '#00B4D8' }}
                  >
                    <Send className="h-4 w-4" />
                    {sending ? 'Sending…' : sent ? 'Sent!' : 'Send Email'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setNoticeMessage('Scheduled sending isn\'t built yet — use Send Email to send right away.')}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm border border-gray-200 text-gray-600 hover:border-[#00B4D8] transition-colors"
                  >
                    <Clock className="h-4 w-4" /> Schedule
                  </button>
                </div>
              </form>
            </div>

            {/* Sent history preview */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-bold text-[#0A1628] text-base mb-4 flex items-center gap-2">
                <CheckCheck className="h-5 w-5 text-[#00B4D8]" /> Recent Emails
              </h2>
              <div className="space-y-3">
                {loading ? (
                  <p className="text-sm text-gray-400 text-center py-6">Loading…</p>
                ) : emails.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-6">No emails sent yet</p>
                ) : (
                  emails.slice(0, 5).map((email) => (
                    <div key={email.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group">
                      <div className="w-8 h-8 rounded-full bg-[#00B4D8]/10 flex items-center justify-center shrink-0">
                        <Mail className="h-4 w-4 text-[#00B4D8]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#0A1628] truncate">{email.subject}</p>
                        <p className="text-xs text-gray-400 truncate">To: {email.to}</p>
                        <p className="text-xs text-gray-400">{format(new Date(email.sentAt), 'MMM d, yyyy HH:mm')}</p>
                      </div>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_STYLES[email.status]}`}>
                        {email.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Templates */}
        {activeTab === 'templates' && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {emailTemplates.map((template) => (
              <div key={template.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-[#0A1628] text-sm">{template.name}</h3>
                    <span className="text-xs bg-[#00B4D8]/10 text-[#00B4D8] font-medium px-2 py-0.5 rounded-full mt-1 inline-block">
                      {template.category}
                    </span>
                  </div>
                  <button
                    onClick={() => setPreviewTemplate(previewTemplate === template.id ? null : template.id)}
                    className="text-gray-400 hover:text-[#00B4D8] transition-colors"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-xs text-gray-500 mb-3 truncate">Subject: {template.subject}</p>
                {previewTemplate === template.id && (
                  <div className="bg-gray-50 rounded-xl p-3 mb-3 text-xs text-gray-600 max-h-32 overflow-y-auto">
                    {template.body}
                  </div>
                )}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {template.variables.map((v) => (
                    <span key={v} className="text-xs bg-[#FFD700]/20 text-[#0A1628] px-1.5 py-0.5 rounded font-mono">{v}</span>
                  ))}
                </div>
                <button
                  onClick={() => { loadTemplate(template.id); setActiveTab('compose') }}
                  className="w-full py-2 rounded-xl text-xs font-bold text-white"
                  style={{ background: '#00B4D8' }}
                >
                  Use Template
                </button>
              </div>
            ))}
          </div>
        )}

        {/* History */}
        {activeTab === 'history' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center gap-3">
              <Search className="h-4 w-4 text-gray-400" />
              <input type="text" placeholder="Search email history…" className="flex-1 text-sm focus:outline-none" />
            </div>
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {['To', 'Subject', 'Sent', 'Status'].map((h) => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {emails.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-gray-400 text-sm">
                      {loading ? 'Loading…' : 'No emails sent yet'}
                    </td>
                  </tr>
                )}
                {emails.map((email) => (
                  <tr key={email.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-600">{email.to}</td>
                    <td className="px-4 py-3 text-sm font-medium text-[#0A1628] max-w-xs truncate">{email.subject}</td>
                    <td className="px-4 py-3 text-xs text-gray-400">{format(new Date(email.sentAt), 'MMM d, yyyy HH:mm')}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_STYLES[email.status]}`}>
                        {email.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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
  )
}
