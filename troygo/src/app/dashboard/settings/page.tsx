'use client';

import { useState, useEffect } from 'react';
import { Save, Loader2, CheckCircle2, Building2, Bell, Hash } from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

interface Settings {
  business_name: string;
  abn: string;
  notification_email: string;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setSettings(data.settings);
        else setError('Failed to load settings.');
      })
      .catch(() => setError('Failed to load settings.'));
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    setError('');
    setSaved(false);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error ?? 'Failed to save settings.');
        return;
      }
      setSettings(data.settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  if (!settings) {
    return (
      <DashboardLayout>
        <div className="p-8 flex items-center justify-center text-gray-400">
          <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading settings...
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 sm:p-8 max-w-2xl">
        <h1 className="text-2xl font-bold text-[#0A1628] mb-1">Settings</h1>
        <p className="text-sm text-gray-500 mb-8">
          Real settings, stored in the database — changes take effect immediately.
        </p>

        <form onSubmit={handleSave} className="space-y-8">
          <section className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="h-4 w-4 text-[#00B4D8]" />
              <h2 className="text-sm font-bold text-[#0A1628] uppercase tracking-wide">
                Business Info
              </h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5" htmlFor="business_name">
                  Business Name
                </label>
                <input
                  id="business_name"
                  value={settings.business_name}
                  onChange={(e) => setSettings({ ...settings, business_name: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00B4D8]"
                />
                <p className="text-xs text-gray-400 mt-1">Shown in the site footer.</p>
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 mb-1.5" htmlFor="abn">
                  <Hash className="h-3 w-3" /> ABN
                </label>
                <input
                  id="abn"
                  value={settings.abn}
                  onChange={(e) => setSettings({ ...settings, abn: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00B4D8]"
                />
              </div>
            </div>
          </section>

          <section className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Bell className="h-4 w-4 text-[#00B4D8]" />
              <h2 className="text-sm font-bold text-[#0A1628] uppercase tracking-wide">
                Notifications
              </h2>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5" htmlFor="notification_email">
                Booking Notification Email
              </label>
              <input
                id="notification_email"
                type="email"
                value={settings.notification_email}
                onChange={(e) => setSettings({ ...settings, notification_email: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00B4D8]"
              />
              <p className="text-xs text-gray-400 mt-1">
                Every new booking inquiry sends a notification here.
              </p>
            </div>
          </section>

          {error && <p className="text-sm text-red-600 font-medium">{error}</p>}

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-full bg-[#0A1628] text-white font-semibold px-6 py-3 text-sm hover:bg-[#152D55] transition-colors disabled:opacity-60"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Changes
            </button>
            {saved && (
              <span className="flex items-center gap-1.5 text-sm text-green-600 font-medium">
                <CheckCircle2 className="h-4 w-4" /> Saved
              </span>
            )}
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
