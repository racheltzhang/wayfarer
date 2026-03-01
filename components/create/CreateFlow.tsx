'use client'

import { useState, useRef, useCallback } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/Toast'
import { MOCK_TRIPS, ACTIVITY_SUGGESTIONS } from '@/lib/mock-data'
import type { ActivityType, DraftDay, DraftActivity } from '@/lib/types'

// ─── Types ───────────────────────────────────────────────────

type Step = 'mode' | 'basics' | 'days' | 'publish'
type Mode = 'clone' | 'fresh'

interface Basics {
  title: string
  location: string
  description: string
  visibility: 'public' | 'friends' | 'private'
  coverImageUrl: string
}

// ─── Activity type chips ──────────────────────────────────────

const ACTIVITY_TYPES: { type: ActivityType | 'all'; label: string; emoji: string }[] = [
  { type: 'all', label: 'All', emoji: '✦' },
  { type: 'food', label: 'Food', emoji: '🍜' },
  { type: 'culture', label: 'Culture', emoji: '🏛️' },
  { type: 'outdoors', label: 'Outdoors', emoji: '🌿' },
  { type: 'stay', label: 'Stay', emoji: '🏨' },
  { type: 'night', label: 'Nightlife', emoji: '🌙' },
  { type: 'transit', label: 'Transit', emoji: '✈️' },
]

// ─── Suggest Sheet ────────────────────────────────────────────

function SuggestSheet({
  onAdd,
  onClose,
}: {
  onAdd: (act: DraftActivity) => void
  onClose: () => void
}) {
  const [filter, setFilter] = useState<ActivityType | 'all'>('all')
  const filtered =
    filter === 'all'
      ? ACTIVITY_SUGGESTIONS
      : ACTIVITY_SUGGESTIONS.filter(s => s.type === filter)

  return (
    <>
      <div className="backdrop" onClick={onClose} />
      <div className="sheet">
        <div className="sheet-handle" />
        <h3 className="text-[15px] font-bold mb-4">Add Activity</h3>

        {/* Type chips */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-3 mb-4">
          {ACTIVITY_TYPES.map(t => (
            <button
              key={t.type}
              onClick={() => setFilter(t.type)}
              className="chip flex-shrink-0"
              style={
                filter === t.type
                  ? { background: 'var(--gold)', color: '#0B0B14', borderColor: 'var(--gold)' }
                  : {}
              }
            >
              {t.emoji} {t.label}
            </button>
          ))}
        </div>

        {/* Activity grid */}
        <div className="grid grid-cols-2 gap-2 overflow-y-auto" style={{ maxHeight: '55vh' }}>
          {filtered.map((s, i) => (
            <button
              key={i}
              onClick={() => { onAdd({ emoji: s.emoji, text: s.name, type: s.type }); onClose() }}
              className="flex items-center gap-2 p-3 rounded-[10px] text-left transition-colors"
              style={{ background: 'var(--bg3)', border: '1px solid var(--border)' }}
            >
              <span className="text-[22px]">{s.emoji}</span>
              <div>
                <div className="text-xs font-semibold leading-tight">{s.name}</div>
                <div className="text-[10px] mt-0.5" style={{ color: 'var(--text3)' }}>{s.type}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </>
  )
}

// ─── Friend Picker ────────────────────────────────────────────

function FriendPicker({
  onSelect,
  onClose,
}: {
  onSelect: (tripId: string) => void
  onClose: () => void
}) {
  return (
    <>
      <div className="backdrop" onClick={onClose} />
      <div className="sheet" style={{ maxHeight: '80vh' }}>
        <div className="sheet-handle" />
        <h3 className="text-[15px] font-bold mb-1">Use a Friend's Trip</h3>
        <p className="text-xs mb-4" style={{ color: 'var(--text2)' }}>
          Clone an itinerary and make it yours
        </p>
        <div className="flex flex-col gap-3 overflow-y-auto" style={{ maxHeight: '65vh' }}>
          {MOCK_TRIPS.map(trip => (
            <button
              key={trip.id}
              onClick={() => onSelect(trip.id)}
              className="flex items-center gap-3 p-3 rounded-[12px] text-left transition-colors"
              style={{ background: 'var(--bg3)', border: '1px solid var(--border)' }}
            >
              <div className="relative w-16 h-16 rounded-[8px] overflow-hidden flex-shrink-0">
                {trip.cover_image_url && (
                  <Image src={trip.cover_image_url} alt={trip.title} fill className="object-cover" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold truncate">{trip.title}</div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--text2)' }}>
                  {trip.country_emoji} {trip.location} · {trip.duration_days}d
                </div>
                <div className="text-xs mt-1" style={{ color: 'var(--gold)' }}>
                  by {trip.author.full_name}
                </div>
              </div>
              <div
                className="text-xs font-bold px-3 py-1.5 rounded-full flex-shrink-0"
                style={{ background: 'var(--gold-dim)', color: 'var(--gold)', border: '1px solid var(--gold)' }}
              >
                Clone
              </div>
            </button>
          ))}
        </div>
      </div>
    </>
  )
}

// ─── Day Builder ──────────────────────────────────────────────

function DayBuilder({
  days,
  onChange,
}: {
  days: DraftDay[]
  onChange: (days: DraftDay[]) => void
}) {
  const [suggestForDay, setSuggestForDay] = useState<number | null>(null)
  const dragIndex = useRef<{ dayI: number; actI: number } | null>(null)
  const ghostRef = useRef<HTMLDivElement | null>(null)

  // Add a new empty day
  function addDay() {
    onChange([
      ...days,
      { title: `Day ${days.length + 1}`, activities: [] },
    ])
  }

  // Remove a day
  function removeDay(dayI: number) {
    const next = [...days]
    next.splice(dayI, 1)
    onChange(next)
  }

  // Update day title
  function updateDayTitle(dayI: number, title: string) {
    const next = days.map((d, i) => (i === dayI ? { ...d, title } : d))
    onChange(next)
  }

  // Add activity to a day (from suggestion sheet)
  function addActivity(dayI: number, act: DraftActivity) {
    const next = days.map((d, i) =>
      i === dayI ? { ...d, activities: [...d.activities, act] } : d
    )
    onChange(next)
  }

  // Remove activity
  function removeActivity(dayI: number, actI: number) {
    const next = days.map((d, i) => {
      if (i !== dayI) return d
      const acts = [...d.activities]
      acts.splice(actI, 1)
      return { ...d, activities: acts }
    })
    onChange(next)
  }

  // Drag handlers (pointer events for touch+mouse)
  const onDragStart = useCallback(
    (e: React.PointerEvent<HTMLDivElement>, dayI: number, actI: number) => {
      dragIndex.current = { dayI, actI }
      const target = e.currentTarget
      target.setPointerCapture(e.pointerId)

      // Create ghost
      const ghost = document.createElement('div')
      ghost.style.cssText = `
        position:fixed; left:${e.clientX - 40}px; top:${e.clientY - 20}px;
        background:var(--gold); color:#0B0B14; padding:6px 12px;
        border-radius:8px; font-size:12px; font-weight:700;
        pointer-events:none; z-index:9999; white-space:nowrap;
        box-shadow:0 4px 20px rgba(0,0,0,0.5);
      `
      ghost.textContent = days[dayI]?.activities[actI]?.emoji + ' ' + days[dayI]?.activities[actI]?.text
      document.body.appendChild(ghost)
      ghostRef.current = ghost
    },
    [days]
  )

  const onDragMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!ghostRef.current) return
    ghostRef.current.style.left = `${e.clientX - 40}px`
    ghostRef.current.style.top = `${e.clientY - 20}px`
  }, [])

  const onDragEnd = useCallback(
    (e: React.PointerEvent<HTMLDivElement>, targetDayI: number, targetActI: number) => {
      if (ghostRef.current) {
        ghostRef.current.remove()
        ghostRef.current = null
      }
      if (!dragIndex.current) return
      const { dayI: fromDay, actI: fromAct } = dragIndex.current
      dragIndex.current = null
      if (fromDay === targetDayI && fromAct === targetActI) return

      const next = days.map(d => ({ ...d, activities: [...d.activities] }))
      const [moved] = next[fromDay].activities.splice(fromAct, 1)
      if (fromDay === targetDayI && fromAct < targetActI) {
        next[targetDayI].activities.splice(targetActI - 1, 0, moved)
      } else {
        next[targetDayI].activities.splice(targetActI, 0, moved)
      }
      onChange(next)
    },
    [days, onChange]
  )

  return (
    <div className="flex flex-col gap-4">
      {days.map((day, dayI) => (
        <div
          key={dayI}
          className="rounded-[12px] overflow-hidden"
          style={{ background: 'var(--bg3)', border: '1px solid var(--border)' }}
        >
          {/* Day header */}
          <div className="flex items-center gap-2 p-3" style={{ borderBottom: '1px solid var(--border)' }}>
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold flex-shrink-0"
              style={{ background: 'var(--gold-dim)', border: '1px solid var(--gold)', color: 'var(--gold)' }}
            >
              D{dayI + 1}
            </div>
            <input
              className="form-input flex-1 text-sm py-1 px-2"
              style={{ height: 'auto', background: 'transparent', border: 'none', padding: '0' }}
              value={day.title}
              onChange={e => updateDayTitle(dayI, e.target.value)}
              placeholder={`Day ${dayI + 1} title`}
            />
            {days.length > 1 && (
              <button
                onClick={() => removeDay(dayI)}
                className="text-xs px-2 py-1 rounded-lg transition-colors"
                style={{ color: 'var(--text3)' }}
              >
                ✕
              </button>
            )}
          </div>

          {/* Activities */}
          <div className="p-3 flex flex-col gap-2">
            {day.activities.length === 0 && (
              <div className="text-xs text-center py-3" style={{ color: 'var(--text3)' }}>
                No stops yet — add one below
              </div>
            )}
            {day.activities.map((act, actI) => (
              <div
                key={actI}
                className="flex items-center gap-2 p-2 rounded-[8px] select-none"
                style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}
              >
                {/* Drag handle */}
                <div
                  className="cursor-grab active:cursor-grabbing touch-none flex-shrink-0"
                  style={{ color: 'var(--text3)', padding: '4px' }}
                  onPointerDown={e => onDragStart(e, dayI, actI)}
                  onPointerMove={e => onDragMove(e)}
                  onPointerUp={e => onDragEnd(e, dayI, actI)}
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
                    <circle cx="9" cy="6" r="1.5" /><circle cx="15" cy="6" r="1.5" />
                    <circle cx="9" cy="12" r="1.5" /><circle cx="15" cy="12" r="1.5" />
                    <circle cx="9" cy="18" r="1.5" /><circle cx="15" cy="18" r="1.5" />
                  </svg>
                </div>
                <span className="text-[18px] flex-shrink-0">{act.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold truncate">{act.text}</div>
                  <div className="text-[10px]" style={{ color: 'var(--gold)' }}>{act.type}</div>
                </div>
                <button
                  onClick={() => removeActivity(dayI, actI)}
                  className="text-xs flex-shrink-0 transition-colors"
                  style={{ color: 'var(--text3)' }}
                >
                  ✕
                </button>
              </div>
            ))}

            <button
              onClick={() => setSuggestForDay(dayI)}
              className="text-xs font-semibold py-2 rounded-[8px] w-full transition-colors mt-1"
              style={{ border: '1px dashed var(--gold)', color: 'var(--gold)', background: 'var(--gold-dim)' }}
            >
              + Add Stop
            </button>
          </div>
        </div>
      ))}

      <button
        onClick={addDay}
        className="text-sm font-semibold py-3 rounded-[12px] w-full transition-colors"
        style={{ border: '1px dashed var(--border)', color: 'var(--text2)' }}
      >
        + Add Day
      </button>

      {suggestForDay !== null && (
        <SuggestSheet
          onAdd={act => addActivity(suggestForDay, act)}
          onClose={() => setSuggestForDay(null)}
        />
      )}
    </div>
  )
}

// ─── Basics Form ──────────────────────────────────────────────

function BasicsForm({
  basics,
  onChange,
}: {
  basics: Basics
  onChange: (b: Basics) => void
}) {
  const covers = [
    'https://picsum.photos/seed/tokyo1/600/400',
    'https://picsum.photos/seed/amalfi/600/400',
    'https://picsum.photos/seed/bali/600/400',
    'https://picsum.photos/seed/kyoto/600/400',
    'https://picsum.photos/seed/paris/600/400',
    'https://picsum.photos/seed/nyc/600/400',
  ]

  return (
    <div className="flex flex-col gap-4">
      {/* Cover pick */}
      <div>
        <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--text2)' }}>
          COVER PHOTO
        </label>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {covers.map(url => (
            <button
              key={url}
              onClick={() => onChange({ ...basics, coverImageUrl: url })}
              className="relative flex-shrink-0 rounded-[8px] overflow-hidden"
              style={{
                width: 80, height: 60,
                border: basics.coverImageUrl === url ? '2px solid var(--gold)' : '2px solid transparent',
              }}
            >
              <Image src={url} alt="" fill className="object-cover" />
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text2)' }}>TRIP NAME</label>
        <input
          className="form-input"
          placeholder="e.g. 10 Days in Kyoto"
          value={basics.title}
          onChange={e => onChange({ ...basics, title: e.target.value })}
        />
      </div>

      <div>
        <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text2)' }}>DESTINATION</label>
        <input
          className="form-input"
          placeholder="e.g. Kyoto, Japan"
          value={basics.location}
          onChange={e => onChange({ ...basics, location: e.target.value })}
        />
      </div>

      <div>
        <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text2)' }}>DESCRIPTION</label>
        <textarea
          className="form-input"
          style={{ minHeight: 80, resize: 'none' }}
          placeholder="What makes this trip special?"
          value={basics.description}
          onChange={e => onChange({ ...basics, description: e.target.value })}
        />
      </div>

      <div>
        <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--text2)' }}>VISIBILITY</label>
        <div className="flex gap-2">
          {(['public', 'friends', 'private'] as const).map(v => (
            <button
              key={v}
              onClick={() => onChange({ ...basics, visibility: v })}
              className="chip capitalize flex-1 justify-center"
              style={
                basics.visibility === v
                  ? { background: 'var(--gold)', color: '#0B0B14', borderColor: 'var(--gold)' }
                  : {}
              }
            >
              {v === 'public' ? '🌍' : v === 'friends' ? '👥' : '🔒'} {v}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Publish Screen ───────────────────────────────────────────

function PublishScreen({ basics, days, onPublish }: {
  basics: Basics
  days: DraftDay[]
  onPublish: () => void
}) {
  const totalStops = days.reduce((sum, d) => sum + d.activities.length, 0)

  return (
    <div className="flex flex-col gap-5">
      {/* Preview card */}
      <div className="rounded-[14px] overflow-hidden" style={{ border: '1px solid var(--border)' }}>
        {basics.coverImageUrl && (
          <div className="relative h-[160px]">
            <Image src={basics.coverImageUrl} alt="" fill className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/70" />
            <div className="absolute bottom-3 left-3 right-3">
              <div className="text-xs font-semibold" style={{ color: 'var(--gold)' }}>{basics.location}</div>
              <div className="text-base font-bold leading-tight">{basics.title || 'Untitled Trip'}</div>
            </div>
          </div>
        )}
        <div className="p-3 flex gap-4">
          <div className="text-center">
            <div className="text-lg font-bold" style={{ color: 'var(--gold)' }}>{days.length}</div>
            <div className="text-[10px]" style={{ color: 'var(--text3)' }}>days</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold" style={{ color: 'var(--gold)' }}>{totalStops}</div>
            <div className="text-[10px]" style={{ color: 'var(--text3)' }}>stops</div>
          </div>
          <div className="text-center">
            <div className="text-lg capitalize font-bold" style={{ color: 'var(--gold)' }}>{basics.visibility}</div>
            <div className="text-[10px]" style={{ color: 'var(--text3)' }}>visibility</div>
          </div>
        </div>
      </div>

      {/* Day summary */}
      <div>
        <h3 className="text-sm font-bold mb-2">Itinerary Summary</h3>
        {days.map((d, i) => (
          <div key={i} className="flex items-center gap-2 py-2" style={{ borderBottom: '1px solid var(--border)' }}>
            <div
              className="w-6 h-6 rounded-md flex items-center justify-center text-[9px] font-bold flex-shrink-0"
              style={{ background: 'var(--gold-dim)', color: 'var(--gold)' }}
            >
              D{i + 1}
            </div>
            <div className="flex-1 text-sm">{d.title}</div>
            <div className="text-xs" style={{ color: 'var(--text3)' }}>{d.activities.length} stops</div>
          </div>
        ))}
      </div>

      <button className="btn-primary" onClick={onPublish}>
        ✦ Publish Trip
      </button>
    </div>
  )
}

// ─── Main Create Flow ─────────────────────────────────────────

export default function CreateFlow() {
  const router = useRouter()
  const { showToast } = useToast()
  const [step, setStep] = useState<Step>('mode')
  const [showFriendPicker, setShowFriendPicker] = useState(false)
  const [savedAt, setSavedAt] = useState<Date | null>(null)

  const [basics, setBasics] = useState<Basics>({
    title: '',
    location: '',
    description: '',
    visibility: 'friends',
    coverImageUrl: 'https://picsum.photos/seed/tokyo1/600/400',
  })

  const [days, setDays] = useState<DraftDay[]>([
    { title: 'Day 1', activities: [] },
  ])

  // Auto-save simulation
  const handleDaysChange = useCallback((next: DraftDay[]) => {
    setDays(next)
    setSavedAt(new Date())
  }, [])

  // Clone a trip from mock data
  function cloneTrip(tripId: string) {
    const trip = MOCK_TRIPS.find(t => t.id === tripId)
    if (!trip) return
    setBasics({
      title: `My ${trip.title}`,
      location: trip.location,
      description: trip.description ?? '',
      visibility: 'friends',
      coverImageUrl: trip.cover_image_url ?? '',
    })
    setDays(
      trip.days.map(d => ({
        title: d.title,
        activities: d.activities.map(a => ({
          emoji: a.emoji,
          text: a.text,
          type: a.type,
        })),
      }))
    )
    setShowFriendPicker(false)
    setStep('basics')
    showToast('✦ Trip cloned! Customize it below.')
  }

  function publish() {
    showToast('✦ Trip published!')
    setTimeout(() => router.push('/'), 1500)
  }

  // ─── Step header ──────────────────────────────────────────
  const stepMeta = {
    mode: { title: 'New Trip', subtitle: 'How would you like to start?' },
    basics: { title: 'The Basics', subtitle: 'Tell us about your trip' },
    days: { title: 'Your Itinerary', subtitle: 'Build your day-by-day plan' },
    publish: { title: 'Ready to Share?', subtitle: 'Review and publish' },
  }

  const steps: Step[] = ['basics', 'days', 'publish']
  const stepIndex = steps.indexOf(step)

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-14 pb-4 flex-shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between mb-1">
          <div>
            <h1 className="font-head text-[22px] leading-tight">{stepMeta[step].title}</h1>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text2)' }}>{stepMeta[step].subtitle}</p>
          </div>
          {savedAt && step !== 'mode' && (
            <div className="text-[10px]" style={{ color: 'var(--text3)' }}>
              ✓ Saved {savedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          )}
        </div>

        {/* Step progress dots (only during flow) */}
        {step !== 'mode' && (
          <div className="flex gap-1.5 mt-3">
            {steps.map((s, i) => (
              <div
                key={s}
                className="rounded-full transition-all"
                style={{
                  height: 3,
                  flex: i <= stepIndex ? 2 : 1,
                  background: i <= stepIndex ? 'var(--gold)' : 'var(--border)',
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-5 py-5">

        {/* Mode picker */}
        {step === 'mode' && (
          <div className="flex flex-col gap-4 pt-2">
            <button
              onClick={() => setShowFriendPicker(true)}
              className="rounded-[16px] p-5 text-left transition-all active:scale-[0.98]"
              style={{ background: 'var(--bg3)', border: '1px solid var(--gold)' }}
            >
              <div className="text-[28px] mb-3">👥</div>
              <div className="text-base font-bold mb-1">Use a Friend's Trip</div>
              <div className="text-xs" style={{ color: 'var(--text2)' }}>
                Clone a trip you love and make it your own. Change dates, swap activities, add your twist.
              </div>
            </button>

            <button
              onClick={() => { setDays([{ title: 'Day 1', activities: [] }]); setStep('basics') }}
              className="rounded-[16px] p-5 text-left transition-all active:scale-[0.98]"
              style={{ background: 'var(--bg3)', border: '1px solid var(--border)' }}
            >
              <div className="text-[28px] mb-3">✨</div>
              <div className="text-base font-bold mb-1">Build From Scratch</div>
              <div className="text-xs" style={{ color: 'var(--text2)' }}>
                Start with a blank canvas. Add your own days, stops, and stories.
              </div>
            </button>

            <div className="pt-2 text-center text-xs" style={{ color: 'var(--text3)' }}>
              You can always edit and save drafts as you go
            </div>
          </div>
        )}

        {/* Basics */}
        {step === 'basics' && (
          <BasicsForm
            basics={basics}
            onChange={b => { setBasics(b); setSavedAt(new Date()) }}
          />
        )}

        {/* Day builder */}
        {step === 'days' && (
          <DayBuilder days={days} onChange={handleDaysChange} />
        )}

        {/* Publish */}
        {step === 'publish' && (
          <PublishScreen basics={basics} days={days} onPublish={publish} />
        )}
      </div>

      {/* Footer nav */}
      {step !== 'mode' && (
        <div
          className="px-5 py-4 flex gap-3 flex-shrink-0"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          <button
            className="btn-secondary flex-1"
            onClick={() => {
              if (step === 'basics') setStep('mode')
              else if (step === 'days') setStep('basics')
              else if (step === 'publish') setStep('days')
            }}
          >
            ← Back
          </button>
          {step !== 'publish' && (
            <button
              className="btn-primary flex-1"
              onClick={() => {
                if (step === 'basics') setStep('days')
                else if (step === 'days') setStep('publish')
              }}
            >
              {step === 'basics' ? 'Build Itinerary →' : 'Review →'}
            </button>
          )}
        </div>
      )}

      {/* Friend picker overlay */}
      {showFriendPicker && (
        <FriendPicker
          onSelect={cloneTrip}
          onClose={() => setShowFriendPicker(false)}
        />
      )}
    </div>
  )
}
