'use client'

import { useState } from 'react'
import Image from 'next/image'
import type { Trip, Season, BeenMemory, BeenTripData } from '@/lib/types'
import { useAppState } from '@/lib/app-state'
import { useToast } from '@/components/ui/Toast'

// ─── Helpers ────────────────────────────────────────────────────

const MONTHS = ['January','February','March','April','May','June',
                'July','August','September','October','November','December']

const SEASONS: { value: Season; label: string }[] = [
  { value: 'spring', label: '🌸 Spring' },
  { value: 'summer', label: '☀️ Summer' },
  { value: 'autumn', label: '🍂 Autumn' },
  { value: 'winter', label: '❄️ Winter' },
]

const CURRENT_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: CURRENT_YEAR - 2009 }, (_, i) => String(CURRENT_YEAR - i))

const MEMORY_EMOJIS = ['🍽️','🏞️','🏨','⛺','🎵','🛍️','🏛️','🌅','🤿','🚴','☕','🍷','💡','❤️','😂','✨']

// ─── Photo picker (camera-roll simulation) ───────────────────────

function PhotoPicker({
  tripId,
  selected,
  onToggle,
}: {
  tripId: string
  selected: Set<string>
  onToggle: (url: string) => void
}) {
  // 24 pseudo-random picsum images seeded by tripId
  const photos = Array.from({ length: 24 }, (_, i) =>
    `https://picsum.photos/seed/${tripId}-been${i + 1}/300/300`
  )

  return (
    <div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 3,
        }}
      >
        {photos.map((url, i) => {
          const sel = selected.has(url)
          return (
            <button
              key={i}
              onClick={() => onToggle(url)}
              style={{ position: 'relative', aspectRatio: '1', borderRadius: 6, overflow: 'hidden' }}
            >
              <Image src={url} alt="" fill style={{ objectFit: 'cover' }} />
              {/* Selection overlay */}
              <div style={{
                position: 'absolute', inset: 0,
                background: sel ? 'rgba(212,175,55,0.35)' : 'transparent',
                transition: 'background 0.15s',
              }} />
              {sel && (
                <div style={{
                  position: 'absolute', top: 5, right: 5,
                  width: 20, height: 20, borderRadius: '50%',
                  background: 'var(--gold)', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: 11, fontWeight: 800, color: '#0B0B14',
                }}>
                  ✓
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Props ───────────────────────────────────────────────────────

interface Props {
  trip: Trip                    // the trip being logged (for pre-fill + id)
  onClose: () => void
  onSaved?: () => void          // called after successful save
}

// ─── Main component ──────────────────────────────────────────────

type Step = 'photos' | 'when' | 'take'

const STEPS: Step[] = ['photos', 'when', 'take']

const STEP_META: Record<Step, { title: string; subtitle: string }> = {
  photos:  { title: 'Your photos',    subtitle: 'Select photos from this trip' },
  when:    { title: 'When & where',   subtitle: 'Tell us about your visit' },
  take:    { title: 'Your take',      subtitle: 'Share your experience (optional)' },
}

export default function BeenFlow({ trip, onClose, onSaved }: Props) {
  const { saveBeen } = useAppState()
  const { showToast } = useToast()

  const [step,     setStep]     = useState<Step>('photos')
  const [saving,   setSaving]   = useState(false)
  const [animDir,  setAnimDir]  = useState<'forward' | 'back'>('forward')

  // ── Step 1: Photos ──
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set())

  // ── Step 2: When & Where ──
  const [location,     setLocation]     = useState(trip.location)
  const [dateType,     setDateType]     = useState<'exact' | 'approximate'>('approximate')
  const [startDate,    setStartDate]    = useState('')
  const [endDate,      setEndDate]      = useState('')
  const [approxMonth,  setApproxMonth]  = useState('')
  const [approxSeason, setApproxSeason] = useState<Season | ''>('')
  const [approxYear,   setApproxYear]   = useState(String(CURRENT_YEAR))

  // ── Step 3: Your take ──
  const [notes,    setNotes]    = useState('')
  const [memories, setMemories] = useState<BeenMemory[]>([])
  const [memText,  setMemText]  = useState('')
  const [memEmoji, setMemEmoji] = useState('✨')
  const [addingMem, setAddingMem] = useState(false)

  function togglePhoto(url: string) {
    setSelectedPhotos(prev => {
      const next = new Set(prev)
      next.has(url) ? next.delete(url) : next.add(url)
      return next
    })
  }

  function navigate(dir: 'forward' | 'back') {
    setAnimDir(dir)
    const idx = STEPS.indexOf(step)
    if (dir === 'forward' && idx < STEPS.length - 1) setStep(STEPS[idx + 1])
    if (dir === 'back'    && idx > 0)                 setStep(STEPS[idx - 1])
  }

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

  async function handleSave() {
    setSaving(true)
    await new Promise(r => setTimeout(r, 600)) // brief haptic delay

    const data: BeenTripData = {
      tripId:       trip.id,
      location:     location.trim() || trip.location,
      dateType,
      startDate:    dateType === 'exact' ? startDate || null : null,
      endDate:      dateType === 'exact' ? endDate   || null : null,
      approxMonth:  dateType === 'approximate' ? approxMonth  || null : null,
      approxYear:   dateType === 'approximate' ? approxYear   || null : null,
      approxSeason: dateType === 'approximate' ? (approxSeason || null) as Season | null : null,
      notes,
      photos:       Array.from(selectedPhotos),
      memories,
    }

    saveBeen(data)
    setSaving(false)
    showToast('✅ Trip logged!')
    onSaved?.()
    onClose()
  }

  const stepIdx    = STEPS.indexOf(step)
  const isFirst    = stepIdx === 0
  const isLast     = stepIdx === STEPS.length - 1
  const { title, subtitle } = STEP_META[step]

  // ── Input style helper ──
  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '11px 14px', borderRadius: 10,
    background: 'var(--bg3)', border: '1px solid var(--border)',
    color: 'var(--text)', fontSize: 14, outline: 'none',
    boxSizing: 'border-box',
  }
  const selectStyle: React.CSSProperties = { ...inputStyle, appearance: 'none', cursor: 'pointer' }
  const labelStyle: React.CSSProperties = {
    fontSize: 11, fontWeight: 600, color: 'var(--text3)',
    textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6, display: 'block',
  }

  return (
    /* Full-screen overlay */
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'var(--bg)',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* ── Header ─────────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '56px 20px 16px',
        borderBottom: '1px solid var(--border)',
        flexShrink: 0,
      }}>
        <button
          onClick={isFirst ? onClose : () => navigate('back')}
          style={{
            width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--bg3)', border: '1px solid var(--border)',
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
            {isFirst
              ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
              : <polyline points="15 18 9 12 15 6"/>
            }
          </svg>
        </button>

        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 700 }}>{title}</div>
          <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 1 }}>{subtitle}</div>
        </div>

        {/* Step dots */}
        <div style={{ display: 'flex', gap: 5 }}>
          {STEPS.map((s, i) => (
            <div key={s} style={{
              width: i === stepIdx ? 16 : 6, height: 6,
              borderRadius: 3,
              background: i <= stepIdx ? 'var(--gold)' : 'var(--bg3)',
              transition: 'all 0.2s',
            }} />
          ))}
        </div>
      </div>

      {/* Trip context pill */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '10px 20px',
        borderBottom: '1px solid var(--border)',
        flexShrink: 0,
      }}>
        {trip.cover_image_url && (
          <div style={{ position: 'relative', width: 32, height: 32, borderRadius: 6, overflow: 'hidden', flexShrink: 0 }}>
            <Image src={trip.cover_image_url} alt="" fill style={{ objectFit: 'cover' }} />
          </div>
        )}
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {trip.title}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text3)' }}>{trip.country_emoji} {trip.location}</div>
        </div>
      </div>

      {/* ── Step content ─────────────────────────────────── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}
        key={`${step}-${animDir}`}
      >

        {/* ── STEP 1: Photos ── */}
        {step === 'photos' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ fontSize: 13, color: 'var(--text2)' }}>
                {selectedPhotos.size > 0
                  ? `${selectedPhotos.size} photo${selectedPhotos.size !== 1 ? 's' : ''} selected`
                  : 'Tap to select your favourites'}
              </div>
              {selectedPhotos.size > 0 && (
                <button
                  onClick={() => setSelectedPhotos(new Set())}
                  style={{ fontSize: 12, color: 'var(--text3)', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  Clear
                </button>
              )}
            </div>
            <PhotoPicker
              tripId={trip.id}
              selected={selectedPhotos}
              onToggle={togglePhoto}
            />
          </div>
        )}

        {/* ── STEP 2: When & Where ── */}
        {step === 'when' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Location */}
            <div>
              <label style={labelStyle}>Where did you go?</label>
              <input
                style={inputStyle}
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="City, Country"
              />
            </div>

            {/* Date type toggle */}
            <div>
              <label style={labelStyle}>When was this?</label>
              <div style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr',
                gap: 8, marginBottom: 14,
              }}>
                {([['approximate', 'Roughly when'], ['exact', 'Exact dates']] as const).map(([val, lbl]) => (
                  <button
                    key={val}
                    onClick={() => setDateType(val)}
                    style={{
                      padding: '10px', borderRadius: 10, fontSize: 13, fontWeight: 600,
                      border: `1px solid ${dateType === val ? 'var(--gold)' : 'var(--border)'}`,
                      background: dateType === val ? 'var(--gold-dim)' : 'var(--bg3)',
                      color: dateType === val ? 'var(--gold)' : 'var(--text2)',
                      cursor: 'pointer',
                    }}
                  >
                    {lbl}
                  </button>
                ))}
              </div>

              {dateType === 'approximate' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    {/* Season */}
                    <div>
                      <label style={{ ...labelStyle, marginBottom: 4 }}>Season</label>
                      <div style={{ position: 'relative' }}>
                        <select
                          style={selectStyle}
                          value={approxSeason}
                          onChange={e => setApproxSeason(e.target.value as Season | '')}
                        >
                          <option value="">Any season</option>
                          {SEASONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                        </select>
                      </div>
                    </div>
                    {/* Year */}
                    <div>
                      <label style={{ ...labelStyle, marginBottom: 4 }}>Year</label>
                      <div style={{ position: 'relative' }}>
                        <select
                          style={selectStyle}
                          value={approxYear}
                          onChange={e => setApproxYear(e.target.value)}
                        >
                          {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                  {/* Month */}
                  <div>
                    <label style={{ ...labelStyle, marginBottom: 4 }}>Month (optional)</label>
                    <div style={{ position: 'relative' }}>
                      <select
                        style={selectStyle}
                        value={approxMonth}
                        onChange={e => setApproxMonth(e.target.value)}
                      >
                        <option value="">Not sure of month</option>
                        {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {dateType === 'exact' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <label style={{ ...labelStyle, marginBottom: 4 }}>From</label>
                    <input
                      type="date"
                      style={inputStyle}
                      value={startDate}
                      onChange={e => setStartDate(e.target.value)}
                      max={endDate || undefined}
                    />
                  </div>
                  <div>
                    <label style={{ ...labelStyle, marginBottom: 4 }}>To</label>
                    <input
                      type="date"
                      style={inputStyle}
                      value={endDate}
                      onChange={e => setEndDate(e.target.value)}
                      min={startDate || undefined}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── STEP 3: Your take ── */}
        {step === 'take' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Notes */}
            <div>
              <label style={labelStyle}>How was it?</label>
              <textarea
                style={{
                  ...inputStyle,
                  minHeight: 100, resize: 'none', lineHeight: 1.5,
                  fontFamily: 'inherit',
                }}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Any highlights, surprises, or things to know? (optional)"
              />
            </div>

            {/* Memories */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <label style={{ ...labelStyle, marginBottom: 0 }}>Highlights & tips</label>
                <span style={{ fontSize: 11, color: 'var(--text3)' }}>optional</span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 12 }}>
                Quick notes — best meal, must-see, thing you'd do differently.
              </div>

              {/* Existing memories */}
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
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </div>
              ))}

              {/* Add memory form */}
              {addingMem ? (
                <div style={{
                  padding: 14, borderRadius: 12,
                  background: 'var(--bg3)', border: '1px solid var(--gold)',
                  marginBottom: 8,
                }}>
                  {/* Emoji picker */}
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
                    placeholder="e.g. Best ramen at Ichiran — go solo!"
                    value={memText}
                    onChange={e => setMemText(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addMemory()}
                    autoFocus
                  />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => setAddingMem(false)}
                      style={{
                        flex: 1, padding: '8px', borderRadius: 8, fontSize: 13,
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
                        flex: 2, padding: '8px', borderRadius: 8, fontSize: 13, fontWeight: 700,
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
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                  Add a highlight or tip
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Footer CTA ───────────────────────────────────── */}
      <div style={{
        padding: '16px 20px 36px',
        borderTop: '1px solid var(--border)',
        flexShrink: 0,
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
                <svg style={{ animation: 'spin 1s linear infinite' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                </svg>
                Saving…
              </>
            ) : (
              '✓ Log this trip'
            )}
          </button>
        ) : (
          <div style={{ display: 'flex', gap: 10 }}>
            {step === 'photos' && (
              <button
                onClick={() => navigate('forward')}
                style={{
                  padding: '15px 20px', borderRadius: 14,
                  border: '1px solid var(--border)', background: 'var(--bg3)',
                  fontSize: 14, color: 'var(--text2)', cursor: 'pointer', fontWeight: 600,
                }}
              >
                Skip
              </button>
            )}
            <button
              onClick={() => navigate('forward')}
              style={{
                flex: 1, padding: '15px', borderRadius: 14,
                background: 'var(--gold)', color: '#0B0B14',
                fontSize: 15, fontWeight: 800, border: 'none', cursor: 'pointer',
              }}
            >
              {step === 'photos'
                ? selectedPhotos.size > 0
                  ? `Next — ${selectedPhotos.size} photo${selectedPhotos.size !== 1 ? 's' : ''}`
                  : 'Next'
                : 'Next'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
