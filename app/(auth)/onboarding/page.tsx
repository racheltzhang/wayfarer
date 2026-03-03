'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/Toast'
import { ToastProvider } from '@/components/ui/Toast'

// ── Types ──────────────────────────────────────────────────────

interface Prefs {
  travelTypes:   string[]
  destinations:  string[]
  stayStyle:     string
  budget:        string
  intent:        string[]
}

// ── Data ───────────────────────────────────────────────────────

const TRAVEL_TYPES = [
  { id: 'relax',     emoji: '🌴', label: 'Relax & unwind'     },
  { id: 'food',      emoji: '🍷', label: 'Food & wine'        },
  { id: 'culture',   emoji: '🎭', label: 'Arts & culture'     },
  { id: 'nature',    emoji: '🏔️', label: 'Nature & adventure' },
  { id: 'shopping',  emoji: '🛍️', label: 'Shopping & city life' },
  { id: 'history',   emoji: '🏛️', label: 'History'            },
  { id: 'nightlife', emoji: '🌙', label: 'Nightlife'          },
  { id: 'luxury',    emoji: '💎', label: 'Luxury'             },
  { id: 'budget',    emoji: '🎒', label: 'Budget'             },
]

const TRENDING_DESTINATIONS = [
  { city: 'Tokyo',     country: 'Japan',    emoji: '🇯🇵' },
  { city: 'Milan',     country: 'Italy',    emoji: '🇮🇹' },
  { city: 'Barcelona', country: 'Spain',    emoji: '🇪🇸' },
  { city: 'Tulum',     country: 'Mexico',   emoji: '🇲🇽' },
  { city: 'New York',  country: 'USA',      emoji: '🇺🇸' },
  { city: 'Bali',      country: 'Indonesia',emoji: '🇮🇩' },
  { city: 'Paris',     country: 'France',   emoji: '🇫🇷' },
  { city: 'Kyoto',     country: 'Japan',    emoji: '🇯🇵' },
  { city: 'Lisbon',    country: 'Portugal', emoji: '🇵🇹' },
  { city: 'Cape Town', country: 'S. Africa',emoji: '🇿🇦' },
]

const STAY_STYLES = [
  { id: 'boutique', emoji: '🏡', label: 'Boutique hotels',  sub: 'Intimate, design-led stays' },
  { id: 'luxury',   emoji: '🏨', label: 'Luxury hotels',    sub: 'Five-star everything'       },
  { id: 'airbnb',   emoji: '🔑', label: 'Airbnb',           sub: 'Live like a local'          },
  { id: 'hostel',   emoji: '🛏️', label: 'Hostels',          sub: 'Meet fellow travelers'      },
  { id: 'friends',  emoji: '🤝', label: 'Friends & family', sub: 'Couch and connections'      },
]

const BUDGET_LEVELS = [
  { id: 'saver',     emoji: '💰', label: 'Smart saver',  sub: 'Max value, no frills'      },
  { id: 'balanced',  emoji: '⚖️', label: 'Balanced',     sub: 'Comfort without guilt'     },
  { id: 'premium',   emoji: '✨', label: 'Premium',       sub: 'Quality-first decisions'   },
  { id: 'indulgent', emoji: '👑', label: 'Indulgent',     sub: 'The best, always'          },
]

const INTENT_OPTIONS = [
  { id: 'discover', emoji: '🔭', label: 'Discover places'                   },
  { id: 'plan',     emoji: '📋', label: 'Plan trips'                        },
  { id: 'share',    emoji: '📸', label: 'Share my travels'                  },
  { id: 'meet',     emoji: '👥', label: 'Meet other travelers'              },
  { id: 'content',  emoji: '🎨', label: 'Create aesthetic travel content'   },
]

const TOTAL_STEPS = 5

// ── Progress bar ───────────────────────────────────────────────

function ProgressBar({ step }: { step: number }) {
  return (
    <div className="flex gap-1.5 px-6 pt-14 pb-0">
      {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
        <div
          key={i}
          className="flex-1 rounded-full transition-all"
          style={{
            height: 3,
            background: i < step ? 'var(--gold)' : 'var(--border)',
            transition: 'background 0.4s ease',
          }}
        />
      ))}
    </div>
  )
}

// ── Selection card ─────────────────────────────────────────────

function SelectCard({
  emoji, label, sub, selected, onClick, wide,
}: {
  emoji: string
  label: string
  sub?: string
  selected: boolean
  onClick: () => void
  wide?: boolean
}) {
  return (
    <button
      onClick={onClick}
      className="text-left transition-all active:scale-[0.97]"
      style={{
        padding: wide ? '14px 16px' : '16px 14px',
        borderRadius: 14,
        border: `1.5px solid ${selected ? 'var(--gold)' : 'var(--border)'}`,
        background: selected ? 'rgba(212,175,55,0.08)' : 'var(--card)',
        display: 'flex',
        alignItems: wide ? 'center' : 'flex-start',
        gap: 12,
        flexDirection: wide ? 'row' : 'column',
        width: '100%',
      }}
    >
      <span style={{ fontSize: wide ? 22 : 26, flexShrink: 0 }}>{emoji}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 13, fontWeight: 600, lineHeight: 1.3,
          color: selected ? 'var(--gold)' : 'var(--text)',
        }}>
          {label}
        </div>
        {sub && (
          <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2, lineHeight: 1.4 }}>
            {sub}
          </div>
        )}
      </div>
      {wide && selected && (
        <div style={{
          width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
          background: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="var(--bg)" strokeWidth="3" width="12" height="12">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
      )}
    </button>
  )
}

// ── Step components ────────────────────────────────────────────

function StepTravelTypes({ prefs, setPrefs }: { prefs: Prefs; setPrefs: (p: Prefs) => void }) {
  function toggle(id: string) {
    setPrefs({
      ...prefs,
      travelTypes: prefs.travelTypes.includes(id)
        ? prefs.travelTypes.filter(t => t !== id)
        : [...prefs.travelTypes, id],
    })
  }
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
        {TRAVEL_TYPES.map(t => (
          <SelectCard
            key={t.id}
            emoji={t.emoji}
            label={t.label}
            selected={prefs.travelTypes.includes(t.id)}
            onClick={() => toggle(t.id)}
          />
        ))}
      </div>
      {prefs.travelTypes.length > 0 && (
        <p className="text-center text-[12px] mt-3" style={{ color: 'var(--gold)' }}>
          {prefs.travelTypes.length} selected
        </p>
      )}
    </div>
  )
}

function StepDestinations({ prefs, setPrefs }: { prefs: Prefs; setPrefs: (p: Prefs) => void }) {
  const [query, setQuery] = useState('')

  const filtered = query.trim()
    ? TRENDING_DESTINATIONS.filter(d =>
        d.city.toLowerCase().includes(query.toLowerCase()) ||
        d.country.toLowerCase().includes(query.toLowerCase())
      )
    : TRENDING_DESTINATIONS

  function toggle(city: string) {
    if (prefs.destinations.includes(city)) {
      setPrefs({ ...prefs, destinations: prefs.destinations.filter(d => d !== city) })
    } else if (prefs.destinations.length < 5) {
      setPrefs({ ...prefs, destinations: [...prefs.destinations, city] })
    }
  }

  return (
    <div>
      {/* Search bar */}
      <div className="relative mb-4">
        <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </div>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search cities…"
          className="form-input"
          style={{ paddingLeft: 36 }}
        />
      </div>

      {/* Selected chips */}
      {prefs.destinations.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {prefs.destinations.map(city => (
            <button
              key={city}
              onClick={() => toggle(city)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors"
              style={{ background: 'var(--gold)', color: 'var(--bg)' }}
            >
              {city}
              <span style={{ fontSize: 14, lineHeight: 1 }}>×</span>
            </button>
          ))}
        </div>
      )}

      {/* Hint */}
      <p className="text-[11px] mb-3" style={{ color: 'var(--text3)' }}>
        {query ? `${filtered.length} result${filtered.length !== 1 ? 's' : ''}` : 'Trending right now · up to 5'}
      </p>

      {/* Destination grid */}
      <div className="flex flex-col gap-2">
        {filtered.map(dest => {
          const sel = prefs.destinations.includes(dest.city)
          const maxed = !sel && prefs.destinations.length >= 5
          return (
            <button
              key={dest.city}
              onClick={() => !maxed && toggle(dest.city)}
              className="flex items-center gap-3 px-4 py-3 rounded-[12px] text-left transition-all active:scale-[0.98]"
              style={{
                background: sel ? 'rgba(212,175,55,0.08)' : 'var(--card)',
                border: `1.5px solid ${sel ? 'var(--gold)' : 'var(--border)'}`,
                opacity: maxed ? 0.4 : 1,
              }}
            >
              <span style={{ fontSize: 22 }}>{dest.emoji}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: sel ? 'var(--gold)' : 'var(--text)' }}>
                  {dest.city}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text3)' }}>{dest.country}</div>
              </div>
              {sel && (
                <div style={{
                  width: 22, height: 22, borderRadius: '50%', background: 'var(--gold)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="var(--bg)" strokeWidth="3" width="12" height="12">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function StepStayStyle({ prefs, setPrefs }: { prefs: Prefs; setPrefs: (p: Prefs) => void }) {
  return (
    <div className="flex flex-col gap-3">
      {STAY_STYLES.map(s => (
        <SelectCard
          key={s.id}
          emoji={s.emoji}
          label={s.label}
          sub={s.sub}
          selected={prefs.stayStyle === s.id}
          onClick={() => setPrefs({ ...prefs, stayStyle: s.id })}
          wide
        />
      ))}
    </div>
  )
}

function StepBudget({ prefs, setPrefs }: { prefs: Prefs; setPrefs: (p: Prefs) => void }) {
  return (
    <div className="flex flex-col gap-3">
      {BUDGET_LEVELS.map(b => (
        <SelectCard
          key={b.id}
          emoji={b.emoji}
          label={b.label}
          sub={b.sub}
          selected={prefs.budget === b.id}
          onClick={() => setPrefs({ ...prefs, budget: b.id })}
          wide
        />
      ))}
    </div>
  )
}

function StepIntent({ prefs, setPrefs }: { prefs: Prefs; setPrefs: (p: Prefs) => void }) {
  function toggle(id: string) {
    setPrefs({
      ...prefs,
      intent: prefs.intent.includes(id)
        ? prefs.intent.filter(i => i !== id)
        : [...prefs.intent, id],
    })
  }
  return (
    <div className="flex flex-col gap-3">
      {INTENT_OPTIONS.map(opt => (
        <button
          key={opt.id}
          onClick={() => toggle(opt.id)}
          className="flex items-center gap-4 px-4 py-4 rounded-[14px] text-left transition-all active:scale-[0.98]"
          style={{
            border: `1.5px solid ${prefs.intent.includes(opt.id) ? 'var(--gold)' : 'var(--border)'}`,
            background: prefs.intent.includes(opt.id) ? 'rgba(212,175,55,0.08)' : 'var(--card)',
          }}
        >
          <span style={{ fontSize: 24, flexShrink: 0 }}>{opt.emoji}</span>
          <span style={{
            flex: 1, fontSize: 14, fontWeight: 600,
            color: prefs.intent.includes(opt.id) ? 'var(--gold)' : 'var(--text)',
          }}>
            {opt.label}
          </span>
          <div style={{
            width: 22, height: 22, borderRadius: 6, flexShrink: 0,
            border: `1.5px solid ${prefs.intent.includes(opt.id) ? 'var(--gold)' : 'var(--border)'}`,
            background: prefs.intent.includes(opt.id) ? 'var(--gold)' : 'transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {prefs.intent.includes(opt.id) && (
              <svg viewBox="0 0 24 24" fill="none" stroke="var(--bg)" strokeWidth="3" width="12" height="12">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            )}
          </div>
        </button>
      ))}
    </div>
  )
}

// ── Step metadata ──────────────────────────────────────────────

const STEP_META = [
  {
    q:    'What kind of traveler are you?',
    hint: 'Select all that apply.',
    min:  1,
    minLabel: 'Pick at least one to continue',
  },
  {
    q:    'Where are you most excited to travel?',
    hint: 'Choose up to 5 destinations.',
    min:  1,
    minLabel: 'Add at least one destination',
  },
  {
    q:    'Where do you usually stay?',
    hint: 'Pick one.',
    min:  1,
    minLabel: 'Pick your preference to continue',
  },
  {
    q:    'Pick your comfort level.',
    hint: 'This helps us tailor recommendations.',
    min:  1,
    minLabel: 'Select your comfort level',
  },
  {
    q:    'What do you want to do here?',
    hint: 'Select all that apply.',
    min:  1,
    minLabel: 'Pick at least one goal',
  },
]

// ── Main onboarding ────────────────────────────────────────────

function OnboardingInner() {
  const router = useRouter()
  const { showToast } = useToast()

  const [step, setStep] = useState(1)
  const [prefs, setPrefs] = useState<Prefs>({
    travelTypes:  [],
    destinations: [],
    stayStyle:    '',
    budget:       '',
    intent:       [],
  })
  const [animating, setAnimating] = useState(false)

  const stepMeta = STEP_META[step - 1]

  function canAdvance() {
    if (step === 1) return prefs.travelTypes.length > 0
    if (step === 2) return prefs.destinations.length > 0
    if (step === 3) return !!prefs.stayStyle
    if (step === 4) return !!prefs.budget
    if (step === 5) return prefs.intent.length > 0
    return false
  }

  function advance() {
    if (!canAdvance()) {
      showToast(stepMeta.minLabel)
      return
    }
    if (step < TOTAL_STEPS) {
      setAnimating(true)
      setTimeout(() => {
        setStep(s => s + 1)
        setAnimating(false)
      }, 180)
    } else {
      finish()
    }
  }

  function finish() {
    // Save prefs to localStorage for the app to consume
    if (typeof window !== 'undefined') {
      localStorage.setItem('wayfarer_prefs', JSON.stringify(prefs))
      localStorage.setItem('wayfarer_onboarding_done', '1')
    }

    // Show personalised message based on selections
    if (prefs.intent.includes('share') || prefs.intent.includes('content')) {
      showToast('✦ Welcome! Create your first trip to share it.')
    } else if (prefs.intent.includes('plan')) {
      showToast('✦ Welcome! Start planning your first trip board.')
    } else {
      showToast('✦ Welcome to Wayfarer!')
    }

    router.push('/')
  }

  function skip() {
    router.push('/')
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Progress bar */}
      <ProgressBar step={step} />

      {/* Header row */}
      <div className="flex items-center justify-between px-6 pt-5 pb-0">
        {step > 1 ? (
          <button
            onClick={() => setStep(s => s - 1)}
            style={{ color: 'var(--text3)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0' }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
              <path d="M19 12H5m7-7-7 7 7 7"/>
            </svg>
          </button>
        ) : <div style={{ width: 24 }} />}

        <div className="text-[11px] font-medium" style={{ color: 'var(--text3)' }}>
          {step} of {TOTAL_STEPS}
        </div>

        <button
          onClick={skip}
          className="text-[12px] font-medium"
          style={{ color: 'var(--text3)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0' }}
        >
          Skip
        </button>
      </div>

      {/* Question */}
      <div className="px-6 pt-6 pb-5 flex-shrink-0">
        <h2
          className="font-head text-[26px] leading-[1.2] mb-2"
          style={{
            opacity: animating ? 0 : 1,
            transform: animating ? 'translateY(8px)' : 'translateY(0)',
            transition: 'opacity 0.18s, transform 0.18s',
          }}
        >
          {stepMeta.q}
        </h2>
        <p className="text-[13px]" style={{ color: 'var(--text3)' }}>{stepMeta.hint}</p>
      </div>

      {/* Step content */}
      <div
        className="flex-1 overflow-y-auto no-scrollbar px-6 pb-4"
        style={{
          opacity: animating ? 0 : 1,
          transform: animating ? 'translateX(12px)' : 'translateX(0)',
          transition: 'opacity 0.18s, transform 0.18s',
        }}
      >
        {step === 1 && <StepTravelTypes prefs={prefs} setPrefs={setPrefs} />}
        {step === 2 && <StepDestinations prefs={prefs} setPrefs={setPrefs} />}
        {step === 3 && <StepStayStyle prefs={prefs} setPrefs={setPrefs} />}
        {step === 4 && <StepBudget prefs={prefs} setPrefs={setPrefs} />}
        {step === 5 && <StepIntent prefs={prefs} setPrefs={setPrefs} />}
      </div>

      {/* CTA footer */}
      <div
        className="flex-shrink-0 px-6 pb-8 pt-4"
        style={{ borderTop: '1px solid var(--border)', background: 'var(--bg)' }}
      >
        <button
          onClick={advance}
          className="w-full rounded-[14px] py-4 text-sm font-semibold transition-all active:scale-[0.98]"
          style={{
            background: canAdvance() ? 'var(--gold)' : 'var(--bg3)',
            color: canAdvance() ? 'var(--bg)' : 'var(--text3)',
            border: canAdvance() ? 'none' : '1px solid var(--border)',
            transition: 'background 0.25s, color 0.25s',
          }}
        >
          {step < TOTAL_STEPS ? 'Continue' : '✦ Get started'}
        </button>
      </div>
    </div>
  )
}

export default function OnboardingPage() {
  return (
    <ToastProvider>
      <OnboardingInner />
    </ToastProvider>
  )
}
