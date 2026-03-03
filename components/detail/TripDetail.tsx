'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import type { Trip, DraftActivity } from '@/lib/types'
import { formatRating, starsFilled } from '@/lib/utils'
import { useToast, ToastProvider } from '@/components/ui/Toast'
import { AppStateProvider, useAppState } from '@/lib/app-state'
import { MOCK_TRIPS } from '@/lib/mock-data'

interface Props { id: string }

const SEASON_LABELS: Record<string, string> = {
  spring: '🌸 Spring',
  summer: '☀️ Summer',
  autumn: '🍂 Autumn',
  winter: '❄️ Winter',
}

function formatDateRange(start?: string | null, end?: string | null) {
  if (!start && !end) return null
  const fmt = (s: string) =>
    new Date(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  if (start && end) return `${fmt(start)} – ${fmt(end)}`
  if (start) return `From ${fmt(start)}`
  return `Until ${fmt(end!)}`
}

// ─── Mock comments data ─────────────────────────────────────────

const COMMENT_POOLS: Record<string, { author: string; avatar: string; text: string; timeAgo: string; likes: number }[]> = {
  default: [
    { author: 'Sarah K.', avatar: 'https://i.pravatar.cc/64?img=20', text: 'This is such a great itinerary! Saving this for my next trip 🙌', timeAgo: '2d ago', likes: 14 },
    { author: 'Marco V.', avatar: 'https://i.pravatar.cc/64?img=33', text: 'Went here last year and can confirm every recommendation is spot on!', timeAgo: '5d ago', likes: 9 },
    { author: 'Priya R.', avatar: 'https://i.pravatar.cc/64?img=16', text: 'How much did you budget per day? Planning a similar trip!', timeAgo: '1w ago', likes: 6 },
    { author: 'Tom W.', avatar: 'https://i.pravatar.cc/64?img=59', text: 'The food recommendations are absolutely perfect, I trusted every one 😍', timeAgo: '2w ago', likes: 21 },
  ],
  'trip-1': [
    { author: 'Yuki T.', avatar: 'https://i.pravatar.cc/64?img=16', text: 'Get the JR Pass before you leave — saves so much on the shinkansen 🎌', timeAgo: '1d ago', likes: 31 },
    { author: 'Emma L.', avatar: 'https://i.pravatar.cc/64?img=25', text: 'Omoide Yokocho three nights in a row is actually mandatory 😂', timeAgo: '3d ago', likes: 18 },
    { author: 'Daniel H.', avatar: 'https://i.pravatar.cc/64?img=50', text: 'Did you find English signage easy to follow at Narita?', timeAgo: '1w ago', likes: 5 },
    { author: 'Aiko M.', avatar: 'https://i.pravatar.cc/64?img=8', text: 'As a local — this is literally the perfect Tokyo route. Bookmarked!', timeAgo: '2w ago', likes: 47 },
  ],
  'trip-2': [
    { author: 'Lucia F.', avatar: 'https://i.pravatar.cc/64?img=29', text: 'Da Adolfo is worth every minute of the wait. Get there by 11am!', timeAgo: '2d ago', likes: 22 },
    { author: 'Ben A.', avatar: 'https://i.pravatar.cc/64?img=44', text: 'How did you find renting a car on the coast? Was it stressful?', timeAgo: '4d ago', likes: 7 },
    { author: 'Claudia B.', avatar: 'https://i.pravatar.cc/64?img=3', text: 'The lemon granita on the drive is life-changing. Do not skip it 🍋', timeAgo: '1w ago', likes: 19 },
    { author: 'Ryan P.', avatar: 'https://i.pravatar.cc/64?img=61', text: 'Going in September — is it still busy or does it quiet down?', timeAgo: '2w ago', likes: 4 },
  ],
  'trip-3': [
    { author: 'Suki L.', avatar: 'https://i.pravatar.cc/64?img=35', text: 'Tegalalang at dawn is genuinely one of the most beautiful things I\'ve seen 🌿', timeAgo: '3d ago', likes: 33 },
    { author: 'Josh M.', avatar: 'https://i.pravatar.cc/64?img=52', text: 'Locavore requires booking MONTHS in advance — do not leave it last minute!', timeAgo: '5d ago', likes: 28 },
    { author: 'Nina S.', avatar: 'https://i.pravatar.cc/64?img=12', text: 'How\'s the transport between Seminyak and Ubud? Did you hire a driver?', timeAgo: '1w ago', likes: 11 },
    { author: 'Kai B.', avatar: 'https://i.pravatar.cc/64?img=66', text: 'Bali always delivers. Smoothie bowl obsession is real 🥥', timeAgo: '3w ago', likes: 16 },
  ],
  'trip-4': [
    { author: 'Hana T.', avatar: 'https://i.pravatar.cc/64?img=7', text: 'Autumn in Kyoto is indescribable. The maple leaves at Kiyomizudera… 😭', timeAgo: '2d ago', likes: 41 },
    { author: 'Leo C.', avatar: 'https://i.pravatar.cc/64?img=37', text: 'Was the bamboo grove already crowded by 6am? I\'ve heard it gets busy!', timeAgo: '4d ago', likes: 13 },
    { author: 'Mei L.', avatar: 'https://i.pravatar.cc/64?img=9', text: 'Staying in a ryokan is the right call. Kaiseki breakfast alone is worth it.', timeAgo: '1w ago', likes: 26 },
    { author: 'Oliver K.', avatar: 'https://i.pravatar.cc/64?img=57', text: 'This route is almost identical to what I planned! Good to have validation 🙌', timeAgo: '2w ago', likes: 9 },
  ],
}

function getComments(tripId: string) {
  return COMMENT_POOLS[tripId] ?? COMMENT_POOLS['default']
}

// ─── Add-to-Trip Sheet ──────────────────────────────────────────

function AddToTripSheet({ activity, onClose }: {
  activity: DraftActivity
  onClose: () => void
}) {
  const router = useRouter()
  const { showToast } = useToast()
  const { publishedTrips, addActivityToTrip, setPendingActivity } = useAppState()

  const mockMyTrips = MOCK_TRIPS.filter(t => t.author.id === 'me')
  const myTrips: Trip[] = [
    ...publishedTrips,
    ...mockMyTrips.filter(t => !publishedTrips.some(p => p.id === t.id)),
  ]

  function handleAddToTrip(trip: Trip) {
    addActivityToTrip(trip.id, activity)
    showToast(`✓ Added to "${trip.title}"`)
    onClose()
  }

  function handleCreateNew() {
    setPendingActivity(activity)
    onClose()
    router.push('/create')
  }

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 40,
          background: 'rgba(11,11,20,0.6)', backdropFilter: 'blur(4px)',
        }}
      />
      <div style={{
        position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 50,
        background: 'var(--bg2)', borderRadius: '20px 20px 0 0',
        border: '1px solid var(--border)', maxHeight: '75vh',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        <div style={{ width: 36, height: 4, background: 'var(--text3)', borderRadius: 2, margin: '14px auto 0' }} />

        <div style={{ padding: '12px 20px 4px' }}>
          <div style={{ fontWeight: 700, fontSize: 15 }}>Add to a Trip</div>
          <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>
            <span style={{ fontSize: 18 }}>{activity.emoji}</span>{' '}
            <span style={{ fontWeight: 600 }}>{activity.text}</span>
          </div>
        </div>

        <div style={{ overflowY: 'auto', padding: '12px 20px 32px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button
            onClick={handleCreateNew}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '14px 16px', borderRadius: 12, textAlign: 'left', cursor: 'pointer',
              background: 'var(--gold-dim)', border: '1px solid var(--gold)',
            }}
          >
            <div style={{
              width: 44, height: 44, borderRadius: 10, flexShrink: 0,
              background: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22,
            }}>✨</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--gold)' }}>Create New Trip</div>
              <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>
                Start a fresh trip with this activity
              </div>
            </div>
          </button>

          {myTrips.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '2px 0' }}>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
              <span style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 600 }}>MY TRIPS</span>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            </div>
          )}

          {myTrips.length === 0 ? (
            <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--text3)', padding: '12px 0' }}>
              No trips yet — create one above
            </div>
          ) : (
            myTrips.map(trip => (
              <button
                key={trip.id}
                onClick={() => handleAddToTrip(trip)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: 12, borderRadius: 12, textAlign: 'left', cursor: 'pointer',
                  background: 'var(--bg3)', border: '1px solid var(--border)',
                }}
              >
                <div style={{ position: 'relative', width: 52, height: 52, borderRadius: 8, overflow: 'hidden', flexShrink: 0 }}>
                  {trip.cover_image_url
                    ? <Image src={trip.cover_image_url} alt={trip.title} fill style={{ objectFit: 'cover' }} />
                    : <div style={{ width: '100%', height: '100%', background: 'var(--bg2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{trip.country_emoji}</div>
                  }
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {trip.title}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>
                    {trip.country_emoji} {trip.location} · {trip.duration_days}d
                  </div>
                </div>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                  background: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="#0B0B14" strokeWidth="2.5" width="12" height="12">
                    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </>
  )
}

// ─── Comments Section ───────────────────────────────────────────

function CommentsSection({ tripId }: { tripId: string }) {
  const comments = getComments(tripId)
  const [likedComments, setLikedComments] = useState<Set<number>>(new Set())

  function toggleCommentLike(i: number) {
    setLikedComments(prev => {
      const next = new Set(prev)
      next.has(i) ? next.delete(i) : next.add(i)
      return next
    })
  }

  return (
    <div style={{ marginTop: 8 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>
          Comments <span style={{ color: 'var(--text3)', fontWeight: 500, fontSize: 14 }}>({comments.length})</span>
        </h2>
      </div>

      {/* Comment list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 16 }}>
        {comments.map((c, i) => (
          <div key={i} style={{ display: 'flex', gap: 10 }}>
            <Image
              src={c.avatar} alt={c.author} width={34} height={34}
              style={{ borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '1.5px solid var(--border)' }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 3 }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{c.author}</span>
                <span style={{ fontSize: 11, color: 'var(--text3)' }}>{c.timeAgo}</span>
              </div>
              <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.45 }}>{c.text}</div>
              <button
                onClick={() => toggleCommentLike(i)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 4, marginTop: 6,
                  fontSize: 11, color: likedComments.has(i) ? 'var(--rose)' : 'var(--text3)',
                  background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                }}
              >
                <svg viewBox="0 0 24 24" fill={likedComments.has(i) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" width="12" height="12">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
                {c.likes + (likedComments.has(i) ? 1 : 0)}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add comment input (decorative) */}
      <div style={{
        display: 'flex', gap: 10, alignItems: 'center',
        padding: '10px 14px', borderRadius: 12,
        border: '1px solid var(--border)', background: 'var(--bg3)',
      }}>
        <div style={{
          width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
          background: 'var(--gold-dim)', border: '1px solid var(--gold)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 12, fontWeight: 700, color: 'var(--gold)',
        }}>R</div>
        <span style={{ fontSize: 13, color: 'var(--text3)', flex: 1 }}>Add a comment…</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16" style={{ color: 'var(--text3)' }}>
          <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
        </svg>
      </div>
    </div>
  )
}

// ─── Not-found state ────────────────────────────────────────────

function TripNotFound() {
  const router = useRouter()
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      flex: 1, padding: 40, textAlign: 'center',
    }}>
      <div style={{ fontSize: 40, marginBottom: 16 }}>🗺️</div>
      <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Trip not found</div>
      <div style={{ fontSize: 14, color: 'var(--text2)', marginBottom: 24 }}>
        This trip may have been removed or isn&apos;t available.
      </div>
      <button
        onClick={() => router.back()}
        style={{
          padding: '10px 24px', borderRadius: 10,
          background: 'var(--gold)', color: '#0B0B14',
          fontWeight: 700, fontSize: 14,
        }}
      >
        Go back
      </button>
    </div>
  )
}

// ─── Trip content (receives guaranteed non-null trip) ───────────

function TripContent({ trip }: { trip: Trip }) {
  const router = useRouter()
  const { showToast } = useToast()
  const { likedIds, savedIds, followingIds, toggleLike, toggleSave, toggleFollow } = useAppState()

  const liked     = likedIds.has(trip.id)
  const saved     = savedIds.has(trip.id)
  const following = followingIds.has(trip.author.id)

  const [openDays,       setOpenDays]       = useState<Set<string>>(new Set([trip.days[0]?.id]))
  const [addingActivity, setAddingActivity] = useState<DraftActivity | null>(null)

  const filled       = starsFilled(trip.rating)
  const exactDateStr = formatDateRange(trip.start_date, trip.end_date)
  const dateStr      = exactDateStr ?? (trip.approx_date_label ? `Around ${trip.approx_date_label}` : null)
  const seasonStr    = trip.season ? SEASON_LABELS[trip.season] : null

  // Determine upcoming vs past for header badge
  const now = new Date()
  const isUpcoming = trip.start_date ? new Date(trip.start_date) > now : false

  function toggleDay(dayId: string) {
    setOpenDays(prev => {
      const next = new Set(prev)
      next.has(dayId) ? next.delete(dayId) : next.add(dayId)
      return next
    })
  }

  function handleFollow() {
    toggleFollow(trip.author.id)
    showToast(following
      ? `Unfollowed ${trip.author.full_name.split(' ')[0]}`
      : `✓ Following ${trip.author.full_name.split(' ')[0]}`)
  }

  return (
    <div className="flex flex-col flex-1 overflow-y-auto no-scrollbar pb-6">
      {/* ── Hero ─────────────────────────────────────── */}
      <div className="relative h-[280px] flex-shrink-0">
        {trip.cover_image_url && (
          <Image src={trip.cover_image_url} alt={trip.title} fill className="object-cover" priority />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/95" />

        <button
          className="absolute top-14 left-4 btn-icon z-10"
          style={{ background: 'rgba(11,11,20,0.6)', backdropFilter: 'blur(8px)' }}
          onClick={() => router.back()}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        <div className="absolute top-14 right-4 flex gap-2 z-10">
          <button className="btn-icon" style={{ background: 'rgba(11,11,20,0.6)', backdropFilter: 'blur(8px)' }}
            onClick={() => showToast('🔗 Link copied!')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
              <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
          </button>
          <button
            className="btn-icon"
            style={{ background: 'rgba(11,11,20,0.6)', backdropFilter: 'blur(8px)', color: liked ? 'var(--rose)' : 'inherit' }}
            onClick={() => { toggleLike(trip.id); showToast(liked ? '♡ Removed like' : '❤️ Liked') }}
          >
            <svg viewBox="0 0 24 24" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" width="18" height="18">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
          <button
            className="btn-icon"
            style={{ background: 'rgba(11,11,20,0.6)', backdropFilter: 'blur(8px)', color: saved ? 'var(--gold)' : 'inherit' }}
            onClick={() => { toggleSave(trip.id); showToast(saved ? '○ Removed' : '✦ Saved') }}
          >
            <svg viewBox="0 0 24 24" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" width="18" height="18">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
          </button>
        </div>

        <div className="absolute bottom-5 left-5 right-5">
          {/* Past / upcoming badge */}
          {isUpcoming ? (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              background: 'var(--gold)', color: '#0B0B14',
              borderRadius: 6, padding: '2px 8px', fontSize: 10, fontWeight: 800,
              letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 8,
            }}>
              ✈️ Upcoming trip
            </div>
          ) : dateStr ? (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              background: 'rgba(11,11,20,0.6)', backdropFilter: 'blur(8px)',
              borderRadius: 6, padding: '2px 8px', fontSize: 10, fontWeight: 600,
              color: 'var(--text2)', marginBottom: 8,
              border: '1px solid var(--border)',
            }}>
              📍 Past trip
            </div>
          ) : null}

          <div className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--gold)' }}>
            {trip.country_emoji} {trip.location}
          </div>
          <h1 className="font-head text-[28px] font-normal leading-tight mb-2">{trip.title}</h1>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text2)' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13">
                <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              {trip.duration_days} days
            </div>
            {seasonStr && (
              <div className="text-xs" style={{ color: 'var(--text2)' }}>{seasonStr}</div>
            )}
          </div>
        </div>
      </div>

      {/* ── Body ─────────────────────────────────────── */}
      <div className="px-5 pt-5">

        {/* Date row */}
        {dateStr && (
          <div className="flex items-center gap-2 mb-4 text-xs" style={{ color: 'var(--text2)' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13">
              <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            {dateStr}
          </div>
        )}

        {/* Author row */}
        <div className="flex items-center gap-3 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
          {trip.author.avatar_url && (
            <Image src={trip.author.avatar_url} alt={trip.author.full_name} width={40} height={40}
              className="rounded-full object-cover" style={{ border: '2px solid var(--gold-dim)' }} />
          )}
          <div className="flex-1">
            <div className="text-sm font-semibold">{trip.author.full_name}</div>
            <div className="text-xs mt-0.5" style={{ color: 'var(--text2)' }}>
              {trip.author.trip_count} trips · {trip.author.follower_count} followers
            </div>
          </div>
          {trip.author.id !== 'me' && (
            <button
              onClick={handleFollow}
              className="text-xs font-semibold px-4 py-1.5 rounded-full transition-all"
              style={following
                ? { background: 'var(--bg3)', color: 'var(--text2)', border: '1px solid var(--border)' }
                : { border: '1px solid var(--gold)', color: 'var(--gold)' }}
            >
              {following ? 'Following' : 'Follow'}
            </button>
          )}
        </div>

        {/* Rating row — only shown if rating exists */}
        {trip.rating != null && (
          <div className="flex items-center gap-4 rounded-[10px] p-4 my-5"
            style={{ background: 'var(--bg3)', border: '1px solid var(--border)' }}>
            <div className="font-head text-[42px] leading-none" style={{ color: 'var(--gold)' }}>
              {formatRating(trip.rating)}
            </div>
            <div className="flex-1">
              <div className="flex gap-0.5 mb-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className="text-base" style={{ color: i < filled ? 'var(--gold)' : 'var(--text3)' }}>★</span>
                ))}
              </div>
              <div className="text-xs" style={{ color: 'var(--text2)' }}>Based on {trip.rating_count} ratings</div>
            </div>
          </div>
        )}

        {trip.description && (
          <p className="text-sm leading-relaxed mb-5" style={{ color: 'var(--text2)' }}>{trip.description}</p>
        )}

        {/* Photos */}
        {trip.cover_image_url && (
          <>
            <h2 className="text-[16px] font-bold mb-3">Photos</h2>
            <div className="grid grid-cols-2 gap-2 mb-5">
              <div className="col-span-2 relative h-[160px] rounded-[10px] overflow-hidden">
                <Image src={trip.cover_image_url} alt="" fill className="object-cover" />
              </div>
              {[
                trip.cover_image_url.replace(/seed\/[^/]+/, 'seed/extra1'),
                trip.cover_image_url.replace(/seed\/[^/]+/, 'seed/extra2'),
              ].map((src, i) => (
                <div key={i} className="relative h-[120px] rounded-[10px] overflow-hidden">
                  <Image src={src} alt="" fill className="object-cover" />
                </div>
              ))}
            </div>
          </>
        )}

        {/* Friends rated — only if rating data present */}
        {trip.rating != null && trip.rating_count > 0 && (
          <div className="flex items-center gap-2 mb-5">
            {[32, 9, 15].map((img, i) => (
              <Image key={i} src={`https://i.pravatar.cc/64?img=${img}`} alt="" width={32} height={32}
                className="rounded-full object-cover"
                style={{ marginLeft: i > 0 ? '-8px' : 0, border: '2px solid var(--bg)' }} />
            ))}
            <span className="text-xs ml-2" style={{ color: 'var(--text2)' }}>
              <span style={{ color: 'var(--text)', fontWeight: 500 }}>Alex, Priya, Tom</span>{' '}
              and {Math.max(0, trip.rating_count - 3)} others rated this
            </span>
          </div>
        )}

        {/* Itinerary */}
        {trip.days.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-[16px] font-bold">Itinerary</h2>
              <div className="text-[10px] px-2 py-0.5 rounded-full"
                style={{ background: 'var(--bg3)', color: 'var(--text2)', border: '1px solid var(--border)' }}>
                Tap + to add stops to your trip
              </div>
            </div>

            <div>
              {trip.days.map(day => (
                <div key={day.id}>
                  <button
                    className="w-full flex items-center gap-3 py-3"
                    style={{ borderTop: '1px solid var(--border)' }}
                    onClick={() => toggleDay(day.id)}
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                      style={{ background: 'var(--gold-dim)', border: '1px solid var(--gold)', color: 'var(--gold)' }}>
                      D{day.day_number}
                    </div>
                    <div className="flex-1 text-left">
                      <div className="text-sm font-semibold">{day.title}</div>
                      <div className="text-xs mt-0.5" style={{ color: 'var(--text2)' }}>{day.activities.length} stops</div>
                    </div>
                    <svg
                      style={{
                        color: 'var(--text3)',
                        transform: openDays.has(day.id) ? 'rotate(180deg)' : 'none',
                        transition: 'transform 0.2s',
                      }}
                      viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>

                  {openDays.has(day.id) && (
                    <div className="pb-2 pl-11">
                      {day.activities.map(act => (
                        <div
                          key={act.id}
                          className="flex gap-3 py-2.5 relative items-start"
                          style={{ borderLeft: '1px solid var(--border)', paddingLeft: '16px', marginLeft: '-16px' }}
                        >
                          <div className="absolute left-[-4px] top-4 w-2 h-2 rounded-full"
                            style={{ background: 'var(--gold)' }} />
                          <div className="flex-1">
                            <div className="text-[10px] font-semibold uppercase tracking-wide mb-0.5"
                              style={{ color: 'var(--gold)' }}>
                              {act.emoji} {act.type}
                            </div>
                            <div className="text-sm font-semibold">{act.text}</div>
                            {act.notes && (
                              <div className="text-xs mt-0.5" style={{ color: 'var(--text2)' }}>{act.notes}</div>
                            )}
                          </div>
                          <button
                            onClick={() => setAddingActivity({ emoji: act.emoji, text: act.text, type: act.type })}
                            className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all mt-0.5 active:scale-90"
                            style={{ background: 'var(--gold-dim)', border: '1px solid var(--gold)', color: 'var(--gold)' }}
                            title="Add to my trip"
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="11" height="11">
                              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── Comments ─────────────────────────────────── */}
        <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
          <CommentsSection tripId={trip.id} />
        </div>
      </div>

      {/* Add-to-trip sheet */}
      {addingActivity && (
        <AddToTripSheet
          activity={addingActivity}
          onClose={() => setAddingActivity(null)}
        />
      )}
    </div>
  )
}

// ─── Lookup wrapper (inside providers, so can use useAppState) ──

function Detail({ id }: { id: string }) {
  const { publishedTrips } = useAppState()
  const trip = publishedTrips.find(t => t.id === id) ?? MOCK_TRIPS.find(t => t.id === id) ?? null
  if (!trip) return <TripNotFound />
  return <TripContent trip={trip} />
}

// ─── Root export ────────────────────────────────────────────────

export default function TripDetail({ id }: Props) {
  return (
    <AppStateProvider>
      <ToastProvider>
        <Detail id={id} />
      </ToastProvider>
    </AppStateProvider>
  )
}
