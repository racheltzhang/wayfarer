'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const supabase = createClient()

    const { error } = isSignUp
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password })

    if (error) { setError(error.message); setLoading(false); return }
    router.push('/')
    router.refresh()
  }

  return (
    <div className="flex flex-col flex-1 items-center justify-center px-6">
      {/* Logo */}
      <div className="mb-10 text-center">
        <div className="font-head text-4xl font-normal mb-2">Wayfarer</div>
        <div className="text-sm" style={{ color: 'var(--text2)' }}>Share the trips that shaped you</div>
      </div>

      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        <div>
          <label className="form-label">Email</label>
          <input
            type="email" required value={email} onChange={e => setEmail(e.target.value)}
            className="form-input" placeholder="you@example.com"
          />
        </div>
        <div>
          <label className="form-label">Password</label>
          <input
            type="password" required value={password} onChange={e => setPassword(e.target.value)}
            className="form-input" placeholder="••••••••"
          />
        </div>

        {error && (
          <p className="text-sm text-center" style={{ color: 'var(--rose)' }}>{error}</p>
        )}

        <button type="submit" className="btn-primary mt-2" disabled={loading}>
          {loading ? 'Loading…' : isSignUp ? 'Create Account' : 'Sign In'}
        </button>

        <button type="button" className="w-full text-sm text-center py-2" style={{ color: 'var(--text2)' }}
          onClick={() => setIsSignUp(v => !v)}>
          {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
        </button>
      </form>

      {/* Dev bypass */}
      <button
        className="mt-8 text-xs underline"
        style={{ color: 'var(--text3)' }}
        onClick={() => router.push('/')}
      >
        Continue without account (demo mode)
      </button>
    </div>
  )
}
