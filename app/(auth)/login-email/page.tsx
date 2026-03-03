'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

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

export default function LoginEmailPage() {
  const router = useRouter()
  const [email,   setEmail]   = useState('')
  const [password, setPassword] = useState('')
  const [showPw,  setShowPw]  = useState(false)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    await new Promise(r => setTimeout(r, 800))
    setLoading(false)
    // Demo: any valid-looking creds succeed → go to feed
    if (email && password.length >= 6) {
      router.push('/')
    } else {
      setError('Incorrect email or password. Please try again.')
    }
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
          <span className="font-head text-[17px]">Welcome back</span>
        </div>
        <div style={{ width: 22 }} />
      </div>

      <form onSubmit={handleSubmit} className="flex-1 px-6 pb-10">
        <p className="text-[13px] mb-8" style={{ color: 'var(--text3)' }}>
          Log in to continue your journey.
        </p>

        {/* Email */}
        <div className="mb-4">
          <label className="form-label">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={e => { setEmail(e.target.value); setError(null) }}
            placeholder="you@example.com"
            className="form-input"
          />
        </div>

        {/* Password */}
        <div className="mb-2">
          <label className="form-label">Password</label>
          <div className="relative">
            <input
              type={showPw ? 'text' : 'password'}
              required
              value={password}
              onChange={e => { setPassword(e.target.value); setError(null) }}
              placeholder="••••••••"
              className="form-input pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPw(v => !v)}
              style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
            >
              <EyeIcon show={showPw} />
            </button>
          </div>
        </div>

        {/* Forgot password */}
        <div className="flex justify-end mb-8">
          <button
            type="button"
            className="text-[12px] font-medium"
            style={{ color: 'var(--gold)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0' }}
          >
            Forgot password?
          </button>
        </div>

        {/* Error */}
        {error && (
          <div
            className="flex items-center gap-2.5 p-3.5 rounded-[10px] mb-5 text-[13px]"
            style={{ background: 'rgba(232,88,58,0.1)', border: '1px solid rgba(232,88,58,0.25)', color: 'var(--rose)' }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16" style={{ flexShrink: 0 }}>
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {error}
          </div>
        )}

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
              Logging in…
            </span>
          ) : 'Log in'}
        </button>

        <p className="text-center text-sm mt-5" style={{ color: 'var(--text3)' }}>
          New to Wayfarer?{' '}
          <Link href="/signup" style={{ color: 'var(--gold)', fontWeight: 600 }}>Create account</Link>
        </p>
      </form>
    </div>
  )
}
