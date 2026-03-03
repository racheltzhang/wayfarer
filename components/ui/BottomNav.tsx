'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  {
    href: '/', label: 'Feed',
    icon: (active: boolean) => (
      <svg viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" width="22" height="22">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" stroke="currentColor" fill="none" />
      </svg>
    ),
  },
  {
    href: '/lists', label: 'My Lists',
    icon: (active: boolean) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="22" height="22">
        <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
        <rect x="9" y="3" width="6" height="4" rx="1" fill={active ? 'currentColor' : 'none'} />
        <line x1="9" y1="12" x2="15" y2="12" /><line x1="9" y1="16" x2="13" y2="16" />
      </svg>
    ),
  },
  {
    href: '/search', label: 'Search',
    icon: (active: boolean) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="22" height="22">
        <circle cx="11" cy="11" r="8" fill={active ? 'currentColor' : 'none'} fillOpacity={active ? 0.15 : 0} />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
  },
  {
    href: '/leaderboard', label: 'Leaders',
    icon: (active: boolean) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="22" height="22">
        <rect x="2"  y="9"  width="5" height="13" rx="1" fill={active ? 'currentColor' : 'none'} fillOpacity={active ? 0.5 : 0} />
        <rect x="9"  y="5"  width="5" height="17" rx="1" fill={active ? 'currentColor' : 'none'} fillOpacity={active ? 0.8 : 0} />
        <rect x="17" y="12" width="5" height="10" rx="1" fill={active ? 'currentColor' : 'none'} fillOpacity={active ? 0.4 : 0} />
      </svg>
    ),
  },
  {
    href: '/profile', label: 'Profile',
    icon: (active: boolean) => (
      <svg viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} fillOpacity={active ? 0.15 : 0} stroke="currentColor" strokeWidth="1.8" width="22" height="22">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      className="flex items-center justify-around h-[64px] flex-shrink-0 relative z-10"
      style={{
        background: 'rgba(11,11,20,0.96)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid var(--border)',
      }}
    >
      {NAV_ITEMS.map(item => {
        const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-medium tracking-wide transition-colors"
            style={{ color: active ? 'var(--gold)' : 'var(--text3)' }}
          >
            <span style={{ color: active ? 'var(--gold)' : 'var(--text3)' }}>
              {item.icon(active)}
            </span>
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
