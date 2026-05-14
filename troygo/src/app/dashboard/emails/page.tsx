'use client'

import { useState } from 'react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { emailTemplates } from '@/lib/data/emailTemplates'
import { contacts } from '@/lib/data/crm'
import { Send, Mail, Search, Plus, Eye, Clock, CheckCheck } from 'lucide-react'

const SENT_HISTORY = [
  { id: 1, to: 'john.doe@email.com', subject: 'Your Quote for Bali Paradise Package', status: 'opened', sentAt: '2026-05-13 10:24', openRate: true },
  { id: 2, to: 'sarah.m@email.com', subject: 'Booking Confirmation – Europe Grand Tour', status: 'clicked', sentAt: '2026-05-13 09:10', openRate: true },
  { id: 3, to: 'carlos.r@email.com', subject: 'Pre-Trip Checklist: Japan Cultural 2026', status: 'sent', sentAt: '2026-05-12 16:45', openRate: false },
  { id: 4, to: 'ana.p@email.com', subject: 'Thank You for Traveling with TRoyGO™', status: 'opened', sentAt: '2026-05-12 11:00', openRate: true },
  { id: 5, to: 'mike.t@email.com', subject: 'Inquiry Received – Caribbean Cruise', status: 'sent', sentAt: '2026-05-11 14:30', openRate: false },
]

const STATUS_STYLES: Record<string, string> = {
  sent: 'bg-gray-100 text-gray-600',
  opened: 'bg-blue-50 text-blue-700',
  clicked: 'bg-green-50 text-green-700',
}

export default function EmailsPage() {
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [toSearch, setToSearch] = useState('')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [previewTemplate, setPreviewTemplate] = useState<string | null>(null)
  const [sent, setSent] = useState(false)
  const [activeTab, setActiveTab] = useState<'compose' | 'templates' | 'history'>('compose')

  function loadTemplate(templateId: string) {
    const t = emailTemplates.find((e) => e.id === templateId)
    if (t) {
      setSubject(t.subject)
      setBody(t.body)
      setSelectedTemplate(templateId)
    }
  }

  function handleSend(e: React.FormEvent) {
    e.preventDefault()
    setSent(true)
    setTimeout(() => setSent(false), 3000)
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

                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white hover:opacity-90 transition-all"
                    style={{ background: '#00B4D8' }}
                  >
                    <Send className="h-4 w-4" />
                    {sent ? 'Sent!' : 'Send Email'}
                  </button>
                  <button type="button" className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm border border-gray-200 text-gray-600 hover:border-[#00B4D8] transition-colors">
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
                {SENT_HISTORY.map((email) => (
                  <div key={email.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group">
                    <div className="w-8 h-8 rounded-full bg-[#00B4D8]/10 flex items-center justify-center shrink-0">
                      <Mail className="h-4 w-4 text-[#00B4D8]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#0A1628] truncate">{email.subject}</p>
                      <p className="text-xs text-gray-400 truncate">To: {email.to}</p>
                      <p className="text-xs text-gray-400">{email.sentAt}</p>
                    </div>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_STYLES[email.status]}`}>
                      {email.status}
                    </span>
                  </div>
                ))}
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
                {SENT_HISTORY.map((email) => (
                  <tr key={email.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-600">{email.to}</td>
                    <td className="px-4 py-3 text-sm font-medium text-[#0A1628] max-w-xs truncate">{email.subject}</td>
                    <td className="px-4 py-3 text-xs text-gray-400">{email.sentAt}</td>
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
    </DashboardLayout>
  )
}
