'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useToast } from '@/components/ui/Toast'
import { formatRating, formatCount, starsFilled } from '@/lib/utils'
import type { Trip } from '@/lib/types'

interface Props {
  trip: Trip
  animationDelay?: number
}

export default function TripCard({ trip, animationDelay = 0 }: Props) {
  const { showToast } = useToast()
  const [liked, setLiked] = useState(trip.is_liked ?? false)
  const [likeCount, setLikeCount] = useState(trip.like_count)
  const [saved, setSaved] = useState(trip.is_saved ?? false)
  const filled = starsFilled(trip.rating)

  function toggleLike(e: React.MouseEvent) {
    e.preventDefault()
    const next = !liked
    setLiked(next)
    setLikeCount(c => next ? c + 1 : c - 1)
    showToast(next ? '❤️ Added to likes' : '♡ Removed like')
  }

  function toggleSave(e: React.MouseEvent) {
    e.preventDefault()
    setSaved(v => !v)
    showToast(!saved ? '✦ Saved to My Trips' : '○ Removed from saves')
  }

  return (
    <Link href={`/trip/${trip.id}`}>
      <div
        className="card mb-4 overflow-hidden active:scale-[0.98] transition-transform animate-fade-up"
        style={{ animationDelay: `${animationDelay}ms` }}
      >
        {/* Cover image */}
        <div className="relative h-[200px]">
          {trip.cover_image_url && (
            <Image src={trip.cover_image_url} alt={trip.title} fill className="object-cover" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          {/* Rating badge */}
          <div
            className="absolute top-3 right-3 flex items-center gap-1 text-xs font-semibold rounded-full px-2.5 py-1"
            style={{ background: 'rgba(11,11,20,0.75)', backdropFilter: 'blur(8px)', border: '1px solid var(--border)', color: 'var(--gold-lt)' }}
          >
            <span>★</span> {formatRating(trip.rating)}
          </div>
        </div>

        {/* Body */}
        <div className="p-4">
          {/* Title row */}
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="font-head text-[18px] font-normal leading-snug">{trip.title}</h3>
              <div className="flex items-center gap-1 text-xs mt-0.5" style={{ color: 'var(--text2)' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                </svg>
                {trip.location}
              </div>
            </div>
            <div className="flex gap-0.5 flex-shrink-0 mt-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} className="text-xs" style={{ color: i < filled ? 'var(--gold)' : 'var(--text3)' }}>★</span>
              ))}
            </div>
          </div>

          {/* Author */}
          <div className="flex items-center gap-2 mb-3">
            {trip.author.avatar_url && (
              <Image src={trip.author.avatar_url} alt={trip.author.full_name} width={24} height={24}
                className="rounded-full object-cover" />
            )}
            <span className="text-xs" style={{ color: 'var(--text2)' }}>
              by <span style={{ color: 'var(--text)', fontWeight: 500 }}>{trip.author.full_name}</span>
            </span>
          </div>

          {/* Tags */}
          <div className="flex gap-1.5 flex-wrap mb-3">
            {trip.tags.slice(0, 3).map(tag => (
              <span key={tag} className="chip text-[11px] py-1">{tag}</span>
            ))}
            <span className="chip text-[11px] py-1">{trip.duration_days} days</span>
          </div>

          {/* Actions */}
          <div
            className="flex items-center gap-3 pt-3"
            style={{ borderTop: '1px solid var(--border)' }}
          >
            <button
              className="flex items-center gap-1.5 text-xs transition-colors"
              style={{ color: liked ? 'var(--rose)' : 'var(--text2)' }}
              onClick={toggleLike}
            >
              <svg viewBox="0 0 24 24" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" width="16" height="16">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              {formatCount(likeCount)}
            </button>

            <button
              className="flex items-center gap-1.5 text-xs"
              style={{ color: 'var(--text2)' }}
              onClick={e => { e.preventDefault(); showToast('💬 Comments coming soon') }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              Comment
            </button>

            <button
              className="flex items-center gap-1.5 text-xs ml-auto transition-colors"
              style={{ color: saved ? 'var(--gold)' : 'var(--text2)' }}
              onClick={toggleSave}
            >
              <svg viewBox="0 0 24 24" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" width="16" height="16">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
              </svg>
              {saved ? 'Saved' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </Link>
  )
}
