'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { MOCK_PROFILES, MOCK_TRIPS } from '@/lib/mock-data'
import TripCard from '@/components/feed/TripCard'

const ME = MOCK_PROFILES.find(p => p.id === 'me')!
const MY_TRIPS = MOCK_TRIPS.filter(t => t.author.id === 'me')
// For demo, "saved" trips are the ones not by me
const SAVED_TRIPS = MOCK_TRIPS.filter(t => t.author.id !== 'me').slice(0, 2)

type Tab = 'trips' | 'saved'

const SETTINGS_ROWS = [
  { icon: '🔔', label: 'Notifications', value: 'On' },
  { icon: '🔒', label: 'Privacy', value: 'Friends only' },
  { icon: '🌍', label: 'Default visibility', value: 'Public' },
  { icon: '📍', label: 'Location sharing', value: 'Off' },
]

export default function ProfilePage() {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('trips')
  const [showSettings, setShowSettings] = useState(false)

  const displayTrips = tab === 'trips' ? MY_TRIPS : SAVED_TRIPS

  return (
    <div className="flex flex-col flex-1 overflow-y-auto no-scrollbar pb-24">

      {/* Header bar */}
      <div className="flex items-center justify-between px-5 pt-14 pb-3">
        <h1 className="font-head text-[22px]">My Profile</h1>
        <button
          onClick={() => setShowSettings(s => !s)}
          className="w-9 h-9 flex items-center justify-center rounded-full transition-colors"
          style={{ background: 'var(--bg3)', border: '1px solid var(--border)' }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="18" height="18">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>
      </div>

      {/* Avatar + bio */}
      <div className="flex flex-col items-center px-5 py-4">
        <div className="relative mb-3">
          <div className="w-[88px] h-[88px] rounded-full overflow-hidden"
            style={{ border: '3px solid var(--gold)' }}>
            <Image
              src={ME.avatar_url ?? 'https://i.pravatar.cc/104?img=9'}
              alt={ME.full_name}
              width={88} height={88}
              className="object-cover"
            />
          </div>
          {/* Edit avatar button */}
          <button
            className="absolute bottom-0 right-0 w-7 h-7 rounded-full flex items-center justify-center"
            style={{ background: 'var(--gold)', border: '2px solid var(--bg)' }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="#0B0B14" strokeWidth="2.5" width="12" height="12">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
        </div>

        <h2 className="font-head text-xl mb-0.5">{ME.full_name}</h2>
        <div className="text-xs mb-2" style={{ color: 'var(--text2)' }}>@{ME.username}</div>
        <p className="text-sm text-center max-w-[220px]" style={{ color: 'var(--text2)' }}>
          {ME.bio}
        </p>
      </div>

      {/* Stats row */}
      <div className="flex justify-center gap-0 mx-5 mb-5 rounded-[14px] overflow-hidden"
        style={{ background: 'var(--bg3)', border: '1px solid var(--border)' }}>
        {[
          { label: 'Trips', value: ME.trip_count },
          { label: 'Followers', value: ME.follower_count.toLocaleString() },
          { label: 'Following', value: ME.following_count },
        ].map((s, i, arr) => (
          <div key={s.label}
            className="flex-1 flex flex-col items-center py-4"
            style={i < arr.length - 1 ? { borderRight: '1px solid var(--border)' } : {}}>
            <div className="text-lg font-bold" style={{ color: 'var(--gold)' }}>{s.value}</div>
            <div className="text-[11px] mt-0.5" style={{ color: 'var(--text2)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tab switcher */}
      <div className="flex mx-5 mb-4 rounded-[10px] overflow-hidden p-1 gap-1"
        style={{ background: 'var(--bg3)', border: '1px solid var(--border)' }}>
        {(['trips', 'saved'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="flex-1 py-2 rounded-[8px] text-xs font-semibold uppercase tracking-wide transition-all"
            style={tab === t
              ? { background: 'var(--gold)', color: '#0B0B14' }
              : { color: 'var(--text2)' }}
          >
            {t === 'trips' ? `✈ My Trips` : `🔖 Saved`}
          </button>
        ))}
      </div>

      {/* Trip list */}
      {displayTrips.length > 0 ? (
        <div className="flex flex-col px-5">
          {displayTrips.map((trip, i) => (
            <TripCard key={trip.id} trip={trip} animationDelay={i * 60} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center px-8">
          <div className="text-4xl mb-3">{tab === 'trips' ? '✈️' : '🔖'}</div>
          <div className="text-sm font-semibold mb-1">
            {tab === 'trips' ? 'No trips yet' : 'Nothing saved yet'}
          </div>
          <div className="text-xs mb-4" style={{ color: 'var(--text2)' }}>
            {tab === 'trips'
              ? 'Create your first itinerary and share it with friends'
              : 'Tap the bookmark on any trip to save it here'}
          </div>
          {tab === 'trips' && (
            <button className="btn-primary text-sm px-6" onClick={() => router.push('/create')}>
              + Create a Trip
            </button>
          )}
        </div>
      )}

      {/* Settings panel */}
      {showSettings && (
        <div className="mx-5 mt-6 rounded-[14px] overflow-hidden"
          style={{ border: '1px solid var(--border)' }}>
          <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
            <div className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text3)' }}>
              Settings
            </div>
          </div>
          {SETTINGS_ROWS.map((row, i) => (
            <div key={row.label}
              className="flex items-center gap-3 px-4 py-3.5"
              style={i < SETTINGS_ROWS.length - 1 ? { borderBottom: '1px solid var(--border)' } : {}}>
              <span className="text-[18px]">{row.icon}</span>
              <div className="flex-1 text-sm">{row.label}</div>
              <div className="text-xs font-medium" style={{ color: 'var(--gold)' }}>{row.value}</div>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"
                style={{ color: 'var(--text3)', flexShrink: 0 }}>
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
          ))}
          <div className="px-4 py-3.5" style={{ borderTop: '1px solid var(--border)' }}>
            <button className="w-full text-sm font-semibold py-2.5 rounded-[10px] transition-colors"
              style={{ background: 'rgba(255,80,80,0.1)', color: '#ff6b6b', border: '1px solid rgba(255,80,80,0.2)' }}>
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
