'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users2,
  BookOpen,
  TrendingUp,
  Mail,
  Zap,
  Settings,
  ChevronLeft,
  ChevronRight,
  Globe,
  UserCircle,
  Briefcase,
  Bot,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  built?: boolean;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'CRM', href: '/dashboard/crm', icon: Briefcase },
  { label: 'Contacts', href: '/dashboard/contacts', icon: Users2 },
  { label: 'Bookings', href: '/dashboard/bookings', icon: BookOpen },
  { label: 'Sales Pipeline', href: '/dashboard/sales', icon: TrendingUp },
  { label: 'Emails', href: '/dashboard/emails', icon: Mail },
  { label: 'Workflows', href: '/dashboard/workflows', icon: Zap },
  { label: 'Research Agents', href: '/dashboard/agents', icon: Bot },
  { label: 'Settings', href: '/dashboard/settings', icon: Settings },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside
        className="flex flex-col flex-shrink-0 transition-all duration-300 ease-in-out"
        style={{
          width: collapsed ? '72px' : '240px',
          background: '#0A1628',
        }}
      >
        {/* Logo */}
        <div
          className="flex items-center px-4 border-b"
          style={{ height: '64px', borderColor: '#152D55' }}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ background: '#FFD700' }}
            >
              <Globe size={20} color="#0A1628" strokeWidth={2.5} />
            </div>
            {!collapsed && (
              <div className="overflow-hidden">
                <span
                  className="block text-sm font-bold tracking-wide truncate"
                  style={{ color: '#FFD700', fontFamily: 'var(--font-display, serif)' }}
                >
                  TRoyGO™
                </span>
                <span className="block text-xs" style={{ color: '#00B4D8' }}>
                  Admin Portal
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 space-y-0.5 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            const content = (
              <>
                <Icon
                  size={18}
                  className="flex-shrink-0"
                  style={{ color: active ? '#00B4D8' : '#6b7280' }}
                />
                {!collapsed && (
                  <span
                    className="text-sm font-medium truncate"
                    style={{ color: active ? '#00B4D8' : '#9ca3af' }}
                  >
                    {item.label}
                  </span>
                )}
                {collapsed && (
                  <div
                    className="absolute left-full ml-3 px-2 py-1 rounded text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50"
                    style={{ background: '#152D55', color: '#ffffff' }}
                  >
                    {item.label}
                  </div>
                )}
              </>
            );
            const sharedStyle = {
              background: active ? 'rgba(0,180,216,0.15)' : 'transparent',
              borderLeft: active ? '3px solid #00B4D8' : '3px solid transparent',
              color: active ? '#00B4D8' : '#9ca3af',
            };
            if (item.built === false) {
              return (
                <button
                  key={item.href}
                  type="button"
                  title={collapsed ? item.label : undefined}
                  onClick={() => setNoticeMessage(`${item.label} isn't built yet — coming soon.`)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 group relative text-left"
                  style={sharedStyle}
                >
                  {content}
                </button>
              );
            }
            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.label : undefined}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 group relative"
                style={sharedStyle}
              >
                {content}
              </Link>
            );
          })}
        </nav>

        {/* User info + collapse button */}
        <div className="border-t p-3" style={{ borderColor: '#152D55' }}>
          {/* User info */}
          <div className="flex items-center gap-3 px-1 mb-3">
            <div
              className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm"
              style={{ background: '#FFD700', color: '#0A1628' }}
            >
              T
            </div>
            {!collapsed && (
              <div className="overflow-hidden">
                <p className="text-sm font-semibold text-white truncate">Troy</p>
                <p className="text-xs truncate" style={{ color: '#FFD700' }}>
                  Owner / Admin
                </p>
              </div>
            )}
          </div>

          {/* Collapse toggle */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center py-2 rounded-lg transition-colors text-xs font-medium"
            style={{
              background: 'rgba(255,255,255,0.05)',
              color: '#6b7280',
            }}
          >
            {collapsed ? (
              <ChevronRight size={16} />
            ) : (
              <>
                <ChevronLeft size={16} className="mr-1" />
                <span>Collapse</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header
          className="flex-shrink-0 flex items-center justify-between px-6 border-b bg-white"
          style={{ height: '64px', borderColor: '#e5e7eb' }}
        >
          <div>
            <h2 className="text-base font-semibold" style={{ color: '#0A1628' }}>
              {navItems.find((n) => isActive(n.href))?.label ?? 'Dashboard'}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <div
              className="text-xs px-2 py-1 rounded-full font-medium"
              style={{ background: '#f0fdf4', color: '#16a34a' }}
            >
              ● Live
            </div>
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
              style={{ background: '#0A1628', color: '#FFD700' }}
            >
              T
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </main>

      {noticeMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <p className="text-sm text-gray-600 mb-5">{noticeMessage}</p>
            <button
              onClick={() => setNoticeMessage(null)}
              className="w-full py-2.5 rounded-xl font-semibold text-sm"
              style={{ background: '#0A1628', color: '#FFD700' }}
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
