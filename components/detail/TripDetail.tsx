'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import type { Trip } from '@/lib/types'
import { formatRating, starsFilled } from '@/lib/utils'
import { useToast, ToastProvider } from '@/components/ui/Toast'
import { AppStateProvider, useAppState } from '@/lib/app-state'

interface Props { trip: Trip }

function Detail({ trip }: Props) {
  const router = useRouter()
  const { showToast } = useToast()
  const { likedIds, savedIds, followingIds, toggleLike, toggleSave, toggleFollow } = useAppState()

  const liked     = likedIds.has(trip.id)
  const saved     = savedIds.has(trip.id)
  const following = followingIds.has(trip.author.id)

  const [openDays, setOpenDays] = useState<Set<string>>(new Set([trip.days[0]?.id]))
  const filled = starsFilled(trip.rating)

  function toggleDay(id: string) {
    setOpenDays(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
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
      {/* Hero */}
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
          <div className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--gold)' }}>
            {trip.country_emoji} {trip.location}
          </div>
          <h1 className="font-head text-[28px] font-normal leading-tight mb-2">{trip.title}</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text2)' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13">
                <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              {trip.duration_days} days
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="px-5 pt-5">
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

        {/* Rating row */}
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
          <Link href="/create">
            <button className="text-xs font-bold px-4 py-2.5 rounded-[10px] leading-snug text-center"
              style={{ background: 'var(--gold)', color: '#0B0B14' }}>
              Use as<br />Template
            </button>
          </Link>
        </div>

        {trip.description && (
          <p className="text-sm leading-relaxed mb-5" style={{ color: 'var(--text2)' }}>{trip.description}</p>
        )}

        {/* Photos */}
        <h2 className="text-[16px] font-bold mb-3">Photos</h2>
        <div className="grid grid-cols-2 gap-2 mb-5">
          <div className="col-span-2 relative h-[160px] rounded-[10px] overflow-hidden">
            {trip.cover_image_url && <Image src={trip.cover_image_url} alt="" fill className="object-cover" />}
          </div>
          {[
            trip.cover_image_url?.replace(/seed\/\w+/, 'seed/extra1'),
            trip.cover_image_url?.replace(/seed\/\w+/, 'seed/extra2'),
          ].map((src, i) => (
            <div key={i} className="relative h-[120px] rounded-[10px] overflow-hidden">
              {src && <Image src={src} alt="" fill className="object-cover" />}
            </div>
          ))}
        </div>

        {/* Friends rated */}
        <div className="flex items-center gap-2 mb-5">
          {[32, 9, 15].map((img, i) => (
            <Image key={i} src={`https://i.pravatar.cc/64?img=${img}`} alt="" width={32} height={32}
              className="rounded-full object-cover" style={{ marginLeft: i > 0 ? '-8px' : 0, border: '2px solid var(--bg)' }} />
          ))}
          <span className="text-xs ml-2" style={{ color: 'var(--text2)' }}>
            <span style={{ color: 'var(--text)', fontWeight: 500 }}>Alex, Priya, Tom</span> and {trip.rating_count - 3} others rated this
          </span>
        </div>

        {/* Itinerary */}
        <h2 className="text-[16px] font-bold mb-2">Itinerary</h2>
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
                  style={{ color: 'var(--text3)', transform: openDays.has(day.id) ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
                  viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              {openDays.has(day.id) && (
                <div className="pb-2 pl-11">
                  {day.activities.map(act => (
                    <div key={act.id} className="flex gap-3 py-2.5 relative"
                      style={{ borderLeft: '1px solid var(--border)', paddingLeft: '16px', marginLeft: '-16px' }}>
                      <div className="absolute left-[-4px] top-4 w-2 h-2 rounded-full" style={{ background: 'var(--gold)' }} />
                      <div>
                        <div className="text-[10px] font-semibold uppercase tracking-wide mb-0.5" style={{ color: 'var(--gold)' }}>
                          {act.emoji} {act.type}
                        </div>
                        <div className="text-sm font-semibold">{act.text}</div>
                        {act.notes && <div className="text-xs mt-0.5" style={{ color: 'var(--text2)' }}>{act.notes}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <Link href="/create">
          <button className="btn-primary mt-6">✦ Create My Version of This Trip</button>
        </Link>
      </div>
    </div>
  )
}

export default function TripDetail({ trip }: Props) {
  return (
    <AppStateProvider>
      <ToastProvider>
        <Detail trip={trip} />
      </ToastProvider>
    </AppStateProvider>
  )
}
