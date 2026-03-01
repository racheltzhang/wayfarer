import Link from 'next/link'
import Image from 'next/image'
import { MOCK_TRIPS } from '@/lib/mock-data'
import { formatRating } from '@/lib/utils'

const STATS = [
  { value: '7', label: 'Trips' },
  { value: '24', label: 'Countries' },
  { value: '9.1', label: 'Avg Rating' },
]

export default function TripsPage() {
  const saved = MOCK_TRIPS.filter(t => t.is_saved)

  return (
    <div className="flex flex-col flex-1 overflow-y-auto no-scrollbar pb-20">
      {/* Header */}
      <div className="px-5 pt-14 pb-4 flex items-start justify-between">
        <div>
          <h1 className="font-head text-[26px] font-normal">My Journeys</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text2)' }}>Your travel story</p>
        </div>
        <Link href="/create">
          <button className="btn-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2.5 px-5 mb-5">
        {STATS.map(s => (
          <div key={s.label} className="card-sm p-3.5 text-center">
            <div className="font-head text-[26px] leading-none" style={{ color: 'var(--gold)' }}>{s.value}</div>
            <div className="text-[10px] uppercase tracking-wide mt-1" style={{ color: 'var(--text3)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Saved */}
      <div className="flex items-center justify-between px-5 mb-3">
        <h2 className="text-[15px] font-semibold">Saved Itineraries</h2>
        <button className="text-xs font-medium" style={{ color: 'var(--gold)' }}>Sort</button>
      </div>

      <div className="flex flex-col gap-4 px-5">
        {saved.map(trip => (
          <Link key={trip.id} href={`/trip/${trip.id}`}>
            <div className="card overflow-hidden active:scale-[0.98] transition-transform">
              <div className="relative h-[160px]">
                {trip.cover_image_url && (
                  <Image src={trip.cover_image_url} alt={trip.title} fill className="object-cover" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div
                  className="absolute top-3 right-3 flex items-center gap-1 text-xs font-semibold rounded-full px-2.5 py-1"
                  style={{ background: 'rgba(11,11,20,0.75)', backdropFilter: 'blur(8px)', border: '1px solid var(--border)', color: 'var(--gold-lt)' }}
                >
                  <span>★</span> {formatRating(trip.rating)}
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-head text-[18px] font-normal">{trip.title}</h3>
                <div className="flex items-center gap-1 text-xs mt-1" style={{ color: 'var(--text2)' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                  </svg>
                  {trip.location}
                </div>
                <div className="flex gap-2 mt-3">
                  <span className="chip">{trip.duration_days} days</span>
                  <span className="chip">by {trip.author.full_name.split(' ')[0]}</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
