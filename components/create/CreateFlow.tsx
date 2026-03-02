'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/Toast'
import { useAppState } from '@/lib/app-state'
import { MOCK_TRIPS, MOCK_PROFILES, ACTIVITY_SUGGESTIONS } from '@/lib/mock-data'
import type { ActivityType, DraftDay, DraftActivity, Season, Trip } from '@/lib/types'

type Step = 'mode' | 'basics' | 'days' | 'publish'

const SEASONS: { value: Season; label: string; emoji: string }[] = [
  { value: 'spring',  label: 'Spring',  emoji: '🌸' },
  { value: 'summer',  label: 'Summer',  emoji: '☀️' },
  { value: 'autumn',  label: 'Autumn',  emoji: '🍂' },
  { value: 'winter',  label: 'Winter',  emoji: '❄️' },
]

interface Basics {
  title:           string
  location:        string
  description:     string
  visibility:      'public' | 'friends' | 'private'
  coverImageUrl:   string
  dateMode:        'exact' | 'approx'
  // exact mode
  startMonth:      string   // '01'–'12'
  startDay:        string   // '1'–'31'
  startYear:       string
  endMonth:        string
  endDay:          string
  endYear:         string
  // approx mode
  approxYear:      string
  approxMonth:     string   // 'Jan', 'Feb', …
  approxPart:      string   // 'Early' | 'Mid' | 'Late' | ''
  approxDuration:  string   // '~1 week' etc.
  season:          Season | ''
}

// ─── Overlay helpers ───────────────────────────────────────────

const OVERLAY_BG: React.CSSProperties = {
  position: 'fixed', inset: 0, zIndex: 40,
  background: 'rgba(11,11,20,0.6)', backdropFilter: 'blur(4px)',
}
const SHEET_STYLE: React.CSSProperties = {
  position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 50,
  background: 'var(--bg2)', borderRadius: '20px 20px 0 0',
  border: '1px solid var(--border)', maxHeight: '80vh',
  display: 'flex', flexDirection: 'column', overflow: 'hidden',
}
const HANDLE_STYLE: React.CSSProperties = {
  width: 36, height: 4, background: 'var(--text3)',
  borderRadius: 2, margin: '14px auto 0',
}

// ─── Activity type chips ───────────────────────────────────────

const ACTIVITY_TYPES: { type: ActivityType | 'all'; label: string; emoji: string }[] = [
  { type: 'all',      label: 'All',       emoji: '✦'  },
  { type: 'food',     label: 'Food',      emoji: '🍜' },
  { type: 'culture',  label: 'Culture',   emoji: '🏛️' },
  { type: 'outdoors', label: 'Outdoors',  emoji: '🌿' },
  { type: 'stay',     label: 'Stay',      emoji: '🏨' },
  { type: 'night',    label: 'Night',     emoji: '🌙' },
  { type: 'transit',  label: 'Transit',   emoji: '✈️' },
]

// ─── Suggest Sheet ─────────────────────────────────────────────

function SuggestSheet({ onAdd, onClose }: {
  onAdd: (act: DraftActivity) => void
  onClose: () => void
}) {
  const [filter, setFilter] = useState<ActivityType | 'all'>('all')
  const filtered = filter === 'all'
    ? ACTIVITY_SUGGESTIONS
    : ACTIVITY_SUGGESTIONS.filter(s => s.type === filter)

  return (
    <>
      <div style={OVERLAY_BG} onClick={onClose} />
      <div style={SHEET_STYLE}>
        <div style={HANDLE_STYLE} />
        <div style={{ padding: '12px 20px 8px', fontWeight: 700, fontSize: 15 }}>Add Activity</div>

        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '0 20px 12px' }}>
          {ACTIVITY_TYPES.map(t => (
            <button
              key={t.type}
              onClick={() => setFilter(t.type)}
              className="chip flex-shrink-0"
              style={filter === t.type
                ? { background: 'var(--gold)', color: '#0B0B14', borderColor: 'var(--gold)' }
                : {}}
            >
              {t.emoji} {t.label}
            </button>
          ))}
        </div>

        <div style={{ overflowY: 'auto', padding: '0 20px 24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {filtered.map((s, i) => (
            <button
              key={i}
              onClick={() => { onAdd({ emoji: s.emoji, text: s.name, type: s.type }); onClose() }}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 12px', borderRadius: 10, textAlign: 'left',
                background: 'var(--bg3)', border: '1px solid var(--border)',
                cursor: 'pointer',
              }}
            >
              <span style={{ fontSize: 22 }}>{s.emoji}</span>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, lineHeight: 1.2 }}>{s.name}</div>
                <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 2 }}>{s.type}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </>
  )
}

// ─── Friend Picker ─────────────────────────────────────────────

function FriendPicker({ onSelect, onClose }: {
  onSelect: (tripId: string) => void
  onClose: () => void
}) {
  return (
    <>
      <div style={OVERLAY_BG} onClick={onClose} />
      <div style={{ ...SHEET_STYLE, maxHeight: '85vh' }}>
        <div style={HANDLE_STYLE} />
        <div style={{ padding: '12px 20px 4px', fontWeight: 700, fontSize: 15 }}>Use a Friend&apos;s Trip</div>
        <div style={{ padding: '0 20px 12px', fontSize: 12, color: 'var(--text2)' }}>
          Clone an itinerary and make it yours
        </div>
        <div style={{ overflowY: 'auto', padding: '0 20px 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {MOCK_TRIPS.map(trip => (
            <button
              key={trip.id}
              onClick={() => onSelect(trip.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: 12, borderRadius: 12, textAlign: 'left',
                background: 'var(--bg3)', border: '1px solid var(--border)',
                cursor: 'pointer',
              }}
            >
              <div style={{ position: 'relative', width: 64, height: 64, borderRadius: 8, overflow: 'hidden', flexShrink: 0 }}>
                {trip.cover_image_url && (
                  <Image src={trip.cover_image_url} alt={trip.title} fill style={{ objectFit: 'cover' }} />
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {trip.title}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>
                  {trip.country_emoji} {trip.location} · {trip.duration_days}d
                </div>
                <div style={{ fontSize: 12, color: 'var(--gold)', marginTop: 2 }}>
                  by {trip.author.full_name}
                </div>
              </div>
              <div style={{
                fontSize: 11, fontWeight: 700, padding: '6px 12px', borderRadius: 20, flexShrink: 0,
                background: 'var(--gold-dim)', color: 'var(--gold)', border: '1px solid var(--gold)',
              }}>
                Clone
              </div>
            </button>
          ))}
        </div>
      </div>
    </>
  )
}

// ─── Day Builder ───────────────────────────────────────────────

function DayBuilder({ days, onChange }: {
  days: DraftDay[]
  onChange: (days: DraftDay[]) => void
}) {
  const [suggestForDay, setSuggestForDay] = useState<number | null>(null)

  const dragRef  = useRef<{ dayI: number; actI: number } | null>(null)
  const ghostRef = useRef<HTMLDivElement | null>(null)

  function addDay() {
    onChange([...days, { title: `Day ${days.length + 1}`, activities: [] }])
  }
  function removeDay(dayI: number) {
    onChange(days.filter((_, i) => i !== dayI))
  }
  function updateTitle(dayI: number, title: string) {
    onChange(days.map((d, i) => i === dayI ? { ...d, title } : d))
  }
  function addActivity(dayI: number, act: DraftActivity) {
    onChange(days.map((d, i) => i === dayI ? { ...d, activities: [...d.activities, act] } : d))
  }
  function removeActivity_(dayI: number, actI: number) {
    onChange(days.map((d, i) => {
      if (i !== dayI) return d
      const acts = [...d.activities]
      acts.splice(actI, 1)
      return { ...d, activities: acts }
    }))
  }

  const onDragStart = useCallback((e: React.PointerEvent<HTMLDivElement>, dayI: number, actI: number) => {
    dragRef.current = { dayI, actI }
    e.currentTarget.setPointerCapture(e.pointerId)
    const act = days[dayI]?.activities[actI]
    const ghost = document.createElement('div')
    ghost.style.cssText = `position:fixed;left:${e.clientX - 40}px;top:${e.clientY - 20}px;
      background:var(--gold);color:#0B0B14;padding:6px 12px;border-radius:8px;
      font-size:12px;font-weight:700;pointer-events:none;z-index:9999;white-space:nowrap;
      box-shadow:0 4px 20px rgba(0,0,0,.5);`
    ghost.textContent = `${act?.emoji ?? ''} ${act?.text ?? ''}`
    document.body.appendChild(ghost)
    ghostRef.current = ghost
  }, [days])

  const onDragMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (ghostRef.current) {
      ghostRef.current.style.left = `${e.clientX - 40}px`
      ghostRef.current.style.top  = `${e.clientY - 20}px`
    }
  }, [])

  const onDragEnd = useCallback((e: React.PointerEvent<HTMLDivElement>, toDay: number, toAct: number) => {
    ghostRef.current?.remove()
    ghostRef.current = null
    if (!dragRef.current) return
    const { dayI: fromDay, actI: fromAct } = dragRef.current
    dragRef.current = null
    if (fromDay === toDay && fromAct === toAct) return
    const next = days.map(d => ({ ...d, activities: [...d.activities] }))
    const [moved] = next[fromDay].activities.splice(fromAct, 1)
    next[toDay].activities.splice(fromDay === toDay && fromAct < toAct ? toAct - 1 : toAct, 0, moved)
    onChange(next)
  }, [days, onChange])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {days.map((day, dayI) => (
        <div key={dayI} style={{ borderRadius: 12, overflow: 'hidden', background: 'var(--bg3)', border: '1px solid var(--border)' }}>
          {/* Day header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', borderBottom: '1px solid var(--border)' }}>
            <div style={{
              width: 28, height: 28, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 10, fontWeight: 700, flexShrink: 0,
              background: 'var(--gold-dim)', border: '1px solid var(--gold)', color: 'var(--gold)',
            }}>D{dayI + 1}</div>
            <input
              value={day.title}
              onChange={e => updateTitle(dayI, e.target.value)}
              placeholder={`Day ${dayI + 1} title`}
              style={{
                flex: 1, background: 'transparent', border: 'none', outline: 'none',
                fontSize: 14, fontWeight: 600, color: 'var(--text)',
              }}
            />
            {days.length > 1 && (
              <button onClick={() => removeDay(dayI)} style={{ fontSize: 12, color: 'var(--text3)', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>✕</button>
            )}
          </div>

          {/* Activities */}
          <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {day.activities.length === 0 && (
              <div style={{ fontSize: 12, color: 'var(--text3)', textAlign: 'center', padding: '8px 0' }}>
                No stops yet — tap + Add Stop below
              </div>
            )}
            {day.activities.map((act, actI) => (
              <div key={actI} style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px',
                borderRadius: 8, background: 'var(--bg2)', border: '1px solid var(--border)',
              }}>
                <div
                  style={{ cursor: 'grab', color: 'var(--text3)', padding: 4, touchAction: 'none', flexShrink: 0 }}
                  onPointerDown={e => onDragStart(e, dayI, actI)}
                  onPointerMove={e => onDragMove(e)}
                  onPointerUp={e => onDragEnd(e, dayI, actI)}
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
                    <circle cx="9" cy="6" r="1.5"/><circle cx="15" cy="6" r="1.5"/>
                    <circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/>
                    <circle cx="9" cy="18" r="1.5"/><circle cx="15" cy="18" r="1.5"/>
                  </svg>
                </div>
                <span style={{ fontSize: 20, flexShrink: 0 }}>{act.emoji}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{act.text}</div>
                  <div style={{ fontSize: 10, color: 'var(--gold)' }}>{act.type}</div>
                </div>
                <button onClick={() => removeActivity_(dayI, actI)} style={{ fontSize: 12, color: 'var(--text3)', background: 'none', border: 'none', cursor: 'pointer', padding: 4, flexShrink: 0 }}>✕</button>
              </div>
            ))}

            {/* Add stop button */}
            <button
              onClick={() => setSuggestForDay(dayI)}
              style={{
                fontSize: 12, fontWeight: 700, padding: '8px 0', borderRadius: 8, width: '100%', marginTop: 4,
                border: '1px dashed var(--gold)', color: 'var(--gold)', background: 'var(--gold-dim)', cursor: 'pointer',
              }}
            >+ Add Stop</button>
          </div>
        </div>
      ))}

      <button
        onClick={addDay}
        style={{
          fontSize: 14, fontWeight: 600, padding: '12px 0', borderRadius: 12, width: '100%',
          border: '1px dashed var(--border)', color: 'var(--text2)', background: 'none', cursor: 'pointer',
        }}
      >+ Add Day</button>

      {suggestForDay !== null && (
        <SuggestSheet
          onAdd={act => addActivity(suggestForDay, act)}
          onClose={() => setSuggestForDay(null)}
        />
      )}
    </div>
  )
}

// ─── Date Section ──────────────────────────────────────────────

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const MONTH_NUMS  = ['01','02','03','04','05','06','07','08','09','10','11','12']
const DAYS        = Array.from({ length: 31 }, (_, i) => String(i + 1))
const THIS_YEAR   = new Date().getFullYear()
const YEARS       = [THIS_YEAR, THIS_YEAR + 1, THIS_YEAR + 2, THIS_YEAR + 3].map(String)
const DURATIONS   = ['~1 week', '~2 weeks', '~1 month', '~3 months', 'Flexible']
const PARTS       = ['Early', 'Mid', 'Late']

function StyledSelect({ value, onChange, options, placeholder }: {
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
  placeholder?: string
}) {
  return (
    <div style={{ position: 'relative', flex: 1 }}>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          width: '100%',
          appearance: 'none', WebkitAppearance: 'none',
          background: 'var(--bg3)',
          border: '1px solid var(--border)',
          color: value ? 'var(--text)' : 'var(--text3)',
          borderRadius: 10,
          padding: '10px 30px 10px 12px',
          fontSize: 13,
          fontFamily: 'inherit',
          cursor: 'pointer',
          outline: 'none',
        }}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(o => (
          <option key={o.value} value={o.value} style={{ background: 'var(--bg2)', color: 'var(--text)' }}>
            {o.label}
          </option>
        ))}
      </select>
      {/* Custom chevron */}
      <svg
        viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        width="14" height="14"
        style={{
          position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
          pointerEvents: 'none', color: 'var(--text3)',
        }}
      >
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </div>
  )
}

function DateSection({ basics, onChange }: { basics: Basics; onChange: (b: Basics) => void }) {
  const monthOpts  = MONTH_NAMES.map((m, i) => ({ value: MONTH_NUMS[i], label: m }))
  const dayOpts    = DAYS.map(d => ({ value: d, label: d }))
  const yearOpts   = YEARS.map(y => ({ value: y, label: y }))

  // Build readable exact date string for preview
  const fmtExact = (month: string, day: string, year: string) => {
    if (!month || !year) return ''
    const mLabel = MONTH_NAMES[parseInt(month, 10) - 1] ?? ''
    return day ? `${mLabel} ${day}, ${year}` : `${mLabel} ${year}`
  }
  const exactStart = fmtExact(basics.startMonth, basics.startDay, basics.startYear)
  const exactEnd   = fmtExact(basics.endMonth,   basics.endDay,   basics.endYear)
  const exactLabel = exactStart && exactEnd ? `${exactStart} → ${exactEnd}` : exactStart || exactEnd || null

  // Approx label
  const approxLabel = [
    basics.approxPart,
    basics.approxMonth,
    basics.approxYear,
    basics.approxDuration,
  ].filter(Boolean).join(' ')

  const TAB_ACTIVE = { background: 'var(--gold)', color: '#0B0B14', border: 'none' }
  const TAB_IDLE   = { background: 'var(--bg3)', color: 'var(--text2)', border: '1px solid var(--border)' }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-semibold" style={{ color: 'var(--text2)' }}>WHEN ARE YOU GOING?</label>
        <div className="flex rounded-[8px] overflow-hidden" style={{ border: '1px solid var(--border)' }}>
          {(['exact', 'approx'] as const).map(mode => (
            <button
              key={mode}
              onClick={() => onChange({ ...basics, dateMode: mode })}
              style={{
                fontSize: 11, fontWeight: 700, padding: '5px 12px',
                ...(basics.dateMode === mode ? TAB_ACTIVE : TAB_IDLE),
                borderRadius: 0,
              }}
            >
              {mode === 'exact' ? 'Exact' : 'Approximate'}
            </button>
          ))}
        </div>
      </div>

      {basics.dateMode === 'exact' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* Start */}
          <div>
            <div style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 600, marginBottom: 6 }}>FROM</div>
            <div style={{ display: 'flex', gap: 6 }}>
              <StyledSelect value={basics.startMonth} onChange={v => onChange({ ...basics, startMonth: v })}
                options={monthOpts} placeholder="Month" />
              <StyledSelect value={basics.startDay}   onChange={v => onChange({ ...basics, startDay: v })}
                options={dayOpts}   placeholder="Day" />
              <StyledSelect value={basics.startYear}  onChange={v => onChange({ ...basics, startYear: v })}
                options={yearOpts}  placeholder="Year" />
            </div>
          </div>
          {/* End */}
          <div>
            <div style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 600, marginBottom: 6 }}>TO</div>
            <div style={{ display: 'flex', gap: 6 }}>
              <StyledSelect value={basics.endMonth} onChange={v => onChange({ ...basics, endMonth: v })}
                options={monthOpts} placeholder="Month" />
              <StyledSelect value={basics.endDay}   onChange={v => onChange({ ...basics, endDay: v })}
                options={dayOpts}   placeholder="Day" />
              <StyledSelect value={basics.endYear}  onChange={v => onChange({ ...basics, endYear: v })}
                options={yearOpts}  placeholder="Year" />
            </div>
          </div>
          {exactLabel && (
            <div style={{ fontSize: 12, color: 'var(--gold)', marginTop: 2 }}>📅 {exactLabel}</div>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Year */}
          <div>
            <div style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 600, marginBottom: 6 }}>YEAR</div>
            <div style={{ display: 'flex', gap: 6 }}>
              {YEARS.map(y => (
                <button key={y} onClick={() => onChange({ ...basics, approxYear: basics.approxYear === y ? '' : y })}
                  style={{
                    flex: 1, padding: '8px 0', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer',
                    ...(basics.approxYear === y
                      ? { background: 'var(--gold)', color: '#0B0B14', border: 'none' }
                      : { background: 'var(--bg3)', color: 'var(--text2)', border: '1px solid var(--border)' }),
                  }}
                >{y}</button>
              ))}
            </div>
          </div>

          {/* Month grid */}
          <div>
            <div style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 600, marginBottom: 6 }}>MONTH</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
              {MONTH_NAMES.map(m => (
                <button key={m} onClick={() => onChange({ ...basics, approxMonth: basics.approxMonth === m ? '' : m })}
                  style={{
                    padding: '7px 0', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                    ...(basics.approxMonth === m
                      ? { background: 'var(--gold)', color: '#0B0B14', border: 'none' }
                      : { background: 'var(--bg3)', color: 'var(--text2)', border: '1px solid var(--border)' }),
                  }}
                >{m}</button>
              ))}
            </div>
          </div>

          {/* Part of month */}
          <div>
            <div style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 600, marginBottom: 6 }}>PART OF MONTH (optional)</div>
            <div style={{ display: 'flex', gap: 6 }}>
              {PARTS.map(p => (
                <button key={p} onClick={() => onChange({ ...basics, approxPart: basics.approxPart === p ? '' : p })}
                  style={{
                    flex: 1, padding: '8px 0', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                    ...(basics.approxPart === p
                      ? { background: 'var(--gold-dim)', color: 'var(--gold)', border: '1px solid var(--gold)' }
                      : { background: 'var(--bg3)', color: 'var(--text2)', border: '1px solid var(--border)' }),
                  }}
                >{p}</button>
              ))}
            </div>
          </div>

          {/* Trip length */}
          <div>
            <div style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 600, marginBottom: 6 }}>TRIP LENGTH</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {DURATIONS.map(d => (
                <button key={d} onClick={() => onChange({ ...basics, approxDuration: basics.approxDuration === d ? '' : d })}
                  style={{
                    padding: '7px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                    ...(basics.approxDuration === d
                      ? { background: 'var(--gold-dim)', color: 'var(--gold)', border: '1px solid var(--gold)' }
                      : { background: 'var(--bg3)', color: 'var(--text2)', border: '1px solid var(--border)' }),
                  }}
                >{d}</button>
              ))}
            </div>
          </div>

          {/* Preview */}
          {approxLabel && (
            <div style={{
              fontSize: 12, color: 'var(--gold)', padding: '8px 12px', borderRadius: 8,
              background: 'var(--gold-dim)', border: '1px solid var(--gold)',
            }}>
              📅 {approxLabel}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Basics Form ───────────────────────────────────────────────

function BasicsForm({ basics, onChange }: { basics: Basics; onChange: (b: Basics) => void }) {
  const covers = [
    'https://picsum.photos/seed/tokyo99/800/500',
    'https://picsum.photos/seed/amalfi/800/500',
    'https://picsum.photos/seed/bali/800/500',
    'https://picsum.photos/seed/kyoto/800/500',
    'https://picsum.photos/seed/paris/800/500',
    'https://picsum.photos/seed/nyc/800/500',
  ]
  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--text2)' }}>COVER PHOTO</label>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {covers.map(url => (
            <button key={url} onClick={() => onChange({ ...basics, coverImageUrl: url })}
              className="relative flex-shrink-0 rounded-[8px] overflow-hidden"
              style={{ width: 80, height: 60, border: basics.coverImageUrl === url ? '2px solid var(--gold)' : '2px solid transparent' }}>
              <Image src={url} alt="" fill className="object-cover" />
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text2)' }}>TRIP NAME</label>
        <input className="form-input" placeholder="e.g. 10 Days in Kyoto" value={basics.title}
          onChange={e => onChange({ ...basics, title: e.target.value })} />
      </div>
      <div>
        <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text2)' }}>DESTINATION</label>
        <input className="form-input" placeholder="e.g. Kyoto, Japan" value={basics.location}
          onChange={e => onChange({ ...basics, location: e.target.value })} />
      </div>

      <DateSection basics={basics} onChange={onChange} />

      {/* Season */}
      <div>
        <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--text2)' }}>SEASON</label>
        <div className="flex gap-2">
          {SEASONS.map(s => (
            <button key={s.value} onClick={() => onChange({ ...basics, season: basics.season === s.value ? '' : s.value })}
              className="chip flex-1 justify-center"
              style={basics.season === s.value ? { background: 'var(--gold)', color: '#0B0B14', borderColor: 'var(--gold)' } : {}}>
              {s.emoji} {s.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text2)' }}>DESCRIPTION</label>
        <textarea className="form-input" style={{ minHeight: 80, resize: 'none' }}
          placeholder="What makes this trip special?" value={basics.description}
          onChange={e => onChange({ ...basics, description: e.target.value })} />
      </div>
      <div>
        <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--text2)' }}>VISIBILITY</label>
        <div className="flex gap-2">
          {(['public', 'friends', 'private'] as const).map(v => (
            <button key={v} onClick={() => onChange({ ...basics, visibility: v })}
              className="chip capitalize flex-1 justify-center"
              style={basics.visibility === v ? { background: 'var(--gold)', color: '#0B0B14', borderColor: 'var(--gold)' } : {}}>
              {v === 'public' ? '🌍' : v === 'friends' ? '👥' : '🔒'} {v}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Publish Screen ────────────────────────────────────────────

function PublishScreen({ basics, days, onPublish }: { basics: Basics; days: DraftDay[]; onPublish: () => void }) {
  const total = days.reduce((s, d) => s + d.activities.length, 0)
  const seasonLabel = basics.season ? SEASONS.find(s => s.value === basics.season) : null

  // Date label for preview
  let dateStr: string | null = null
  if (basics.dateMode === 'exact') {
    const fmtISO = (m: string, d: string, y: string) => {
      if (!m || !y) return null
      const mn = MONTH_NAMES[parseInt(m, 10) - 1] ?? ''
      return d ? `${mn} ${d}, ${y}` : `${mn} ${y}`
    }
    const s = fmtISO(basics.startMonth, basics.startDay, basics.startYear)
    const e = fmtISO(basics.endMonth,   basics.endDay,   basics.endYear)
    dateStr = s && e ? `${s} – ${e}` : s || e
  } else {
    const parts = [basics.approxPart, basics.approxMonth, basics.approxYear, basics.approxDuration].filter(Boolean)
    dateStr = parts.length ? parts.join(' ') : null
  }
  return (
    <div className="flex flex-col gap-5">
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
        <div className="p-3 flex gap-4 flex-wrap">
          {[
            ['Days',       days.length],
            ['Stops',      total],
            ['Visibility', basics.visibility],
            ...(seasonLabel ? [['Season', `${seasonLabel.emoji} ${seasonLabel.label}`]] : []),
          ].map(([k, v]) => (
            <div key={k} className="text-center">
              <div className="text-lg font-bold capitalize" style={{ color: 'var(--gold)' }}>{v}</div>
              <div className="text-[10px]" style={{ color: 'var(--text3)' }}>{k}</div>
            </div>
          ))}
        </div>
        {dateStr && (
          <div className="px-3 pb-3 text-xs" style={{ color: 'var(--text2)' }}>📅 {dateStr}</div>
        )}
      </div>
      <div>
        <h3 className="text-sm font-bold mb-2">Itinerary Summary</h3>
        {days.map((d, i) => (
          <div key={i} className="flex items-center gap-2 py-2" style={{ borderBottom: '1px solid var(--border)' }}>
            <div className="w-6 h-6 rounded-md flex items-center justify-center text-[9px] font-bold flex-shrink-0"
              style={{ background: 'var(--gold-dim)', color: 'var(--gold)' }}>D{i + 1}</div>
            <div className="flex-1 text-sm">{d.title}</div>
            <div className="text-xs" style={{ color: 'var(--text3)' }}>{d.activities.length} stops</div>
          </div>
        ))}
      </div>
      <button className="btn-primary" onClick={onPublish}>✦ Publish Trip</button>
    </div>
  )
}

// ─── Main CreateFlow ───────────────────────────────────────────

export default function CreateFlow() {
  const router    = useRouter()
  const { showToast }                         = useToast()
  const { publishTrip, pendingActivity, setPendingActivity } = useAppState()

  const [step,             setStep]             = useState<Step>('mode')
  const [showFriendPicker, setShowFriendPicker] = useState(false)
  const [savedAt,          setSavedAt]          = useState<Date | null>(null)

  const [basics, setBasics] = useState<Basics>({
    title: '', location: '', description: '',
    visibility: 'friends',
    coverImageUrl: 'https://picsum.photos/seed/tokyo99/800/500',
    dateMode: 'exact',
    startMonth: '', startDay: '', startYear: '',
    endMonth:   '', endDay:   '', endYear:   '',
    approxYear: '', approxMonth: '', approxPart: '', approxDuration: '',
    season: '',
  })
  const [days, setDays] = useState<DraftDay[]>([{ title: 'Day 1', activities: [] }])

  // If we arrived here from "Add to my trip → Create New Trip", pre-seed the activity
  useEffect(() => {
    if (pendingActivity) {
      setDays([{ title: 'Day 1', activities: [pendingActivity] }])
      setPendingActivity(null)
      setStep('basics')
      showToast(`✦ "${pendingActivity.text}" added to Day 1`)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleDaysChange = useCallback((next: DraftDay[]) => {
    setDays(next)
    setSavedAt(new Date())
  }, [])

  function cloneTrip(tripId: string) {
    const trip = MOCK_TRIPS.find(t => t.id === tripId)
    if (!trip) return
    setBasics({
      title: `My ${trip.title}`, location: trip.location,
      description: trip.description ?? '', visibility: 'friends',
      coverImageUrl: trip.cover_image_url ?? '',
      dateMode: 'exact',
      startMonth: '', startDay: '', startYear: '',
      endMonth:   '', endDay:   '', endYear:   '',
      approxYear: '', approxMonth: '', approxPart: '', approxDuration: '',
      season: (trip.season as Season | '') ?? '',
    })
    setDays(trip.days.map(d => ({
      title: d.title,
      activities: d.activities.map(a => ({ emoji: a.emoji, text: a.text, type: a.type })),
    })))
    setShowFriendPicker(false)
    setStep('basics')
    showToast('✦ Trip cloned! Customize it below.')
  }

  function publish() {
    const me = MOCK_PROFILES.find(p => p.id === 'me')!

    // Build ISO date strings from individual fields (exact mode)
    const toISO = (month: string, day: string, year: string) =>
      month && year ? `${year}-${month}-${day.padStart(2, '0') || '01'}` : null
    const startISO = basics.dateMode === 'exact' ? toISO(basics.startMonth, basics.startDay, basics.startYear) : null
    const endISO   = basics.dateMode === 'exact' ? toISO(basics.endMonth,   basics.endDay,   basics.endYear)   : null

    // Approx label
    const approxParts = [basics.approxPart, basics.approxMonth, basics.approxYear, basics.approxDuration].filter(Boolean)
    const approxLabel = basics.dateMode === 'approx' && approxParts.length ? approxParts.join(' ') : null

    const durationDays = startISO && endISO
      ? Math.max(1, Math.round((new Date(endISO).getTime() - new Date(startISO).getTime()) / 86400000) + 1)
      : days.length

    const newTrip: Trip = {
      id:               `trip-pub-${Date.now()}`,
      title:            basics.title || 'My Trip',
      location:         basics.location,
      country_emoji:    '📍',
      duration_days:    durationDays,
      cover_image_url:  basics.coverImageUrl || null,
      description:      basics.description || null,
      visibility:       basics.visibility,
      rating:           null,
      rating_count:     0,
      like_count:       0,
      tags:             [],
      author:           me,
      created_at:       new Date().toISOString().slice(0, 10),
      start_date:       startISO,
      end_date:         endISO,
      approx_date_label: approxLabel,
      season:           (basics.season as Season) || null,
      days: days.map((d, i) => ({
        id:          `d-pub-${i}`,
        trip_id:     `trip-pub-${Date.now()}`,
        title:       d.title,
        day_number:  i + 1,
        activities:  d.activities.map((a, j) => ({
          id:       `a-pub-${i}-${j}`,
          emoji:    a.emoji,
          text:     a.text,
          type:     a.type,
          notes:    null,
          position: j,
        })),
      })),
    }

    publishTrip(newTrip)
    showToast('✦ Trip published!')
    setTimeout(() => router.push('/'), 1500)
  }

  const steps: Step[] = ['basics', 'days', 'publish']
  const stepIndex = steps.indexOf(step)

  const stepMeta = {
    mode:    { title: 'New Trip',        subtitle: 'How would you like to start?' },
    basics:  { title: 'The Basics',      subtitle: 'Tell us about your trip'      },
    days:    { title: 'Your Itinerary',  subtitle: 'Build your day-by-day plan'   },
    publish: { title: 'Ready to Share?', subtitle: 'Review and publish'           },
  }

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
              ✓ {savedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          )}
        </div>
        {step !== 'mode' && (
          <div className="flex gap-1.5 mt-3">
            {steps.map((s, i) => (
              <div key={s} className="rounded-full transition-all"
                style={{ height: 3, flex: i <= stepIndex ? 2 : 1, background: i <= stepIndex ? 'var(--gold)' : 'var(--border)' }} />
            ))}
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-5 py-5">
        {step === 'mode' && (
          <div className="flex flex-col gap-4 pt-2">
            <button
              onClick={() => setShowFriendPicker(true)}
              className="rounded-[16px] p-5 text-left transition-all active:scale-[0.98]"
              style={{ background: 'var(--bg3)', border: '1px solid var(--gold)' }}
            >
              <div className="text-[28px] mb-3">👥</div>
              <div className="text-base font-bold mb-1">Use a Friend&apos;s Trip</div>
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
            <p className="text-center text-xs pt-2" style={{ color: 'var(--text3)' }}>
              You can always save drafts as you go
            </p>
          </div>
        )}

        {step === 'basics' && (
          <BasicsForm basics={basics} onChange={b => { setBasics(b); setSavedAt(new Date()) }} />
        )}
        {step === 'days' && <DayBuilder days={days} onChange={handleDaysChange} />}
        {step === 'publish' && <PublishScreen basics={basics} days={days} onPublish={publish} />}
      </div>

      {/* Footer nav */}
      {step !== 'mode' && (
        <div className="px-5 py-4 flex gap-3 flex-shrink-0" style={{ borderTop: '1px solid var(--border)' }}>
          <button className="btn-secondary flex-1" onClick={() => {
            if (step === 'basics') setStep('mode')
            else if (step === 'days') setStep('basics')
            else setStep('days')
          }}>← Back</button>
          {step !== 'publish' && (
            <button className="btn-primary flex-1" onClick={() => {
              if (step === 'basics') setStep('days')
              else setStep('publish')
            }}>
              {step === 'basics' ? 'Build Itinerary →' : 'Review →'}
            </button>
          )}
        </div>
      )}

      {showFriendPicker && (
        <FriendPicker
          onSelect={cloneTrip}
          onClose={() => setShowFriendPicker(false)}
        />
      )}
    </div>
  )
}
