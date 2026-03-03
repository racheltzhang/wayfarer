'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRef, useState } from 'react'
import { useToast } from '@/components/ui/Toast'
import { useAppState } from '@/lib/app-state'
import { formatRating, formatCount } from '@/lib/utils'
import type { Trip } from '@/lib/types'

interface Props {
  trip: Trip
  animationDelay?: number
}

// Generate a small set of extra photo URLs from picsum using trip id as seed
function getExtraPhotos(trip: Trip): string[] {
  return [1, 2, 3, 4].map(i =>
    `https://picsum.photos/seed/${trip.id}-x${i}/300/300`
  )
}

function timeAgo(dateStr: string): string {
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000)
  if (days === 0) return 'today'
  if (days === 1) return '1d ago'
  if (days < 7) return `${days}d ago`
  if (days < 30) return `${Math.floor(days / 7)}w ago`
  return `${Math.floor(days / 30)}mo ago`
}

export default function TripCard({ trip, animationDelay = 0 }: Props) {
  const { showToast }                       = useToast()
  const { likedIds, savedIds, toggleLike, toggleSave } = useAppState()
  const liked = likedIds.has(trip.id)
  const saved = savedIds.has(trip.id)

  // ── Double-tap to like ──────────────────────────────────────
  const lastTapRef  = useRef<number>(0)
  const [showHeart, setShowHeart] = useState(false)

  function handleCardTap() {
    const now = Date.now()
    if (now - lastTapRef.current < 320) {
      // Double tap detected
      if (!liked) toggleLike(trip.id)
      setShowHeart(true)
      setTimeout(() => setShowHeart(false), 750)
      lastTapRef.current = 0 // reset so triple-tap doesn't re-fire
    } else {
      lastTapRef.current = now
    }
  }

  const extraPhotos = getExtraPhotos(trip)

  return (
    <div
      className="card mb-3 overflow-hidden animate-fade-up"
      style={{ animationDelay: `${animationDelay}ms`, position: 'relative', cursor: 'default' }}
      onClick={handleCardTap}
    >
      {/* ── Heart burst on double-tap ────────────────────────── */}
      {showHeart && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 20,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          pointerEvents: 'none',
        }}>
          <span style={{ fontSize: 72, animation: 'heartPop 0.75s ease forwards' }}>❤️</span>
        </div>
      )}

      {/* ── Author row ───────────────────────────────────────── */}
      <div className="flex items-center gap-2.5 px-4 pt-4 pb-2.5">
        {trip.author.avatar_url ? (
          <Image
            src={trip.author.avatar_url} alt={trip.author.full_name}
            width={36} height={36}
            className="rounded-full object-cover flex-shrink-0"
            style={{ border: '1.5px solid var(--border)' }}
          />
        ) : (
          <div style={{
            width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
            background: 'var(--gold-dim)', border: '1px solid var(--gold)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, fontWeight: 700, color: 'var(--gold)',
          }}>
            {trip.author.full_name[0]}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold leading-tight">{trip.author.full_name}</div>
          <div className="text-[11px]" style={{ color: 'var(--text3)' }}>
            {timeAgo(trip.created_at)}
          </div>
        </div>
        {trip.rating != null && (
          <div className="flex items-center gap-0.5 text-xs font-semibold" style={{ color: 'var(--gold)' }}>
            ★ {formatRating(trip.rating)}
          </div>
        )}
      </div>

      {/* ── Text content ─────────────────────────────────────── */}
      <div className="px-4 pb-3">
        {/* Title — tapping navigates, stops double-tap propagation */}
        <Link href={`/trip/${trip.id}`} onClick={e => e.stopPropagation()}>
          <h3 className="font-head text-[18px] leading-snug mb-1 hover:opacity-80 transition-opacity">
            {trip.title}
          </h3>
        </Link>

        {/* Location + duration */}
        <div className="flex items-center gap-1 text-xs mb-2.5" style={{ color: 'var(--text2)' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="11" height="11" style={{ flexShrink: 0 }}>
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
          </svg>
          <span>{trip.location}</span>
          <span style={{ color: 'var(--text3)' }}>·</span>
          <span style={{ color: 'var(--text3)' }}>{trip.duration_days}d</span>
        </div>

        {/* Tags */}
        {trip.tags.length > 0 && (
          <div className="flex gap-1.5 flex-wrap">
            {trip.tags.slice(0, 4).map(tag => (
              <span key={tag} className="chip text-[11px] py-0.5">#{tag}</span>
            ))}
          </div>
        )}
      </div>

      {/* ── Hero photo ───────────────────────────────────────── */}
      {trip.cover_image_url && (
        <Link href={`/trip/${trip.id}`} onClick={e => e.stopPropagation()}>
          <div className="relative mx-3 rounded-[12px] overflow-hidden" style={{ height: 210 }}>
            <Image src={trip.cover_image_url} alt={trip.title} fill className="object-cover" />
            {/* subtle vignette */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(to bottom, transparent 60%, rgba(11,11,20,0.35) 100%)',
              pointerEvents: 'none',
            }} />
          </div>
        </Link>
      )}

      {/* ── Extra photo strip ────────────────────────────────── */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar px-3 pt-2">
        {extraPhotos.map((url, i) => (
          <Link key={i} href={`/trip/${trip.id}`} onClick={e => e.stopPropagation()}>
            <div className="relative flex-shrink-0 rounded-[8px] overflow-hidden" style={{ width: 68, height: 68 }}>
              <Image src={url} alt="" fill className="object-cover" />
            </div>
          </Link>
        ))}
      </div>

      {/* ── Action bar ───────────────────────────────────────── */}
      <div
        className="flex items-center gap-3 px-4 py-3 mt-2"
        style={{ borderTop: '1px solid var(--border)' }}
      >
        {/* Like */}
        <button
          className="flex items-center gap-1.5 text-xs transition-colors"
          style={{ color: liked ? 'var(--rose)' : 'var(--text2)' }}
          onClick={e => {
            e.stopPropagation()
            toggleLike(trip.id)
            showToast(liked ? '♡ Removed like' : '❤️ Added to likes')
          }}
        >
          <svg viewBox="0 0 24 24" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" width="16" height="16">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
          {formatCount(liked ? trip.like_count + 1 : trip.like_count)}
        </button>

        {/* Comment */}
        <button
          className="flex items-center gap-1.5 text-xs"
          style={{ color: 'var(--text2)' }}
          onClick={e => { e.stopPropagation(); showToast('💬 Comments coming soon') }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          Comment
        </button>

        {/* Save */}
        <button
          className="flex items-center gap-1.5 text-xs ml-auto transition-colors"
          style={{ color: saved ? 'var(--gold)' : 'var(--text2)' }}
          onClick={e => {
            e.stopPropagation()
            toggleSave(trip.id)
            showToast(saved ? '○ Removed from saves' : '✦ Saved')
          }}
        >
          <svg viewBox="0 0 24 24" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" width="16" height="16">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
          </svg>
          {saved ? 'Saved' : 'Save'}
        </button>
      </div>
    </div>
  )
}
