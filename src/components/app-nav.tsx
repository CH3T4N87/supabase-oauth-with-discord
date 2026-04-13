'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { getToken, logout } from '@/lib/auth';
import { AppButton } from './ui';

interface Me {
  username: string;
  isOwner?: boolean;
}

const links = [
  { href: '/', label: 'Home' },
  { href: '/listings', label: 'Listings' },
  { href: '/profiles', label: 'Profiles' },
  { href: '/rooms', label: 'Rooms' },
  { href: '/dashboard', label: 'Dashboard' }
];

export default function AppNav() {
  const pathname = usePathname();
  const [me, setMe] = useState<Me | null>(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isQuickNavOpen, setIsQuickNavOpen] = useState(false);
  const [quickFilter, setQuickFilter] = useState('');
  const isLoggedIn = !!getToken();

  useEffect(() => {
    if (!isLoggedIn) return;
    api.get('/auth/me').then((res) => setMe(res.data)).catch(() => setMe(null));
  }, [isLoggedIn]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsQuickNavOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsQuickNavOpen(false);
        setIsMobileOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const quickLinks = [...links, ...(me?.isOwner ? [{ href: '/admin', label: 'Admin' }] : [])].filter((l) =>
    l.label.toLowerCase().includes(quickFilter.toLowerCase())
  );

  const renderNavLinks = (onNavigate?: () => void) => (
    <>
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          onClick={onNavigate}
          className={`px-3 py-2 rounded-md transition ${
            pathname === link.href ? 'bg-cyan-900/40 text-cyan-200' : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          {link.label}
        </Link>
      ))}
      {me?.isOwner && (
        <Link
          href="/admin"
          onClick={onNavigate}
          className={`px-3 py-2 rounded-md transition ${
            pathname === '/admin' ? 'bg-amber-900/40 text-amber-200' : 'text-amber-300 hover:bg-amber-900/20'
          }`}
        >
          Admin
        </Link>
      )}
    </>
  );

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/90 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => setIsMobileOpen(true)}
            className="md:hidden rounded-md border border-slate-700 px-2 py-1 text-slate-300"
          >
            ☰
          </button>
          <Link href="/" className="font-extrabold tracking-wide text-cyan-300">ESPORTS HQ</Link>
          <nav className="hidden md:flex flex-wrap items-center gap-1 text-sm">
            {renderNavLinks()}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => setIsQuickNavOpen(true)}
              className="hidden md:inline-flex rounded-md border border-slate-700 px-3 py-1 text-xs text-slate-300 hover:text-white"
            >
              Quick Nav Ctrl+K
            </button>
            {isLoggedIn ? (
              <>
                <span className="text-xs text-slate-400 hidden lg:inline">{me?.username || 'Signed in'}</span>
                <AppButton variant="secondary" className="text-xs px-3 py-1" onClick={logout}>
                  Logout
                </AppButton>
              </>
            ) : (
              <Link href="/login" className="bg-cyan-600 hover:bg-cyan-700 text-xs px-3 py-1 rounded-md">
                Sign In
              </Link>
            )}
          </div>
        </div>
      </header>

      {isMobileOpen && (
        <div className="fixed inset-0 z-[60] bg-black/60 md:hidden" onClick={() => setIsMobileOpen(false)}>
          <aside
            className="w-72 h-full bg-slate-950 border-r border-slate-800 p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-xs uppercase tracking-wider text-slate-500 mb-3">Navigation</p>
            <nav className="flex flex-col gap-1 text-sm">
              {renderNavLinks(() => setIsMobileOpen(false))}
            </nav>
            <button
              onClick={() => {
                setIsMobileOpen(false);
                setIsQuickNavOpen(true);
              }}
              className="mt-4 w-full rounded-md border border-slate-700 px-3 py-2 text-left text-slate-300"
            >
              Open Quick Nav
            </button>
          </aside>
        </div>
      )}

      {isQuickNavOpen && (
        <div className="fixed inset-0 z-[70] bg-black/60 flex items-start justify-center p-4" onClick={() => setIsQuickNavOpen(false)}>
          <div
            className="w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-950 p-3 mt-20"
            onClick={(e) => e.stopPropagation()}
          >
            <input
              autoFocus
              value={quickFilter}
              onChange={(e) => setQuickFilter(e.target.value)}
              placeholder="Jump to page..."
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-cyan-500"
            />
            <div className="mt-2 max-h-64 overflow-auto space-y-1">
              {quickLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => {
                    setIsQuickNavOpen(false);
                    setQuickFilter('');
                  }}
                  className="block rounded-md px-3 py-2 text-sm text-slate-200 hover:bg-slate-800"
                >
                  {link.label}
                </Link>
              ))}
              {quickLinks.length === 0 && <p className="text-xs text-slate-500 p-2">No matches</p>}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
