'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { MOCK_PROFILES, MOCK_TRIPS } from '@/lib/mock-data'
import { useAppState } from '@/lib/app-state'
import { useToast } from '@/components/ui/Toast'
import type { Profile } from '@/lib/types'

const ME = MOCK_PROFILES.find(p => p.id === 'me')!
const MY_TRIPS = MOCK_TRIPS.filter(t => t.author.id === 'me')
const ALL_USERS = MOCK_PROFILES.filter(p => p.id !== 'me')

type Tab = 'trips' | 'saved'
type Sheet = null | 'followers' | 'following' | 'settings'

const SETTINGS_ROWS = [
  { icon: '🔔', label: 'Notifications',     value: 'On' },
  { icon: '🔒', label: 'Privacy',            value: 'Friends only' },
  { icon: '🌍', label: 'Default visibility', value: 'Public' },
  { icon: '📍', label: 'Location sharing',   value: 'Off' },
]

// ─── Small trip grid cell ───────────────────────────────────────
function TripCell({ trip }: { trip: (typeof MOCK_TRIPS)[0] }) {
  return (
    <Link href={`/trip/${trip.id}`}>
      <div className="relative aspect-square overflow-hidden" style={{ borderRadius: 2 }}>
        {trip.cover_image_url && (
          <Image src={trip.cover_image_url} alt={trip.title} fill className="object-cover" />
        )}
        {/* bottom gradient + title */}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, rgba(11,11,20,0.85) 0%, transparent 55%)' }}
        />
        <div className="absolute bottom-0 left-0 right-0 p-2">
          <div className="text-[10px] font-semibold leading-tight line-clamp-2" style={{ color: '#F4EFE6' }}>
            {trip.country_emoji} {trip.title}
          </div>
        </div>
        {/* rating badge */}
        <div
          className="absolute top-1.5 right-1.5 flex items-center gap-0.5 text-[9px] font-bold rounded-full px-1.5 py-0.5"
          style={{ background: 'rgba(11,11,20,0.75)', color: 'var(--gold-lt)', backdropFilter: 'blur(6px)' }}
        >
          ★ {trip.rating?.toFixed(1) ?? '—'}
        </div>
      </div>
    </Link>
  )
}

// ─── User row in follow sheet ───────────────────────────────────
function UserRow({ user, isFollowing, onToggle }: {
  user: Profile
  isFollowing: boolean
  onToggle: () => void
}) {
  return (
    <div className="flex items-center gap-3 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
      <Image
        src={user.avatar_url ?? 'https://i.pravatar.cc/64?img=1'}
        alt={user.full_name} width={44} height={44}
        className="rounded-full object-cover flex-shrink-0"
        style={{ border: '2px solid var(--border)' }}
      />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold truncate">{user.full_name}</div>
        <div className="text-xs mt-0.5" style={{ color: 'var(--text2)' }}>
          @{user.username} · {user.trip_count} trips
        </div>
      </div>
      <button
        onClick={onToggle}
        className="text-xs font-semibold px-4 py-1.5 rounded-full flex-shrink-0 transition-all"
        style={isFollowing
          ? { background: 'var(--bg3)', color: 'var(--text2)', border: '1px solid var(--border)' }
          : { background: 'var(--gold)', color: '#0B0B14' }}
      >
        {isFollowing ? 'Following' : 'Follow'}
      </button>
    </div>
  )
}

export default function ProfilePage() {
  const router = useRouter()
  const { showToast } = useToast()
  const { savedIds, followingIds, toggleFollow } = useAppState()

  const [tab,   setTab]   = useState<Tab>('trips')
  const [sheet, setSheet] = useState<Sheet>(null)

  const followingCount = followingIds.size
  const followerCount  = ME.follower_count

  const followerUsers  = ALL_USERS
  const followingUsers = ALL_USERS.filter(u => followingIds.has(u.id))

  const savedTrips   = MOCK_TRIPS.filter(t => savedIds.has(t.id))
  const displayTrips = tab === 'trips' ? MY_TRIPS : savedTrips

  return (
    <div className="flex flex-col flex-1 overflow-y-auto no-scrollbar pb-24">

      {/* ── Top bar ─────────────────────────────────── */}
      <div className="flex items-center justify-between px-5 pt-14 pb-2">
        <h1 className="font-head text-[20px]">@{ME.username}</h1>
        <button
          onClick={() => setSheet('settings')}
          className="w-9 h-9 flex items-center justify-center rounded-full transition-colors"
          style={{ background: 'var(--bg3)', border: '1px solid var(--border)' }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="18" height="18">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>
      </div>

      {/* ── Avatar + stats row (Instagram-style) ──── */}
      <div className="flex items-center gap-5 px-5 py-4">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div
            className="w-[82px] h-[82px] rounded-full overflow-hidden"
            style={{ border: '2.5px solid var(--gold)' }}
          >
            <Image
              src={ME.avatar_url ?? 'https://i.pravatar.cc/104?img=9'}
              alt={ME.full_name} width={82} height={82} className="object-cover"
            />
          </div>
          {/* Edit icon */}
          <button
            className="absolute bottom-0 right-0 w-6 h-6 rounded-full flex items-center justify-center"
            style={{ background: 'var(--gold)', border: '2px solid var(--bg)' }}
            onClick={() => showToast('📸 Photo upload coming soon')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="#0B0B14" strokeWidth="2.5" width="10" height="10">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
        </div>

        {/* Stats */}
        <div className="flex-1 flex justify-around">
          {[
            { label: 'Trips',     value: MY_TRIPS.length || ME.trip_count, onClick: undefined },
            { label: 'Followers', value: followerCount,  onClick: () => setSheet('followers') },
            { label: 'Following', value: followingCount, onClick: () => setSheet('following') },
          ].map(s => (
            <button
              key={s.label}
              className="flex flex-col items-center gap-0.5 active:opacity-70 transition-opacity"
              onClick={s.onClick}
              disabled={!s.onClick}
            >
              <span className="text-[22px] font-bold leading-none" style={{ color: 'var(--text)' }}>
                {s.value}
              </span>
              <span className="text-[11px]" style={{ color: 'var(--text2)' }}>{s.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Name / bio / edit button ─────────────── */}
      <div className="px-5 pb-4">
        <div className="font-head text-[17px] leading-snug">{ME.full_name}</div>
        {ME.bio && (
          <p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--text2)' }}>{ME.bio}</p>
        )}
        <button
          className="mt-3 w-full py-2 rounded-[10px] text-sm font-semibold transition-colors"
          style={{ background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text)' }}
          onClick={() => showToast('✏️ Edit profile coming soon')}
        >
          Edit Profile
        </button>
      </div>

      {/* ── Tab switcher ──────────────────────────── */}
      <div
        className="flex mx-5 mb-0.5 rounded-[10px] overflow-hidden p-1 gap-1"
        style={{ background: 'var(--bg3)', border: '1px solid var(--border)' }}
      >
        {([['trips', '✈ Trips'], ['saved', '🔖 Want to Go']] as [Tab, string][]).map(([t, label]) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="flex-1 py-2 rounded-[8px] text-xs font-semibold uppercase tracking-wide transition-all"
            style={tab === t
              ? { background: 'var(--gold)', color: '#0B0B14' }
              : { color: 'var(--text2)' }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Trip photo grid ───────────────────────── */}
      <div className="mt-2">
        {displayTrips.length > 0 ? (
          <div className="grid grid-cols-2 gap-0.5 px-0">
            {displayTrips.map(trip => (
              <TripCell key={trip.id} trip={trip} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center px-8">
            <div className="text-4xl mb-3">{tab === 'trips' ? '✈️' : '🔖'}</div>
            <div className="text-sm font-semibold mb-1">
              {tab === 'trips' ? 'No trips yet' : 'Nothing saved yet'}
            </div>
            <div className="text-xs mb-4" style={{ color: 'var(--text2)' }}>
              {tab === 'trips' ? 'Plan your first adventure' : 'Bookmark trips from the feed'}
            </div>
            {tab === 'trips' && (
              <button className="btn-primary text-sm px-6" onClick={() => router.push('/create')}>
                + Create a Trip
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Followers / Following / Settings sheet ── */}
      {sheet !== null && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setSheet(null)}
            style={{
              position: 'fixed', inset: 0, zIndex: 40,
              background: 'rgba(11,11,20,0.6)',
              backdropFilter: 'blur(4px)',
            }}
          />
          {/* Sheet */}
          <div style={{
            position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 50,
            background: 'var(--bg2)',
            borderRadius: '20px 20px 0 0',
            border: '1px solid var(--border)',
            maxHeight: '80vh',
            display: 'flex',
            flexDirection: 'column',
          }}>
            {/* Handle + title */}
            <div className="flex-shrink-0 px-5 pt-4 pb-3" style={{ borderBottom: '1px solid var(--border)' }}>
              <div style={{ width: 36, height: 4, background: 'var(--text3)', borderRadius: 2, margin: '0 auto 12px' }} />
              <div className="text-[15px] font-bold">
                {sheet === 'followers' ? `${followerCount} Followers`
                  : sheet === 'following' ? `${followingCount} Following`
                  : 'Settings'}
              </div>
            </div>

            {/* Sheet body */}
            <div className="overflow-y-auto px-5 pb-8">
              {sheet === 'settings' ? (
                <>
                  {SETTINGS_ROWS.map((row, i) => (
                    <div
                      key={row.label}
                      className="flex items-center gap-3 py-3.5"
                      style={i < SETTINGS_ROWS.length - 1 ? { borderBottom: '1px solid var(--border)' } : {}}
                    >
                      <span className="text-[18px]">{row.icon}</span>
                      <div className="flex-1 text-sm">{row.label}</div>
                      <div className="text-xs font-medium" style={{ color: 'var(--gold)' }}>{row.value}</div>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"
                        style={{ color: 'var(--text3)', flexShrink: 0 }}>
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </div>
                  ))}
                  <div className="pt-4">
                    <button
                      className="w-full text-sm font-semibold py-2.5 rounded-[10px] transition-colors"
                      style={{ background: 'rgba(255,80,80,0.1)', color: '#ff6b6b', border: '1px solid rgba(255,80,80,0.2)' }}
                    >
                      Sign Out
                    </button>
                  </div>
                </>
              ) : (
                (sheet === 'followers' ? followerUsers : followingUsers).length === 0 ? (
                  <div className="text-center py-12 text-sm" style={{ color: 'var(--text2)' }}>
                    {sheet === 'following' ? "You aren't following anyone yet" : 'No followers yet'}
                  </div>
                ) : (
                  (sheet === 'followers' ? followerUsers : followingUsers).map(user => (
                    <UserRow
                      key={user.id}
                      user={user}
                      isFollowing={followingIds.has(user.id)}
                      onToggle={() => {
                        toggleFollow(user.id)
                        showToast(followingIds.has(user.id)
                          ? `Unfollowed ${user.full_name.split(' ')[0]}`
                          : `✓ Following ${user.full_name.split(' ')[0]}`)
                      }}
                    />
                  ))
                )
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
