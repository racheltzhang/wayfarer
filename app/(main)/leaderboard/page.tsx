'use client'

import Image from 'next/image'
import { useState } from 'react'
import { MOCK_PROFILES, MOCK_TRIPS } from '@/lib/mock-data'
import { useAppState } from '@/lib/app-state'
import { useToast } from '@/components/ui/Toast'

type BoardTab = 'active' | 'destinations' | 'streak'

// ── Mock leaderboard data ──────────────────────────────────────

interface LeaderEntry {
  profile: (typeof MOCK_PROFILES)[0]
  tripsThisMonth: number
  totalTrips:     number
  totalDays:      number
  countries:      number
  streak:         number        // days streak
  topDestination: string
  badge:          string
}

const BOARD: LeaderEntry[] = [
  {
    profile:        MOCK_PROFILES[2], // Sofia Lim
    tripsThisMonth: 4,
    totalTrips:     15,
    totalDays:      87,
    countries:      11,
    streak:         22,
    topDestination: 'Kyoto, Japan',
    badge:          '🏅 Explorer',
  },
  {
    profile:        MOCK_PROFILES[0], // Maya Chen
    tripsThisMonth: 3,
    totalTrips:     12,
    totalDays:      68,
    countries:      9,
    streak:         14,
    topDestination: 'Tokyo, Japan',
    badge:          '🌟 Globetrotter',
  },
  {
    profile:        MOCK_PROFILES[1], // James Ortega
    tripsThisMonth: 2,
    totalTrips:     8,
    totalDays:      42,
    countries:      6,
    streak:         7,
    topDestination: 'Amalfi, Italy',
    badge:          '🍝 Food Lover',
  },
  {
    profile:        MOCK_PROFILES[4], // Rachel (me)
    tripsThisMonth: 1,
    totalTrips:     7,
    totalDays:      31,
    countries:      4,
    streak:         5,
    topDestination: 'New York, USA',
    badge:          '✈️ Rising Star',
  },
  {
    profile:        MOCK_PROFILES[3], // Alex Rivera
    tripsThisMonth: 1,
    totalTrips:     6,
    totalDays:      28,
    countries:      5,
    streak:         3,
    topDestination: 'Ubud, Bali',
    badge:          '🌿 Wanderer',
  },
]

const TABS: { id: BoardTab; label: string; emoji: string }[] = [
  { id: 'active',       label: 'Most Active',   emoji: '🔥' },
  { id: 'destinations', label: 'Countries',      emoji: '🌍' },
  { id: 'streak',       label: 'Streak',         emoji: '⚡' },
]

function sortedBoard(tab: BoardTab) {
  return [...BOARD].sort((a, b) => {
    if (tab === 'active')       return b.tripsThisMonth - a.tripsThisMonth
    if (tab === 'destinations') return b.countries - a.countries
    return b.streak - a.streak
  })
}

function statValue(entry: LeaderEntry, tab: BoardTab) {
  if (tab === 'active')       return `${entry.tripsThisMonth} trips this month`
  if (tab === 'destinations') return `${entry.countries} countries`
  return `${entry.streak}d streak`
}

const MEDALS = ['🥇', '🥈', '🥉']

export default function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState<BoardTab>('active')
  const { followingIds, toggleFollow } = useAppState()
  const { showToast } = useToast()
  const ranked = sortedBoard(activeTab)

  const myRank = ranked.findIndex(e => e.profile.id === 'me') + 1

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div
        className="flex-shrink-0 px-5 pt-14 pb-3"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <div className="flex items-center justify-between mb-3">
          <h1 className="font-head text-[22px]">Leaderboard</h1>
          <div
            className="text-xs font-semibold px-3 py-1 rounded-full"
            style={{ background: 'var(--gold-dim)', color: 'var(--gold)', border: '1px solid var(--gold)' }}
          >
            You: #{myRank}
          </div>
        </div>

        {/* Tabs */}
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

      {/* Podium — top 3 */}
      <div className="flex items-end justify-center gap-4 px-6 pt-6 pb-4 flex-shrink-0">
        {/* 2nd */}
        <PodiumSlot entry={ranked[1]} rank={2} medal="🥈" height={80} />
        {/* 1st */}
        <PodiumSlot entry={ranked[0]} rank={1} medal="🥇" height={100} />
        {/* 3rd */}
        <PodiumSlot entry={ranked[2]} rank={3} medal="🥉" height={64} />
      </div>

      {/* Full list */}
      <div className="flex-1 overflow-y-auto px-4 pb-6">
        <div className="text-[11px] mb-3 font-medium" style={{ color: 'var(--text3)' }}>
          All travellers
        </div>

        {ranked.map((entry, i) => {
          const isMe = entry.profile.id === 'me'
          const following = followingIds.has(entry.profile.id)

          return (
            <div
              key={entry.profile.id}
              className="flex items-center gap-3 p-3 rounded-[14px] mb-2"
              style={{
                background: isMe ? 'rgba(212,175,55,0.08)' : 'var(--card)',
                border: `1px solid ${isMe ? 'rgba(212,175,55,0.3)' : 'var(--border)'}`,
              }}
            >
              {/* Rank */}
              <div
                className="flex-shrink-0 text-center font-head"
                style={{ width: 28, fontSize: i < 3 ? 18 : 14, color: i < 3 ? 'var(--gold)' : 'var(--text3)' }}
              >
                {i < 3 ? MEDALS[i] : `#${i + 1}`}
              </div>

              {/* Avatar */}
              <div className="relative flex-shrink-0" style={{ width: 42, height: 42 }}>
                {entry.profile.avatar_url ? (
                  <Image
                    src={entry.profile.avatar_url}
                    alt={entry.profile.full_name}
                    width={42} height={42}
                    className="rounded-full object-cover"
                    style={{ border: isMe ? '2px solid var(--gold)' : '1.5px solid var(--border)' }}
                  />
                ) : (
                  <div className="w-full h-full rounded-full flex items-center justify-center font-semibold"
                    style={{ background: 'var(--bg3)', color: 'var(--gold)', fontSize: 16 }}>
                    {entry.profile.full_name[0]}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-semibold truncate">
                    {entry.profile.full_name}{isMe ? ' (you)' : ''}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full flex-shrink-0"
                    style={{ background: 'var(--bg3)', color: 'var(--text3)' }}>
                    {entry.badge}
                  </span>
                </div>
                <div className="text-[11px] mt-0.5" style={{ color: 'var(--gold)' }}>
                  {statValue(entry, activeTab)}
                </div>
                <div className="text-[10px]" style={{ color: 'var(--text3)' }}>
                  📍 {entry.topDestination}
                </div>
              </div>

              {/* Follow */}
              {!isMe && (
                <button
                  className="flex-shrink-0 text-[11px] font-semibold px-2.5 py-1 rounded-full transition-colors"
                  style={{
                    background: following ? 'transparent' : 'var(--gold)',
                    border: `1px solid ${following ? 'var(--border)' : 'var(--gold)'}`,
                    color: following ? 'var(--text2)' : 'var(--bg)',
                  }}
                  onClick={() => {
                    toggleFollow(entry.profile.id)
                    showToast(following ? `Unfollowed ${entry.profile.full_name}` : `Following ${entry.profile.full_name}!`)
                  }}
                >
                  {following ? 'Following' : 'Follow'}
                </button>
              )}
            </div>
          )
        })}

        {/* This week's highlights */}
        <div className="mt-5 mb-2 text-[11px] font-medium" style={{ color: 'var(--text3)' }}>
          This week's highlights
        </div>
        {[
          { emoji: '🏆', text: 'Sofia visited her 11th country — Vietnam!' },
          { emoji: '🔥', text: 'Maya is on a 14-day planning streak' },
          { emoji: '✈️', text: 'James just posted from the Amalfi Coast' },
        ].map((h, i) => (
          <div
            key={i}
            className="flex items-center gap-3 p-3 rounded-[12px] mb-2"
            style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}
          >
            <span style={{ fontSize: 20 }}>{h.emoji}</span>
            <div className="text-[12px]" style={{ color: 'var(--text2)' }}>{h.text}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function PodiumSlot({ entry, rank, medal, height }: {
  entry: LeaderEntry; rank: number; medal: string; height: number
}) {
  return (
    <div className="flex flex-col items-center gap-1.5" style={{ width: 80 }}>
      <div style={{ fontSize: 20 }}>{medal}</div>
      <div className="relative" style={{ width: 52, height: 52 }}>
        {entry.profile.avatar_url ? (
          <Image
            src={entry.profile.avatar_url}
            alt={entry.profile.full_name}
            width={52} height={52}
            className="rounded-full object-cover"
            style={{ border: rank === 1 ? '2.5px solid var(--gold)' : '1.5px solid var(--border)' }}
          />
        ) : (
          <div className="w-full h-full rounded-full flex items-center justify-center font-bold text-lg"
            style={{ background: 'var(--bg3)', color: 'var(--gold)' }}>
            {entry.profile.full_name[0]}
          </div>
        )}
      </div>
      <div className="text-[11px] font-semibold text-center leading-tight" style={{ color: rank === 1 ? 'var(--gold)' : 'var(--text)' }}>
        {entry.profile.full_name.split(' ')[0]}
      </div>
      {/* Podium block */}
      <div
        className="w-full rounded-t-[8px] flex items-end justify-center pb-1"
        style={{
          height,
          background: rank === 1
            ? 'linear-gradient(to top, rgba(200,165,90,0.3), rgba(200,165,90,0.1))'
            : 'var(--bg2)',
          border: `1px solid ${rank === 1 ? 'rgba(200,165,90,0.3)' : 'var(--border)'}`,
        }}
      >
        <span className="font-head text-sm" style={{ color: 'var(--text3)' }}>#{rank}</span>
      </div>
    </div>
  )
}
