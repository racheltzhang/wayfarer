'use client'

import { useState } from 'react'
import Link from 'next/link'
import FeedHeader from '@/components/feed/FeedHeader'
import FriendStories from '@/components/feed/FriendStories'
import TripCard from '@/components/feed/TripCard'
import SearchBar from '@/components/ui/SearchBar'
import { useAppState } from '@/lib/app-state'
import { MOCK_TRIPS, MOCK_FRIENDS } from '@/lib/mock-data'

type FeedTab = 'forYou' | 'following' | 'saved' | 'liked'

const TABS: { id: FeedTab; label: string }[] = [
  { id: 'forYou',    label: 'For You' },
  { id: 'following', label: 'Following' },
  { id: 'saved',     label: 'Saved' },
  { id: 'liked',     label: 'Liked' },
]

export default function FeedPage() {
  const [tab,   setTab]   = useState<FeedTab>('forYou')
  const [query, setQuery] = useState('')
  const { likedIds, savedIds, followingIds, publishedTrips } = useAppState()

  // Merge published trips (newest first) with mock trips, de-duping by id
  const allTrips = [
    ...publishedTrips,
    ...MOCK_TRIPS.filter(t => !publishedTrips.some(p => p.id === t.id)),
  ]

  const base = (() => {
    switch (tab) {
      case 'following': return allTrips.filter(t => followingIds.has(t.author.id) || t.author.id === 'me')
      case 'saved':     return allTrips.filter(t => savedIds.has(t.id))
      case 'liked':     return allTrips.filter(t => likedIds.has(t.id))
      default:          return allTrips
    }
  })()

  const trips = query.trim() === ''
    ? base
    : base.filter(t =>
        t.title.toLowerCase().includes(query.toLowerCase()) ||
        t.location.toLowerCase().includes(query.toLowerCase()) ||
        t.tags?.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
      )

  const emptyMsg: Record<FeedTab, { icon: string; title: string; sub: string }> = {
    forYou:    { icon: '✦', title: 'No trips found', sub: 'Try a different search' },
    following: { icon: '👥', title: 'Nothing yet',   sub: 'Follow friends to see their trips here' },
    saved:     { icon: '🔖', title: 'No saves yet',  sub: 'Tap the bookmark on any trip to save it' },
    liked:     { icon: '❤️', title: 'No likes yet',  sub: 'Heart trips you love to see them here' },
  }

  return (
    <div className="flex flex-col flex-1 overflow-y-auto no-scrollbar pb-24 relative">
      <FeedHeader />
      <SearchBar placeholder="Search destinations, trips…" onSearch={setQuery} />

      {/* Friend stories */}
      <div className="flex items-center justify-between px-5 mb-3">
        <h2 className="text-[15px] font-semibold">Friends&apos; Stories</h2>
        <button className="text-xs font-medium" style={{ color: 'var(--gold)' }}>See all</button>
      </div>
      <FriendStories friends={MOCK_FRIENDS} />

      {/* Tab bar */}
      <div className="flex gap-1 px-5 mb-4 overflow-x-auto no-scrollbar">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className="flex-shrink-0 text-xs font-semibold px-4 py-2 rounded-full transition-all"
            style={tab === t.id
              ? { background: 'var(--gold)', color: '#0B0B14' }
              : { background: 'var(--bg3)', color: 'var(--text2)', border: '1px solid var(--border)' }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Feed label */}
      {query && (
        <div className="px-5 mb-3 text-sm font-semibold">Results for &ldquo;{query}&rdquo;</div>
      )}

      {trips.length > 0 ? (
        <div className="flex flex-col px-5">
          {trips.map((trip, i) => (
            <TripCard key={trip.id} trip={trip} animationDelay={i * 60} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
          <div className="text-4xl mb-3">{emptyMsg[tab].icon}</div>
          <div className="text-sm font-semibold mb-1">{emptyMsg[tab].title}</div>
          <div className="text-xs" style={{ color: 'var(--text2)' }}>{emptyMsg[tab].sub}</div>
        </div>
      )}

      {/* Floating Create button */}
      <Link
        href="/create"
        className="fixed flex items-center justify-center rounded-full transition-transform active:scale-95 z-20"
        style={{
          width: 52, height: 52,
          bottom: 80, right: 'calc(50% - 215px + 20px)',
          background: 'var(--gold)',
          boxShadow: '0 4px 20px rgba(212,175,55,0.45)',
        }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="var(--bg)" strokeWidth="2.5" width="22" height="22">
          <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </Link>
    </div>
  )
}
