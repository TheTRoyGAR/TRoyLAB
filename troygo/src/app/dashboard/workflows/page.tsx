'use client'

import { useState } from 'react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { Plus, Zap, Mail, Bell, RefreshCw, Play, Pause, ChevronRight } from 'lucide-react'

interface Workflow {
  id: string
  name: string
  trigger: string
  action: string
  active: boolean
  lastTriggered: string
  timesRun: number
  color: string
}

const INITIAL_WORKFLOWS: Workflow[] = [
  { id: '1', name: 'New Inquiry Auto-Reply', trigger: 'Booking inquiry received', action: 'Send inquiry acknowledgment email', active: true, lastTriggered: '2 hours ago', timesRun: 247, color: '#00B4D8' },
  { id: '2', name: 'Quote Follow-Up', trigger: 'Quote sent (no reply after 48h)', action: 'Send follow-up email + create task', active: true, lastTriggered: '5 hours ago', timesRun: 89, color: '#8B5CF6' },
  { id: '3', name: 'Booking Confirmed Itinerary', trigger: 'Booking status → Confirmed', action: 'Send full itinerary + pre-trip guide', active: true, lastTriggered: '1 day ago', timesRun: 154, color: '#10B981' },
  { id: '4', name: 'Pre-Departure Checklist', trigger: '7 days before departure date', action: 'Send pre-trip checklist email', active: true, lastTriggered: '3 days ago', timesRun: 73, color: '#F59E0B' },
  { id: '5', name: 'Post-Trip Review Request', trigger: '2 days after return date', action: 'Send review request email', active: true, lastTriggered: '1 week ago', timesRun: 61, color: '#EF4444' },
  { id: '6', name: 'Stale Lead Alert', trigger: 'Lead inactive for 14+ days', action: 'Alert assigned agent + update status', active: false, lastTriggered: 'Never', timesRun: 0, color: '#6B7280' },
]

const TRIGGER_OPTIONS = [
  'Booking inquiry received',
  'Quote sent',
  'Booking confirmed',
  'Payment received',
  'Lead created',
  'Lead inactive 14+ days',
  'N days before departure',
  'N days after return',
  'Contact status changed',
]

const ACTION_OPTIONS = [
  'Send email (select template)',
  'Create follow-up task',
  'Update contact status',
  'Send internal notification',
  'Add contact tag',
  'Create booking record',
]

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState(INITIAL_WORKFLOWS)
  const [showCreate, setShowCreate] = useState(false)
  const [newWf, setNewWf] = useState({ name: '', trigger: '', action: '' })

  function toggleActive(id: string) {
    setWorkflows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, active: !w.active } : w))
    )
  }

  function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setWorkflows((prev) => [
      ...prev,
      {
        id: String(prev.length + 1),
        name: newWf.name,
        trigger: newWf.trigger,
        action: newWf.action,
        active: true,
        lastTriggered: 'Never',
        timesRun: 0,
        color: '#00B4D8',
      },
    ])
    setNewWf({ name: '', trigger: '', action: '' })
    setShowCreate(false)
  }

  const activeCount = workflows.filter((w) => w.active).length
  const totalRuns = workflows.reduce((sum, w) => sum + w.timesRun, 0)

  return (
    <DashboardLayout>
      <div className="p-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black text-[#0A1628]">Workflow Automation</h1>
            <p className="text-sm text-gray-500 mt-0.5">Automate repetitive tasks and keep every traveller informed.</p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white"
            style={{ background: '#00B4D8' }}
          >
            <Plus className="h-4 w-4" /> Create Workflow
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Active Workflows', value: activeCount, icon: Zap, color: '#00B4D8' },
            { label: 'Total Runs', value: totalRuns.toLocaleString(), icon: RefreshCw, color: '#10B981' },
            { label: 'Emails Automated', value: (totalRuns * 0.8).toFixed(0), icon: Mail, color: '#8B5CF6' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${stat.color}20` }}>
                  <stat.icon className="h-5 w-5" style={{ color: stat.color }} />
                </div>
                <div>
                  <p className="text-2xl font-black text-[#0A1628]">{stat.value}</p>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Workflow list */}
        <div className="space-y-4">
          {workflows.map((wf) => (
            <div
              key={wf.id}
              className={`bg-white rounded-2xl shadow-sm border transition-all ${
                wf.active ? 'border-gray-100' : 'border-gray-100 opacity-60'
              }`}
            >
              <div className="p-5 flex items-start gap-4">
                {/* Color dot */}
                <div
                  className="w-3 h-3 rounded-full mt-1.5 shrink-0"
                  style={{ background: wf.active ? wf.color : '#9CA3AF' }}
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <h3 className="font-bold text-[#0A1628] text-sm">{wf.name}</h3>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${wf.active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {wf.active ? 'Active' : 'Paused'}
                    </span>
                  </div>

                  {/* Trigger → Action */}
                  <div className="flex items-center gap-2 text-xs text-gray-500 flex-wrap">
                    <span className="bg-gray-100 px-2 py-1 rounded-lg font-medium">
                      ⚡ {wf.trigger}
                    </span>
                    <ChevronRight className="h-3 w-3 text-gray-400 shrink-0" />
                    <span className="bg-[#00B4D8]/10 text-[#00B4D8] px-2 py-1 rounded-lg font-medium">
                      {wf.action}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  {/* Stats */}
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-bold text-[#0A1628]">{wf.timesRun.toLocaleString()}</p>
                    <p className="text-xs text-gray-400">runs</p>
                    <p className="text-xs text-gray-400 mt-0.5">{wf.lastTriggered}</p>
                  </div>

                  {/* Toggle */}
                  <button
                    onClick={() => toggleActive(wf.id)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-colors ${
                      wf.active
                        ? 'border-orange-200 text-orange-600 hover:bg-orange-50'
                        : 'border-green-200 text-green-600 hover:bg-green-50'
                    }`}
                  >
                    {wf.active ? (
                      <><Pause className="h-3 w-3" /> Pause</>
                    ) : (
                      <><Play className="h-3 w-3" /> Activate</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Create workflow modal */}
        {showCreate && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
              <h2 className="font-black text-[#0A1628] text-xl mb-5">Create Workflow</h2>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Workflow Name</label>
                  <input
                    type="text"
                    required
                    value={newWf.name}
                    onChange={(e) => setNewWf({ ...newWf, name: e.target.value })}
                    placeholder="e.g. VIP Customer Welcome"
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#00B4D8]/40"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Trigger Event</label>
                  <select
                    required
                    value={newWf.trigger}
                    onChange={(e) => setNewWf({ ...newWf, trigger: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#00B4D8]/40"
                  >
                    <option value="">Select trigger…</option>
                    {TRIGGER_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Action</label>
                  <select
                    required
                    value={newWf.action}
                    onChange={(e) => setNewWf({ ...newWf, action: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#00B4D8]/40"
                  >
                    <option value="">Select action…</option>
                    {ACTION_OPTIONS.map((a) => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl font-bold text-sm text-white"
                    style={{ background: '#00B4D8' }}
                  >
                    Create Workflow
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreate(false)}
                    className="flex-1 py-2.5 rounded-xl font-bold text-sm border border-gray-200 text-gray-600 hover:border-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
