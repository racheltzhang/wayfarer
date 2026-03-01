import FeedHeader from '@/components/feed/FeedHeader'
import FriendStories from '@/components/feed/FriendStories'
import TripCard from '@/components/feed/TripCard'
import SearchBar from '@/components/ui/SearchBar'
import { MOCK_TRIPS, MOCK_FRIENDS } from '@/lib/mock-data'

export default function FeedPage() {
  return (
    <div className="flex flex-col flex-1 overflow-y-auto no-scrollbar pb-20">
      <FeedHeader />
      <SearchBar placeholder="Search destinations, trips, friends…" />

      {/* Friend stories */}
      <div className="flex items-center justify-between px-5 mb-3">
        <h2 className="text-[15px] font-semibold">Friends&apos; Stories</h2>
        <button className="text-xs font-medium" style={{ color: 'var(--gold)' }}>See all</button>
      </div>
      <FriendStories friends={MOCK_FRIENDS} />

      {/* Feed */}
      <div className="flex items-center justify-between px-5 mb-4">
        <h2 className="text-[15px] font-semibold">Trending This Week</h2>
        <button className="text-xs font-medium" style={{ color: 'var(--gold)' }}>Filter</button>
      </div>
      <div className="flex flex-col gap-0 px-5">
        {MOCK_TRIPS.map((trip, i) => (
          <TripCard key={trip.id} trip={trip} animationDelay={i * 80} />
        ))}
      </div>
    </div>
  )
}
