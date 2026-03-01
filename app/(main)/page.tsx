'use client'

import { useState } from 'react'
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
  const { likedIds, savedIds, followingIds } = useAppState()

  const base = (() => {
    switch (tab) {
      case 'following': return MOCK_TRIPS.filter(t => followingIds.has(t.author.id))
      case 'saved':     return MOCK_TRIPS.filter(t => savedIds.has(t.id))
      case 'liked':     return MOCK_TRIPS.filter(t => likedIds.has(t.id))
      default:          return MOCK_TRIPS
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
    <div className="flex flex-col flex-1 overflow-y-auto no-scrollbar pb-20">
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
    </div>
  )
}
