'use client'

import { useState } from 'react'
import FeedHeader from '@/components/feed/FeedHeader'
import FriendStories from '@/components/feed/FriendStories'
import TripCard from '@/components/feed/TripCard'
import SearchBar from '@/components/ui/SearchBar'
import { MOCK_TRIPS, MOCK_FRIENDS } from '@/lib/mock-data'

export default function FeedPage() {
  const [query, setQuery] = useState('')

  const trips = query.trim() === ''
    ? MOCK_TRIPS
    : MOCK_TRIPS.filter(t =>
        t.title.toLowerCase().includes(query.toLowerCase()) ||
        t.location.toLowerCase().includes(query.toLowerCase()) ||
        t.tags?.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
      )

  return (
    <div className="flex flex-col flex-1 overflow-y-auto no-scrollbar pb-20">
      <FeedHeader />
      <SearchBar
        placeholder="Search destinations, trips, friends…"
        onSearch={setQuery}
      />

      {/* Friend stories */}
      <div className="flex items-center justify-between px-5 mb-3">
        <h2 className="text-[15px] font-semibold">Friends&apos; Stories</h2>
        <button className="text-xs font-medium" style={{ color: 'var(--gold)' }}>See all</button>
      </div>
      <FriendStories friends={MOCK_FRIENDS} />

      {/* Feed */}
      <div className="flex items-center justify-between px-5 mb-4">
        <h2 className="text-[15px] font-semibold">
          {query ? `Results for "${query}"` : 'Trending This Week'}
        </h2>
        {!query && (
          <button className="text-xs font-medium" style={{ color: 'var(--gold)' }}>Filter</button>
        )}
      </div>

      {trips.length > 0 ? (
        <div className="flex flex-col gap-0 px-5">
          {trips.map((trip, i) => (
            <TripCard key={trip.id} trip={trip} animationDelay={i * 80} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
          <div className="text-4xl mb-3">✦</div>
          <div className="text-sm font-semibold mb-1">No trips found</div>
          <div className="text-xs" style={{ color: 'var(--text2)' }}>
            Try searching for a city or country
          </div>
        </div>
      )}
    </div>
  )
}
