'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useAppState } from '@/lib/app-state'
import { MOCK_TRIPS, MOCK_PROFILES } from '@/lib/mock-data'
import type { Trip } from '@/lib/types'

type ListTab = 'been' | 'upcoming' | 'saved' | 'recs' | 'guides'

// ── Mock data for Recs and Guides ─────────────────────────────

const REC_TRIPS: Trip[] = [
  {
    id: 'rec-1',
    title: 'Osaka Food & Culture',
    location: 'Osaka, Japan',
    country_emoji: '🇯🇵',
    duration_days: 5,
    cover_image_url: 'https://picsum.photos/seed/osaka11/800/500',
    description: 'Based on your Tokyo trip — Osaka is next level for food lovers. Dotonbori at night is unmissable.',
    visibility: 'public',
    rating: 9.2,
    rating_count: 44,
    like_count: 187,
    tags: ['foodie', 'culture', 'city'],
    lat: 34.69, lng: 135.50,
    author: MOCK_PROFILES[0],
    is_liked: false,
    is_saved: false,
    created_at: '2024-10-05',
    days: [],
  },
  {
    id: 'rec-2',
    title: 'Santorini Sunsets',
    location: 'Santorini, Greece',
    country_emoji: '🇬🇷',
    duration_days: 6,
    cover_image_url: 'https://picsum.photos/seed/santorini44/800/500',
    description: 'You love coastal trips — Oia\'s caldera views and wine tastings will be perfect for you.',
    visibility: 'public',
    rating: 9.5,
    rating_count: 82,
    like_count: 411,
    tags: ['romantic', 'outdoors', 'island'],
    lat: 36.39, lng: 25.46,
    author: MOCK_PROFILES[2],
    is_liked: false,
    is_saved: false,
    created_at: '2024-09-20',
    days: [],
  },
  {
    id: 'rec-3',
    title: 'Marrakech Medina Weekend',
    location: 'Marrakech, Morocco',
    country_emoji: '🇲🇦',
    duration_days: 4,
    cover_image_url: 'https://picsum.photos/seed/marrakech88/800/500',
    description: 'Your friends have been loving Morocco — the souks and riad stays are unlike anywhere.',
    visibility: 'public',
    rating: 8.8,
    rating_count: 31,
    like_count: 143,
    tags: ['culture', 'food', 'city'],
    lat: 31.63, lng: -8.00,
    author: MOCK_PROFILES[1],
    is_liked: false,
    is_saved: false,
    created_at: '2024-11-10',
    days: [],
  },
]

const GUIDE_TRIPS = [
  {
    id: 'guide-1',
    title: 'First Time in Japan: Complete Guide',
    subtitle: 'Everything from JR Pass to pocket WiFi',
    cover_image_url: 'https://picsum.photos/seed/japanguide/800/500',
    tag: '🗾 Japan',
    readTime: '12 min read',
    author: 'Wayfarer Editorial',
  },
  {
    id: 'guide-2',
    title: 'Southeast Asia on a Budget',
    subtitle: 'Thailand → Vietnam → Indonesia — 30 days, done right',
    cover_image_url: 'https://picsum.photos/seed/seaguide/800/500',
    tag: '🌏 SE Asia',
    readTime: '8 min read',
    author: 'Maya Chen',
  },
  {
    id: 'guide-3',
    title: 'Solo Female Travel: Europe Edition',
    subtitle: 'Safety, itineraries, and the best solo-friendly spots',
    cover_image_url: 'https://picsum.photos/seed/europeguide/800/500',
    tag: '🇪🇺 Europe',
    readTime: '10 min read',
    author: 'Sofia Lim',
  },
  {
    id: 'guide-4',
    title: 'How to Plan a Trip in 30 Minutes',
    subtitle: 'The Wayfarer method — from vague idea to packed bag',
    cover_image_url: 'https://picsum.photos/seed/planningguide/800/500',
    tag: '📋 Planning',
    readTime: '5 min read',
    author: 'Wayfarer Editorial',
  },
]

// ── Sub-tab config ─────────────────────────────────────────────

const TABS: { id: ListTab; label: string; emoji: string }[] = [
  { id: 'been',     label: 'Been',        emoji: '✅' },
  { id: 'upcoming', label: 'Upcoming',    emoji: '✈️' },
  { id: 'saved',    label: 'Want to Go',  emoji: '🔖' },
  { id: 'recs',     label: 'For You',     emoji: '✨' },
  { id: 'guides',   label: 'Guides',      emoji: '📖' },
]

// ── Small trip card component ──────────────────────────────────

function TripRow({
  trip,
  badge,
  onToggle,
  toggleLabel,
  toggleActive,
}: {
  trip: Trip
  badge?: string
  onToggle?: () => void
  toggleLabel?: string
  toggleActive?: boolean
}) {
  const router = useRouter()
  return (
    <div
      className="flex gap-3 items-start p-3 rounded-[14px] mb-2.5"
      style={{ background: 'var(--card)', border: '1px solid var(--border)', cursor: 'pointer' }}
      onClick={() => router.push(`/trip/${trip.id}`)}
    >
      {/* Cover */}
      <div className="relative flex-shrink-0 rounded-[10px] overflow-hidden" style={{ width: 80, height: 80 }}>
        {trip.cover_image_url && (
          <Image src={trip.cover_image_url} alt={trip.title} fill className="object-cover" />
        )}
        {badge && (
          <div style={{
            position: 'absolute', bottom: 4, left: 4,
            background: 'rgba(11,11,20,0.75)',
            borderRadius: 6, padding: '2px 6px',
            fontSize: 11, fontWeight: 600, color: 'var(--text)',
          }}>
            {badge}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm leading-tight mb-0.5 truncate">{trip.title}</div>
        <div className="flex items-center gap-1 text-[11px] mb-1" style={{ color: 'var(--text2)' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="10" height="10" style={{ flexShrink: 0 }}>
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
          </svg>
          {trip.location}
          <span style={{ color: 'var(--text3)' }}>· {trip.duration_days}d</span>
        </div>
        <div className="flex items-center gap-1.5">
          {trip.rating != null && (
            <span className="text-[11px] font-semibold" style={{ color: 'var(--gold)' }}>
              ★ {trip.rating.toFixed(1)}
            </span>
          )}
          {trip.tags.slice(0, 2).map(t => (
            <span key={t} className="chip text-[10px] py-0">#{t}</span>
          ))}
        </div>
      </div>

      {/* Toggle button */}
      {onToggle && (
        <button
          className="flex-shrink-0 text-[11px] font-semibold px-2.5 py-1 rounded-full transition-colors"
          style={{
            background: toggleActive ? 'var(--gold)' : 'transparent',
            border: `1px solid ${toggleActive ? 'var(--gold)' : 'var(--border)'}`,
            color: toggleActive ? 'var(--bg)' : 'var(--text2)',
          }}
          onClick={e => { e.stopPropagation(); onToggle() }}
        >
          {toggleLabel}
        </button>
      )}
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────

export default function ListsPage() {
  const [activeTab, setActiveTab] = useState<ListTab>('been')
  const { beenIds, savedIds, toggleBeen, toggleSave, publishedTrips } = useAppState()
  const router = useRouter()

  const allTrips = [...MOCK_TRIPS, ...publishedTrips]

  // Been = manual beenIds OR trips with past end_date
  const beenTrips = allTrips.filter(t => {
    if (beenIds.has(t.id)) return true
    if (t.end_date) {
      return new Date(t.end_date) < new Date()
    }
    return false
  })

  // Upcoming = future start_date
  const upcomingTrips = allTrips.filter(t => {
    if (!t.start_date) return false
    return new Date(t.start_date) > new Date()
  })

  // Saved / Want to go
  const savedTrips = allTrips.filter(t => savedIds.has(t.id))

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div
        className="flex-shrink-0 px-5 pt-14 pb-3"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <h1 className="font-head text-[22px] mb-3">My Lists</h1>

        {/* Sub-tabs */}
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
          {TABS.map(tab => (
            <button
              key={tab.id}
              className="flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors"
              style={{
                background: activeTab === tab.id ? 'var(--gold)' : 'var(--bg2)',
                color: activeTab === tab.id ? 'var(--bg)' : 'var(--text2)',
                border: `1px solid ${activeTab === tab.id ? 'var(--gold)' : 'var(--border)'}`,
              }}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.emoji} {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-6 px-4 pt-4">

        {/* ── Been ─────────────────────────────────────────── */}
        {activeTab === 'been' && (
          <>
            <div className="text-[11px] mb-4 font-medium" style={{ color: 'var(--text3)' }}>
              {beenTrips.length} place{beenTrips.length !== 1 ? 's' : ''} visited
            </div>

            {/* Stats strip */}
            {beenTrips.length > 0 && (
              <div className="flex gap-2 mb-4">
                {[
                  { label: 'Countries', value: new Set(beenTrips.map(t => t.location.split(', ').pop())).size },
                  { label: 'Days abroad', value: beenTrips.reduce((s, t) => s + t.duration_days, 0) },
                  { label: 'Avg rating', value: (() => {
                    const rated = beenTrips.filter(t => t.rating != null)
                    return rated.length ? (rated.reduce((s, t) => s + (t.rating ?? 0), 0) / rated.length).toFixed(1) : '—'
                  })() },
                ].map(stat => (
                  <div
                    key={stat.label}
                    className="flex-1 flex flex-col items-center py-2.5 rounded-[12px]"
                    style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
                  >
                    <div className="font-head text-xl" style={{ color: 'var(--gold)' }}>{stat.value}</div>
                    <div className="text-[10px] mt-0.5" style={{ color: 'var(--text3)' }}>{stat.label}</div>
                  </div>
                ))}
              </div>
            )}

            {beenTrips.length === 0 ? (
              <EmptyState
                emoji="🗺️"
                title="No trips yet"
                body="Mark trips as Been or complete a trip with dates to see them here."
              />
            ) : (
              beenTrips.map(trip => (
                <TripRow
                  key={trip.id}
                  trip={trip}
                  badge="✅ Been"
                  onToggle={() => toggleBeen(trip.id)}
                  toggleLabel={beenIds.has(trip.id) ? '✓ Been' : '+ Been'}
                  toggleActive={beenIds.has(trip.id)}
                />
              ))
            )}

            {/* Add trip prompt */}
            <div className="mt-4">
              <div className="text-[11px] mb-2 font-medium" style={{ color: 'var(--text3)' }}>Mark any trip as been:</div>
              {allTrips.filter(t => !beenIds.has(t.id) && !beenTrips.includes(t)).slice(0, 3).map(trip => (
                <TripRow
                  key={trip.id}
                  trip={trip}
                  onToggle={() => toggleBeen(trip.id)}
                  toggleLabel="+ Been"
                  toggleActive={false}
                />
              ))}
            </div>
          </>
        )}

        {/* ── Upcoming ─────────────────────────────────────── */}
        {activeTab === 'upcoming' && (
          <>
            <div className="text-[11px] mb-4 font-medium" style={{ color: 'var(--text3)' }}>
              {upcomingTrips.length} upcoming trip{upcomingTrips.length !== 1 ? 's' : ''}
            </div>
            {upcomingTrips.length === 0 ? (
              <EmptyState
                emoji="✈️"
                title="Nothing on the calendar"
                body="Create a trip with future dates and it'll appear here automatically."
                cta="Plan a trip"
                onCta={() => router.push('/create')}
              />
            ) : (
              upcomingTrips.map(trip => {
                const daysUntil = trip.start_date
                  ? Math.ceil((new Date(trip.start_date).getTime() - Date.now()) / 86400000)
                  : null
                return (
                  <TripRow
                    key={trip.id}
                    trip={trip}
                    badge={daysUntil != null ? `${daysUntil}d away` : undefined}
                  />
                )
              })
            )}
          </>
        )}

        {/* ── Saved / Want to Go ────────────────────────────── */}
        {activeTab === 'saved' && (
          <>
            <div className="text-[11px] mb-4 font-medium" style={{ color: 'var(--text3)' }}>
              {savedTrips.length} saved trip{savedTrips.length !== 1 ? 's' : ''}
            </div>
            {savedTrips.length === 0 ? (
              <EmptyState
                emoji="🔖"
                title="Nothing saved yet"
                body="Tap the bookmark icon on any trip to save it here."
              />
            ) : (
              savedTrips.map(trip => (
                <TripRow
                  key={trip.id}
                  trip={trip}
                  badge="🔖 Saved"
                  onToggle={() => toggleSave(trip.id)}
                  toggleLabel="✕ Unsave"
                  toggleActive={true}
                />
              ))
            )}
          </>
        )}

        {/* ── Recs ─────────────────────────────────────────── */}
        {activeTab === 'recs' && (
          <>
            <div className="flex items-center gap-2 mb-4">
              <div className="text-[11px] font-medium" style={{ color: 'var(--text3)' }}>
                Personalised for you based on your trips
              </div>
            </div>

            {/* Reason banner */}
            <div
              className="flex items-start gap-3 p-3.5 rounded-[14px] mb-4"
              style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.2)' }}
            >
              <span style={{ fontSize: 24 }}>✨</span>
              <div>
                <div className="text-sm font-semibold mb-0.5">Why these picks?</div>
                <div className="text-[12px] leading-relaxed" style={{ color: 'var(--text2)' }}>
                  You've been to Tokyo and NYC — we think you love food scenes and vibrant city energy. Here's what's next.
                </div>
              </div>
            </div>

            {REC_TRIPS.map((trip, i) => (
              <div key={trip.id}>
                <div className="text-[11px] font-semibold mb-1.5 mt-2" style={{ color: 'var(--text3)' }}>
                  #{i + 1} Recommended
                </div>
                <TripRow
                  trip={trip}
                  onToggle={() => toggleSave(trip.id)}
                  toggleLabel={savedIds.has(trip.id) ? '✓ Saved' : '+ Save'}
                  toggleActive={savedIds.has(trip.id)}
                />
                {/* Why text */}
                <div
                  className="text-[11px] leading-relaxed mb-3 px-1"
                  style={{ color: 'var(--text3)' }}
                >
                  💡 {trip.description}
                </div>
              </div>
            ))}
          </>
        )}

        {/* ── Guides ───────────────────────────────────────── */}
        {activeTab === 'guides' && (
          <>
            <div className="text-[11px] mb-4 font-medium" style={{ color: 'var(--text3)' }}>
              Expert trip guides from the Wayfarer community
            </div>

            {GUIDE_TRIPS.map(guide => (
              <div
                key={guide.id}
                className="rounded-[14px] overflow-hidden mb-3"
                style={{ background: 'var(--card)', border: '1px solid var(--border)', cursor: 'pointer' }}
              >
                {/* Cover */}
                <div className="relative h-[140px]">
                  <Image src={guide.cover_image_url} alt={guide.title} fill className="object-cover" />
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(to bottom, transparent 40%, rgba(11,11,20,0.7) 100%)',
                    pointerEvents: 'none',
                  }} />
                  <div style={{
                    position: 'absolute', bottom: 10, left: 12,
                    background: 'rgba(11,11,20,0.7)',
                    borderRadius: 8, padding: '2px 8px',
                    fontSize: 11, fontWeight: 600, color: 'var(--text)',
                  }}>
                    {guide.tag}
                  </div>
                </div>

                {/* Info */}
                <div className="p-3.5">
                  <div className="font-semibold text-sm leading-tight mb-1">{guide.title}</div>
                  <div className="text-[12px] mb-2.5" style={{ color: 'var(--text2)' }}>{guide.subtitle}</div>
                  <div className="flex items-center justify-between">
                    <div className="text-[11px]" style={{ color: 'var(--text3)' }}>by {guide.author}</div>
                    <div
                      className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
                      style={{ background: 'var(--gold)', color: 'var(--bg)' }}
                    >
                      {guide.readTime}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Floating Create button */}
      <Link
        href="/create"
        className="absolute z-20 flex items-center justify-center rounded-full transition-transform active:scale-95"
        style={{
          width: 52, height: 52,
          bottom: 80, right: 20,
          background: 'var(--gold)',
          boxShadow: '0 4px 20px rgba(212,175,55,0.4)',
        }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="var(--bg)" strokeWidth="2.5" width="22" height="22">
          <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </Link>
    </div>
  )
}

// ── Empty state helper ─────────────────────────────────────────

function EmptyState({
  emoji, title, body, cta, onCta,
}: {
  emoji: string
  title: string
  body: string
  cta?: string
  onCta?: () => void
}) {
  return (
    <div className="flex flex-col items-center text-center py-12 px-6">
      <div style={{ fontSize: 48, marginBottom: 12 }}>{emoji}</div>
      <div className="font-semibold text-base mb-1.5">{title}</div>
      <div className="text-sm leading-relaxed" style={{ color: 'var(--text3)', maxWidth: 260 }}>{body}</div>
      {cta && onCta && (
        <button
          className="mt-5 px-5 py-2 rounded-full text-sm font-semibold"
          style={{ background: 'var(--gold)', color: 'var(--bg)' }}
          onClick={onCta}
        >
          {cta}
        </button>
      )}
    </div>
  )
}
