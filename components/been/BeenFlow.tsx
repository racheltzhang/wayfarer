'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import type { Trip, Season, BeenMemory, BeenItineraryDay, BeenStop, BeenTripData } from '@/lib/types'
import { useAppState } from '@/lib/app-state'
import { useToast } from '@/components/ui/Toast'

// ─── Constants ───────────────────────────────────────────────────

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
]

const SEASONS: { value: Season; label: string; icon: string }[] = [
  { value: 'spring', label: 'Spring', icon: '🌸' },
  { value: 'summer', label: 'Summer', icon: '☀️' },
  { value: 'autumn', label: 'Autumn', icon: '🍂' },
  { value: 'winter', label: 'Winter', icon: '❄️' },
]

const CURRENT_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: CURRENT_YEAR - 2009 }, (_, i) => String(CURRENT_YEAR - i))

const MEMORY_EMOJIS = ['🍽️','🏞️','🏨','☕','🍷','🎵','🛍️','🏛️','🌅','🤿','🚴','💡','❤️','😂','✨','⛺']

const MAX_PHOTOS = 9 // 3 × 3 grid

// ─── Step order ──────────────────────────────────────────────────

type Step = 'when' | 'photos' | 'take'
const STEPS: Step[] = ['when', 'photos', 'take']

// ─── Props ───────────────────────────────────────────────────────

interface Props {
  trip: Trip
  onClose: () => void
  onSaved?: () => void
}

// ─── Main component ──────────────────────────────────────────────

export default function BeenFlow({ trip, onClose, onSaved }: Props) {
  const { saveBeen }  = useAppState()
  const { showToast } = useToast()

  const [step,   setStep]   = useState<Step>('when')
  const [saving, setSaving] = useState(false)

  // ── Step 1 state: When & Where ──────────────────────────────
  const [location,     setLocation]     = useState(trip.location)
  const [approxSeason, setApproxSeason] = useState<Season | ''>('')
  const [approxMonth,  setApproxMonth]  = useState('')
  const [approxYear,   setApproxYear]   = useState(String(CURRENT_YEAR))

  // ── Step 2 state: Photos ────────────────────────────────────
  // Each photo is a data-URL (from FileReader) or a placeholder string
  const [photos, setPhotos] = useState<string[]>([])
  const fileInputRef        = useRef<HTMLInputElement>(null)
  const [activeSlot,        setActiveSlot] = useState<number | null>(null)

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || activeSlot === null) return
    const reader = new FileReader()
    reader.onload = ev => {
      const url = ev.target?.result as string
      setPhotos(prev => {
        const next = [...prev]
        if (activeSlot < next.length) {
          next[activeSlot] = url
        } else {
          while (next.length < activeSlot) next.push('')
          next.push(url)
        }
        return next
      })
    }
    reader.readAsDataURL(file)
    // reset input so same file can be picked again
    e.target.value = ''
  }

  function openFilePicker(slotIndex: number) {
    setActiveSlot(slotIndex)
    fileInputRef.current?.click()
  }

  function removePhoto(i: number) {
    setPhotos(prev => prev.filter((_, idx) => idx !== i))
  }

  // ── Step 3 state: Your take ─────────────────────────────────
  const [notes,     setNotes]     = useState('')
  const [memories,  setMemories]  = useState<BeenMemory[]>([])
  const [memText,   setMemText]   = useState('')
  const [memEmoji,  setMemEmoji]  = useState('✨')
  const [addingMem, setAddingMem] = useState(false)

  function addMemory() {
    if (!memText.trim()) return
    setMemories(prev => [...prev, { emoji: memEmoji, text: memText.trim() }])
    setMemText('')
    setMemEmoji('✨')
    setAddingMem(false)
  }

  function removeMemory(i: number) {
    setMemories(prev => prev.filter((_, idx) => idx !== i))
  }

  // ── Itinerary state ─────────────────────────────────────────
  const [itinerary,      setItinerary]      = useState<BeenItineraryDay[]>([])
  const [itinExpanded,   setItinExpanded]   = useState(false)
  // which day is currently open for adding a stop
  const [addingStopDay,  setAddingStopDay]  = useState<number | null>(null)
  const [stopEmoji,      setStopEmoji]      = useState('📍')
  const [stopPlace,      setStopPlace]      = useState('')
  const [stopNote,       setStopNote]       = useState('')
  // editing a day title inline
  const [editingDayIdx,  setEditingDayIdx]  = useState<number | null>(null)

  const STOP_EMOJIS = ['📍','🍽️','🏛️','🏨','🌅','☕','🛍️','🏖️','🎵','🤿','🚶','🚗','⛪','🍷','🎭','🌿']

  function addDay() {
    setItinerary(prev => [...prev, { title: `Day ${prev.length + 1}`, stops: [] }])
    setAddingStopDay(itinerary.length) // open the new day immediately
  }

  function removeDay(dayIdx: number) {
    setItinerary(prev => prev.filter((_, i) => i !== dayIdx))
    if (addingStopDay === dayIdx) setAddingStopDay(null)
  }

  function updateDayTitle(dayIdx: number, title: string) {
    setItinerary(prev => prev.map((d, i) => i === dayIdx ? { ...d, title } : d))
  }

  function addStop(dayIdx: number) {
    if (!stopPlace.trim()) return
    const stop: BeenStop = { emoji: stopEmoji, place: stopPlace.trim(), note: stopNote.trim() }
    setItinerary(prev => prev.map((d, i) =>
      i === dayIdx ? { ...d, stops: [...d.stops, stop] } : d
    ))
    setStopPlace('')
    setStopNote('')
    setStopEmoji('📍')
    setAddingStopDay(null)
  }

  function removeStop(dayIdx: number, stopIdx: number) {
    setItinerary(prev => prev.map((d, i) =>
      i === dayIdx ? { ...d, stops: d.stops.filter((_, j) => j !== stopIdx) } : d
    ))
  }

  // ── Navigation ──────────────────────────────────────────────
  const stepIdx = STEPS.indexOf(step)
  const isFirst = stepIdx === 0
  const isLast  = stepIdx === STEPS.length - 1

  function goNext() {
    if (!isLast) setStep(STEPS[stepIdx + 1])
  }
  function goBack() {
    if (!isFirst) setStep(STEPS[stepIdx - 1])
  }

  // ── Save ────────────────────────────────────────────────────
  async function handleSave() {
    setSaving(true)
    await new Promise(r => setTimeout(r, 500))

    const data: BeenTripData = {
      tripId:       trip.id,
      location:     location.trim() || trip.location,
      dateType:     'approximate',
      startDate:    null,
      endDate:      null,
      approxMonth:  approxMonth || null,
      approxYear:   approxYear  || null,
      approxSeason: (approxSeason || null) as Season | null,
      notes,
      photos:       photos.filter(Boolean),
      memories,
      itinerary,
    }

    saveBeen(data)
    setSaving(false)
    showToast('✅ Trip logged!')
    onSaved?.()
    onClose()
  }

  // ── Shared styles ────────────────────────────────────────────
  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 14px', borderRadius: 10,
    background: 'var(--bg3)', border: '1px solid var(--border)',
    color: 'var(--text)', fontSize: 14, outline: 'none', boxSizing: 'border-box',
  }
  const labelStyle: React.CSSProperties = {
    fontSize: 11, fontWeight: 700, color: 'var(--text3)',
    textTransform: 'uppercase', letterSpacing: '0.06em',
    marginBottom: 8, display: 'block',
  }

  // ── Photo grid helpers ───────────────────────────────────────
  // Always show filled photos + one empty "add" slot (up to MAX_PHOTOS)
  const filledPhotos = photos.filter(Boolean)
  const gridSlots    = filledPhotos.length < MAX_PHOTOS
    ? [...filledPhotos, null]   // null = "add" slot
    : filledPhotos

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'var(--bg)', display: 'flex', flexDirection: 'column',
    }}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileSelect}
      />

      {/* ── Header ─────────────────────────────────────── */}
      <div style={{
        flexShrink: 0, padding: '52px 20px 14px',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <button
          onClick={isFirst ? onClose : goBack}
          style={{
            width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--bg3)', border: '1px solid var(--border)',
            cursor: 'pointer',
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
            {isFirst
              ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
              : <polyline points="15 18 9 12 15 6"/>
            }
          </svg>
        </button>

        {/* Trip context */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 1 }}>Log your visit</div>
          <div style={{
            fontSize: 12, color: 'var(--text3)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {trip.country_emoji} {trip.title}
          </div>
        </div>

        {/* Step dots */}
        <div style={{ display: 'flex', gap: 5, flexShrink: 0 }}>
          {STEPS.map((s, i) => (
            <div key={s} style={{
              height: 6, borderRadius: 3,
              width: i === stepIdx ? 18 : 6,
              background: i <= stepIdx ? 'var(--gold)' : 'var(--bg3)',
              transition: 'all 0.2s',
            }} />
          ))}
        </div>
      </div>

      {/* ── Step content ─────────────────────────────────── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 20px' }}>

        {/* ════════ STEP 1: When & Where ════════ */}
        {step === 'when' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

            {/* Location */}
            <div>
              <label style={labelStyle}>Where did you visit?</label>
              <input
                style={inputStyle}
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="e.g. Amalfi Coast, Italy"
              />
            </div>

            {/* When */}
            <div>
              <label style={labelStyle}>When was this?</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {/* Season tiles */}
                <div>
                  <label style={{ ...labelStyle, marginBottom: 8, fontSize: 10 }}>Season</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                    {SEASONS.map(s => (
                      <button
                        key={s.value}
                        onClick={() => setApproxSeason(prev => prev === s.value ? '' : s.value)}
                        style={{
                          padding: '10px 4px', borderRadius: 10, textAlign: 'center',
                          border: `1.5px solid ${approxSeason === s.value ? 'var(--gold)' : 'var(--border)'}`,
                          background: approxSeason === s.value ? 'var(--gold-dim)' : 'var(--bg3)',
                          cursor: 'pointer', display: 'flex', flexDirection: 'column',
                          alignItems: 'center', gap: 3,
                        }}
                      >
                        <span style={{ fontSize: 20 }}>{s.icon}</span>
                        <span style={{
                          fontSize: 10, fontWeight: 700,
                          color: approxSeason === s.value ? 'var(--gold)' : 'var(--text3)',
                        }}>
                          {s.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Month + Year side by side */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <label style={{ ...labelStyle, marginBottom: 6, fontSize: 10 }}>Month</label>
                    <select
                      style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }}
                      value={approxMonth}
                      onChange={e => setApproxMonth(e.target.value)}
                    >
                      <option value="">Any month</option>
                      {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ ...labelStyle, marginBottom: 6, fontSize: 10 }}>Year</label>
                    <select
                      style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }}
                      value={approxYear}
                      onChange={e => setApproxYear(e.target.value)}
                    >
                      {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ════════ STEP 2: Photos ════════ */}
        {step === 'photos' && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Add your photos</div>
              <div style={{ fontSize: 13, color: 'var(--text3)' }}>
                {filledPhotos.length > 0
                  ? `${filledPhotos.length} photo${filledPhotos.length !== 1 ? 's' : ''} added — tap to add more or remove`
                  : 'Tap a tile to upload from your device'}
              </div>
            </div>

            {/* 3-column photo grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {gridSlots.map((photo, i) =>
                photo ? (
                  /* Filled slot */
                  <div
                    key={i}
                    style={{
                      position: 'relative', aspectRatio: '1', borderRadius: 12, overflow: 'hidden',
                    }}
                  >
                    <Image src={photo} alt="" fill style={{ objectFit: 'cover' }} />
                    {/* Remove button */}
                    <button
                      onClick={() => removePhoto(i)}
                      style={{
                        position: 'absolute', top: 5, right: 5,
                        width: 22, height: 22, borderRadius: '50%',
                        background: 'rgba(11,11,20,0.7)', border: 'none',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer',
                      }}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" width="11" height="11">
                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  </div>
                ) : (
                  /* Empty "add" slot */
                  <button
                    key={`empty-${i}`}
                    onClick={() => openFilePicker(filledPhotos.length)}
                    style={{
                      aspectRatio: '1', borderRadius: 12,
                      border: '1.5px dashed var(--border)',
                      background: 'var(--bg3)',
                      display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center', gap: 6,
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%',
                      background: 'var(--bg2)', border: '1px solid var(--border)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="18" height="18" style={{ color: 'var(--text3)' }}>
                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                        <circle cx="12" cy="13" r="4"/>
                      </svg>
                    </div>
                    <span style={{ fontSize: 10, color: 'var(--text3)', fontWeight: 600 }}>
                      {filledPhotos.length === 0 ? 'Add photo' : '+'}
                    </span>
                  </button>
                )
              )}
            </div>

            {filledPhotos.length > 0 && filledPhotos.length < MAX_PHOTOS && (
              <div style={{
                marginTop: 14, fontSize: 11, color: 'var(--text3)', textAlign: 'center',
              }}>
                Up to {MAX_PHOTOS} photos · {MAX_PHOTOS - filledPhotos.length} remaining
              </div>
            )}
          </div>
        )}

        {/* ════════ STEP 3: Your take ════════ */}
        {step === 'take' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>

            {/* Notes */}
            <div>
              <label style={labelStyle}>How was it?</label>
              <textarea
                style={{
                  ...inputStyle,
                  minHeight: 110, resize: 'none', lineHeight: 1.55, fontFamily: 'inherit',
                }}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Any highlights, surprises, things to know? (optional)"
              />
            </div>

            {/* Highlights & tips */}
            <div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 6 }}>
                <label style={{ ...labelStyle, marginBottom: 0 }}>Highlights & tips</label>
                <span style={{ fontSize: 11, color: 'var(--text3)' }}>optional</span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 12, lineHeight: 1.45 }}>
                Quick notes — best meal, must-see, what you&apos;d do differently.
              </div>

              {memories.map((m, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 12px', borderRadius: 10, marginBottom: 8,
                  background: 'var(--bg3)', border: '1px solid var(--border)',
                }}>
                  <span style={{ fontSize: 20, flexShrink: 0 }}>{m.emoji}</span>
                  <span style={{ flex: 1, fontSize: 13 }}>{m.text}</span>
                  <button
                    onClick={() => removeMemory(i)}
                    style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', padding: 4 }}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </div>
              ))}

              {addingMem ? (
                <div style={{
                  padding: 14, borderRadius: 12,
                  background: 'var(--bg3)', border: '1px solid var(--gold)', marginBottom: 8,
                }}>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                    {MEMORY_EMOJIS.map(e => (
                      <button
                        key={e}
                        onClick={() => setMemEmoji(e)}
                        style={{
                          width: 32, height: 32, borderRadius: 8, fontSize: 16,
                          background: memEmoji === e ? 'var(--gold-dim)' : 'var(--bg2)',
                          border: `1px solid ${memEmoji === e ? 'var(--gold)' : 'var(--border)'}`,
                          cursor: 'pointer',
                        }}
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                  <input
                    style={{ ...inputStyle, marginBottom: 10 }}
                    placeholder="e.g. Best ramen at Ichiran — go early!"
                    value={memText}
                    onChange={e => setMemText(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addMemory()}
                    autoFocus
                  />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => setAddingMem(false)}
                      style={{
                        flex: 1, padding: '9px', borderRadius: 8, fontSize: 13,
                        background: 'var(--bg2)', border: '1px solid var(--border)',
                        color: 'var(--text2)', cursor: 'pointer',
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={addMemory}
                      disabled={!memText.trim()}
                      style={{
                        flex: 2, padding: '9px', borderRadius: 8, fontSize: 13, fontWeight: 700,
                        background: memText.trim() ? 'var(--gold)' : 'var(--bg3)',
                        color: memText.trim() ? '#0B0B14' : 'var(--text3)',
                        border: 'none', cursor: memText.trim() ? 'pointer' : 'default',
                      }}
                    >
                      Add
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setAddingMem(true)}
                  style={{
                    width: '100%', padding: '10px', borderRadius: 10,
                    border: '1px dashed var(--border)', background: 'none',
                    fontSize: 13, color: 'var(--text3)', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13">
                    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                  Add a highlight or tip
                </button>
              )}
            </div>

            {/* ── Itinerary ── */}
            <div>
              {/* Section header — collapses/expands the whole block */}
              <button
                onClick={() => { setItinExpanded(p => !p); if (!itinExpanded && itinerary.length === 0) addDay() }}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginBottom: itinExpanded ? 12 : 0,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                  <span style={{ ...labelStyle, marginBottom: 0 }}>Itinerary</span>
                  <span style={{ fontSize: 11, color: 'var(--text3)' }}>optional</span>
                </div>
                <svg
                  viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"
                  style={{ color: 'var(--text3)', transform: itinExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }}
                >
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>

              {itinExpanded && (
                <div>
                  <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 14, lineHeight: 1.45 }}>
                    Jot down your stops, day by day. Keep it as simple or detailed as you like.
                  </div>

                  {/* Days */}
                  {itinerary.map((day, dayIdx) => (
                    <div key={dayIdx} style={{
                      marginBottom: 14, borderRadius: 12,
                      background: 'var(--bg3)', border: '1px solid var(--border)', overflow: 'hidden',
                    }}>
                      {/* Day header */}
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        padding: '10px 12px', borderBottom: day.stops.length > 0 || addingStopDay === dayIdx ? '1px solid var(--border)' : 'none',
                      }}>
                        <div style={{
                          width: 26, height: 26, borderRadius: 7, flexShrink: 0,
                          background: 'var(--gold-dim)', border: '1px solid var(--gold)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 10, fontWeight: 800, color: 'var(--gold)',
                        }}>
                          {dayIdx + 1}
                        </div>
                        {editingDayIdx === dayIdx ? (
                          <input
                            style={{ ...inputStyle, padding: '5px 8px', fontSize: 13, flex: 1 }}
                            value={day.title}
                            onChange={e => updateDayTitle(dayIdx, e.target.value)}
                            onBlur={() => setEditingDayIdx(null)}
                            onKeyDown={e => e.key === 'Enter' && setEditingDayIdx(null)}
                            autoFocus
                          />
                        ) : (
                          <button
                            onClick={() => setEditingDayIdx(dayIdx)}
                            style={{ flex: 1, textAlign: 'left', background: 'none', border: 'none', cursor: 'text', fontSize: 13, fontWeight: 600, color: 'var(--text)', padding: 0 }}
                          >
                            {day.title}
                            <span style={{ fontSize: 10, color: 'var(--text3)', marginLeft: 6, fontWeight: 400 }}>tap to rename</span>
                          </button>
                        )}
                        <button
                          onClick={() => removeDay(dayIdx)}
                          style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', padding: 4, flexShrink: 0 }}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13">
                            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                          </svg>
                        </button>
                      </div>

                      {/* Stops */}
                      {day.stops.map((stop, stopIdx) => (
                        <div key={stopIdx} style={{
                          display: 'flex', alignItems: 'flex-start', gap: 10,
                          padding: '9px 12px',
                          borderBottom: stopIdx < day.stops.length - 1 || addingStopDay === dayIdx ? '1px solid var(--border)' : 'none',
                        }}>
                          <span style={{ fontSize: 18, flexShrink: 0, marginTop: 1 }}>{stop.emoji}</span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 13, fontWeight: 600 }}>{stop.place}</div>
                            {stop.note && <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{stop.note}</div>}
                          </div>
                          <button
                            onClick={() => removeStop(dayIdx, stopIdx)}
                            style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', padding: 4, flexShrink: 0 }}
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12">
                              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                            </svg>
                          </button>
                        </div>
                      ))}

                      {/* Add stop form */}
                      {addingStopDay === dayIdx ? (
                        <div style={{ padding: '10px 12px' }}>
                          {/* Emoji row */}
                          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 8 }}>
                            {STOP_EMOJIS.map(e => (
                              <button
                                key={e}
                                onClick={() => setStopEmoji(e)}
                                style={{
                                  width: 30, height: 30, borderRadius: 7, fontSize: 15,
                                  background: stopEmoji === e ? 'var(--gold-dim)' : 'var(--bg2)',
                                  border: `1px solid ${stopEmoji === e ? 'var(--gold)' : 'var(--border)'}`,
                                  cursor: 'pointer',
                                }}
                              >{e}</button>
                            ))}
                          </div>
                          <input
                            style={{ ...inputStyle, marginBottom: 6 }}
                            placeholder="Place or activity name"
                            value={stopPlace}
                            onChange={e => setStopPlace(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && addStop(dayIdx)}
                            autoFocus
                          />
                          <input
                            style={{ ...inputStyle, marginBottom: 10 }}
                            placeholder="Note (optional) — e.g. book ahead, amazing views"
                            value={stopNote}
                            onChange={e => setStopNote(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && addStop(dayIdx)}
                          />
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button
                              onClick={() => { setAddingStopDay(null); setStopPlace(''); setStopNote('') }}
                              style={{
                                flex: 1, padding: '8px', borderRadius: 8, fontSize: 12,
                                background: 'var(--bg2)', border: '1px solid var(--border)',
                                color: 'var(--text2)', cursor: 'pointer',
                              }}
                            >Cancel</button>
                            <button
                              onClick={() => addStop(dayIdx)}
                              disabled={!stopPlace.trim()}
                              style={{
                                flex: 2, padding: '8px', borderRadius: 8, fontSize: 12, fontWeight: 700,
                                background: stopPlace.trim() ? 'var(--gold)' : 'var(--bg3)',
                                color: stopPlace.trim() ? '#0B0B14' : 'var(--text3)',
                                border: 'none', cursor: stopPlace.trim() ? 'pointer' : 'default',
                              }}
                            >Add stop</button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setAddingStopDay(dayIdx)}
                          style={{
                            width: '100%', padding: '9px 12px', textAlign: 'left',
                            background: 'none', border: 'none', cursor: 'pointer',
                            fontSize: 12, color: 'var(--text3)',
                            display: 'flex', alignItems: 'center', gap: 6,
                          }}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12">
                            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                          </svg>
                          Add stop
                        </button>
                      )}
                    </div>
                  ))}

                  {/* Add day button */}
                  <button
                    onClick={addDay}
                    style={{
                      width: '100%', padding: '10px', borderRadius: 10,
                      border: '1px dashed var(--border)', background: 'none',
                      fontSize: 13, color: 'var(--text3)', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    }}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13">
                      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                    Add {itinerary.length === 0 ? 'a day' : 'another day'}
                  </button>
                </div>
              )}
            </div>

          </div>
        )}
      </div>

      {/* ── Footer CTA ───────────────────────────────────── */}
      <div style={{
        flexShrink: 0, padding: '14px 20px 38px',
        borderTop: '1px solid var(--border)',
      }}>
        {isLast ? (
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              width: '100%', padding: '15px', borderRadius: 14,
              background: saving ? 'var(--bg3)' : 'var(--gold)',
              color: saving ? 'var(--text3)' : '#0B0B14',
              fontSize: 15, fontWeight: 800, border: 'none',
              cursor: saving ? 'default' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            {saving ? (
              <>
                <svg style={{ animation: 'spin 1s linear infinite' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="17" height="17">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                </svg>
                Saving…
              </>
            ) : '✓ Log this trip'}
          </button>
        ) : (
          <div style={{ display: 'flex', gap: 10 }}>
            {/* Skip only on photos step */}
            {step === 'photos' && (
              <button
                onClick={goNext}
                style={{
                  padding: '15px 18px', borderRadius: 14,
                  border: '1px solid var(--border)', background: 'var(--bg3)',
                  fontSize: 14, color: 'var(--text2)', cursor: 'pointer', fontWeight: 600,
                }}
              >
                Skip
              </button>
            )}
            <button
              onClick={goNext}
              style={{
                flex: 1, padding: '15px', borderRadius: 14,
                background: 'var(--gold)', color: '#0B0B14',
                fontSize: 15, fontWeight: 800, border: 'none', cursor: 'pointer',
              }}
            >
              {step === 'photos' && filledPhotos.length > 0
                ? `Next — ${filledPhotos.length} photo${filledPhotos.length !== 1 ? 's' : ''}`
                : 'Next'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
