'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

// ── Password strength ──────────────────────────────────────────
function getStrength(pw: string): { score: number; label: string; color: string } {
  let score = 0
  if (pw.length >= 8)              score++
  if (/[A-Z]/.test(pw))           score++
  if (/[0-9]/.test(pw))           score++
  if (/[^A-Za-z0-9]/.test(pw))   score++
  const map: [string, string][] = [
    ['Too short', '#E8583A'],
    ['Weak',      '#E8583A'],
    ['Fair',      '#C8A55A'],
    ['Good',      '#4ECBA0'],
    ['Strong',    '#4ECBA0'],
  ]
  const [label, color] = map[score] ?? ['', '']
  return { score, label, color }
}

function StrengthBar({ password }: { password: string }) {
  if (!password) return null
  const { score, label, color } = getStrength(password)
  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[0, 1, 2, 3].map(i => (
          <div
            key={i}
            className="flex-1 rounded-full transition-all"
            style={{
              height: 3,
              background: i < score ? color : 'var(--border)',
              transition: 'background 0.3s',
            }}
          />
        ))}
      </div>
      <div className="text-[11px] font-medium" style={{ color }}>{label}</div>
    </div>
  )
}

function EyeIcon({ show }: { show: boolean }) {
  return show ? (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  )
}

export default function SignUpPage() {
  const router = useRouter()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [confirm,  setConfirm]  = useState('')
  const [showPw,   setShowPw]   = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [errors,   setErrors]   = useState<Record<string, string>>({})

  const emailOk   = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  const strength  = getStrength(password)
  const passwordOk = strength.score >= 2
  const confirmOk  = confirm === password && confirm !== ''

  const validate = useCallback(() => {
    const e: Record<string, string> = {}
    if (!emailOk)    e.email    = 'Please enter a valid email.'
    if (!passwordOk) e.password = 'Choose a stronger password (8+ chars, mix of letters & numbers).'
    if (!confirmOk)  e.confirm  = 'Passwords don\'t match.'
    setErrors(e)
    return Object.keys(e).length === 0
  }, [emailOk, passwordOk, confirmOk])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    // Simulate network latency
    await new Promise(r => setTimeout(r, 900))
    setLoading(false)
    // In real app: create account → if success go to onboarding
    router.push('/onboarding')
  }

  const inputBorder = (field: 'email' | 'password' | 'confirm', valid: boolean) => {
    if (errors[field]) return 'var(--rose)'
    if (valid) return '#4ECBA0'
    return 'var(--border)'
  }

  return (
    <div className="flex flex-col flex-1 overflow-y-auto no-scrollbar">

      {/* Header */}
      <div className="flex items-center px-5 pt-14 pb-6">
        <Link href="/login" style={{ color: 'var(--text3)', padding: '4px 0' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22">
            <path d="M19 12H5m7-7-7 7 7 7"/>
          </svg>
        </Link>
        <div className="flex-1 text-center">
          <span className="font-head text-[17px]">Create account</span>
        </div>
        <div style={{ width: 22 }} />
      </div>

      <form onSubmit={handleSubmit} className="flex-1 px-6 pb-10">
        <p className="text-[13px] mb-8" style={{ color: 'var(--text3)' }}>
          Start your journey. It only takes a minute.
        </p>

        {/* Email */}
        <div className="mb-5">
          <label className="form-label">Email</label>
          <div className="relative">
            <input
              type="email"
              required
              value={email}
              onChange={e => { setEmail(e.target.value); setErrors(prev => ({ ...prev, email: '' })) }}
              placeholder="you@example.com"
              className="form-input pr-10"
              style={{ borderColor: inputBorder('email', emailOk && email !== '') }}
            />
            {emailOk && (
              <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#4ECBA0', fontSize: 16 }}>✓</div>
            )}
          </div>
          {errors.email && (
            <p className="text-[12px] mt-1.5" style={{ color: 'var(--rose)' }}>{errors.email}</p>
          )}
        </div>

        {/* Password */}
        <div className="mb-5">
          <label className="form-label">Password</label>
          <div className="relative">
            <input
              type={showPw ? 'text' : 'password'}
              required
              value={password}
              onChange={e => { setPassword(e.target.value); setErrors(prev => ({ ...prev, password: '' })) }}
              placeholder="Create a strong password"
              className="form-input pr-12"
              style={{ borderColor: errors.password ? 'var(--rose)' : 'var(--border)' }}
            />
            <button
              type="button"
              onClick={() => setShowPw(v => !v)}
              style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
            >
              <EyeIcon show={showPw} />
            </button>
          </div>
          <StrengthBar password={password} />
          {errors.password && (
            <p className="text-[12px] mt-1.5" style={{ color: 'var(--rose)' }}>{errors.password}</p>
          )}
        </div>

        {/* Confirm password */}
        <div className="mb-8">
          <label className="form-label">Confirm password</label>
          <div className="relative">
            <input
              type={showPw ? 'text' : 'password'}
              required
              value={confirm}
              onChange={e => { setConfirm(e.target.value); setErrors(prev => ({ ...prev, confirm: '' })) }}
              placeholder="Repeat your password"
              className="form-input pr-10"
              style={{ borderColor: inputBorder('confirm', confirmOk) }}
            />
            {confirmOk && (
              <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#4ECBA0', fontSize: 16 }}>✓</div>
            )}
          </div>
          {errors.confirm && (
            <p className="text-[12px] mt-1.5" style={{ color: 'var(--rose)' }}>{errors.confirm}</p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="btn-primary"
          disabled={loading}
          style={{ opacity: loading ? 0.7 : 1 }}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(11,11,20,0.3)', borderTopColor: '#0B0B14', animation: 'spin 0.7s linear infinite' }} />
              Creating account…
            </span>
          ) : 'Create account'}
        </button>

        <p className="text-center text-sm mt-5" style={{ color: 'var(--text3)' }}>
          Already have an account?{' '}
          <Link href="/login-email" style={{ color: 'var(--gold)', fontWeight: 600 }}>Log in</Link>
        </p>
      </form>
    </div>
  )
}
