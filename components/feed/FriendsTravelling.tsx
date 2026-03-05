'use client'

import Image from 'next/image'
import { useToast } from '@/components/ui/Toast'

interface TravelEntry {
  id: string
  name: string
  firstName: string
  avatarUrl: string
  destination: string
  flag: string
  dayIn: number
  totalDays: number
  status: 'now' | 'planning' | 'just_back'
  coverSeed: string
}

const TRAVELLING: TravelEntry[] = [
  {
    id: 'u1',
    name: 'Maya Chen',
    firstName: 'Maya',
    avatarUrl: 'https://i.pravatar.cc/64?img=47',
    destination: 'Kyoto',
    flag: '🇯🇵',
    dayIn: 6,
    totalDays: 10,
    status: 'now',
    coverSeed: 'kyoto-cover88',
  },
  {
    id: 'u2',
    name: 'James Ortega',
    firstName: 'James',
    avatarUrl: 'https://i.pravatar.cc/64?img=11',
    destination: 'Amalfi Coast',
    flag: '🇮🇹',
    dayIn: 3,
    totalDays: 7,
    status: 'now',
    coverSeed: 'amalfi-cover77',
  },
  {
    id: 'u3',
    name: 'Sofia Lim',
    firstName: 'Sofia',
    avatarUrl: 'https://i.pravatar.cc/64?img=5',
    destination: 'Marrakech',
    flag: '🇲🇦',
    dayIn: 0,
    totalDays: 8,
    status: 'planning',
    coverSeed: 'morocco-cover55',
  },
  {
    id: 'u4',
    name: 'Alex Rivera',
    firstName: 'Alex',
    avatarUrl: 'https://i.pravatar.cc/64?img=32',
    destination: 'Bali',
    flag: '🇮🇩',
    dayIn: 12,
    totalDays: 12,
    status: 'just_back',
    coverSeed: 'bali-cover44',
  },
]

function statusLabel(entry: TravelEntry): { text: string; color: string; dot: boolean } {
  if (entry.status === 'now') {
    return {
      text: `Day ${entry.dayIn} of ${entry.totalDays}`,
      color: '#4ade80',
      dot: true,
    }
  }
  if (entry.status === 'planning') {
    return {
      text: `${entry.totalDays}d trip — planning`,
      color: 'var(--gold)',
      dot: false,
    }
  }
  return {
    text: 'Just got back',
    color: 'var(--text3)',
    dot: false,
  }
}

export default function FriendsTravelling() {
  const { showToast } = useToast()

  return (
    <div className="px-5 mb-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[15px] font-semibold">Friends Travelling</h2>
        <button className="text-xs font-medium" style={{ color: 'var(--gold)' }}>See all</button>
      </div>

      <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
        {TRAVELLING.map(entry => {
          const status = statusLabel(entry)
          return (
            <button
              key={entry.id}
              onClick={() => showToast(
                entry.status === 'now'
                  ? `${entry.flag} ${entry.firstName} is in ${entry.destination} right now!`
                  : entry.status === 'planning'
                  ? `✈️ ${entry.firstName} is heading to ${entry.destination} soon`
                  : `🏠 ${entry.firstName} just got back from ${entry.destination}`
              )}
              className="flex-shrink-0 rounded-[14px] overflow-hidden active:scale-[0.97] transition-transform"
              style={{
                width: 140,
                background: 'var(--bg3)',
                border: '1px solid var(--border)',
                textAlign: 'left',
              }}
            >
              {/* Cover thumbnail */}
              <div className="relative w-full" style={{ height: 88 }}>
                <Image
                  src={`https://picsum.photos/seed/${entry.coverSeed}/280/176`}
                  alt={entry.destination}
                  fill
                  className="object-cover"
                />
                {/* Gradient */}
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'linear-gradient(to bottom, transparent 30%, rgba(11,11,20,0.65) 100%)',
                  pointerEvents: 'none',
                }} />

                {/* Live dot + status */}
                <div style={{
                  position: 'absolute', top: 7, left: 7,
                  display: 'flex', alignItems: 'center', gap: 4,
                  background: 'rgba(11,11,20,0.7)', backdropFilter: 'blur(6px)',
                  borderRadius: 20, padding: '2px 7px',
                }}>
                  {status.dot && (
                    <span style={{
                      width: 6, height: 6, borderRadius: '50%',
                      background: '#4ade80',
                      boxShadow: '0 0 6px #4ade80',
                      flexShrink: 0,
                    }} />
                  )}
                  <span style={{ fontSize: 10, fontWeight: 700, color: status.color, lineHeight: 1.2 }}>
                    {entry.status === 'now' ? '● Live' : entry.status === 'planning' ? '✈ Soon' : '✓ Back'}
                  </span>
                </div>

                {/* Avatar (bottom left) */}
                <div style={{ position: 'absolute', bottom: 7, left: 7 }}>
                  <Image
                    src={entry.avatarUrl}
                    alt={entry.name}
                    width={26}
                    height={26}
                    className="rounded-full object-cover"
                    style={{ border: '1.5px solid white' }}
                  />
                </div>
              </div>

              {/* Info */}
              <div className="px-2.5 py-2">
                <div className="text-[12px] font-semibold leading-tight truncate">{entry.firstName}</div>
                <div className="flex items-center gap-1 mt-0.5">
                  <span style={{ fontSize: 11 }}>{entry.flag}</span>
                  <span className="text-[11px] truncate" style={{ color: 'var(--text2)' }}>{entry.destination}</span>
                </div>
                <div className="text-[10px] font-semibold mt-1" style={{ color: status.color }}>
                  {status.text}
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
