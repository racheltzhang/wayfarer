'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'

// ── Apple SVG icon ─────────────────────────────────────────────
function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
      <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"/>
    </svg>
  )
}

// ── Google SVG icon ────────────────────────────────────────────
function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  )
}

// ── Background destinations carousel ──────────────────────────
const BG_IMAGES = [
  'https://picsum.photos/seed/santorini-auth/430/932',
  'https://picsum.photos/seed/kyoto-auth/430/932',
  'https://picsum.photos/seed/amalfi-auth/430/932',
]

export default function WelcomePage() {
  const router = useRouter()
  const [bgIndex] = useState(0)

  function handleSocialAuth(provider: 'apple' | 'google') {
    // In a real app: initiate OAuth flow
    // For demo: treat as new user → go to onboarding
    router.push('/onboarding')
  }

  return (
    <div className="flex flex-col flex-1 relative overflow-hidden">
      {/* ── Background image with overlay ── */}
      <div className="absolute inset-0 z-0">
        <Image
          src={BG_IMAGES[bgIndex]}
          alt="Travel destination"
          fill
          className="object-cover"
          priority
        />
        {/* Multi-layer gradient for legibility */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, rgba(11,11,20,0.2) 0%, rgba(11,11,20,0.15) 30%, rgba(11,11,20,0.75) 65%, rgba(11,11,20,0.97) 100%)',
        }} />
      </div>

      {/* ── Top wordmark ── */}
      <div className="relative z-10 pt-16 px-7">
        <div
          className="font-head text-[15px] font-normal tracking-[0.25em] uppercase"
          style={{ color: 'rgba(255,255,255,0.7)', letterSpacing: '0.3em' }}
        >
          Wayfarer
        </div>
      </div>

      {/* ── Hero text ── */}
      <div className="relative z-10 flex-1 flex flex-col justify-end px-7 pb-2">
        <h1
          className="font-head text-[38px] leading-[1.15] mb-3"
          style={{ color: '#fff', textShadow: '0 2px 20px rgba(11,11,20,0.4)' }}
        >
          Discover travel<br />differently.
        </h1>
        <p
          className="text-[15px] leading-relaxed mb-8"
          style={{ color: 'rgba(255,255,255,0.65)' }}
        >
          Curated trips. Beautiful places.<br />Real travelers.
        </p>

        {/* ── Auth buttons ── */}
        <div className="flex flex-col gap-3">

          {/* Apple */}
          <button
            onClick={() => handleSocialAuth('apple')}
            className="flex items-center justify-center gap-3 w-full rounded-[14px] py-4 text-sm font-semibold transition-all active:scale-[0.98]"
            style={{
              background: '#fff',
              color: '#0B0B14',
              boxShadow: '0 4px 24px rgba(0,0,0,0.25)',
            }}
          >
            <AppleIcon />
            Continue with Apple
          </button>

          {/* Google */}
          <button
            onClick={() => handleSocialAuth('google')}
            className="flex items-center justify-center gap-3 w-full rounded-[14px] py-4 text-sm font-semibold transition-all active:scale-[0.98]"
            style={{
              background: 'rgba(255,255,255,0.12)',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.25)',
              backdropFilter: 'blur(12px)',
            }}
          >
            <GoogleIcon />
            Continue with Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 my-1">
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.15)' }} />
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>or</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.15)' }} />
          </div>

          {/* Email sign up */}
          <Link
            href="/signup"
            className="flex items-center justify-center gap-2 w-full rounded-[14px] py-4 text-sm font-semibold transition-all active:scale-[0.98]"
            style={{
              background: 'transparent',
              color: 'rgba(255,255,255,0.75)',
              border: '1px solid rgba(255,255,255,0.18)',
            }}
          >
            Sign up with email
          </Link>

          {/* Log in link */}
          <Link
            href="/login-email"
            className="text-center py-2 text-sm transition-opacity active:opacity-60"
            style={{ color: 'rgba(255,255,255,0.45)' }}
          >
            Already have an account? <span style={{ color: 'rgba(255,255,255,0.75)', fontWeight: 600 }}>Log in</span>
          </Link>
        </div>

        {/* Demo bypass */}
        <button
          onClick={() => router.push('/')}
          style={{ width: '100%', padding: '4px 0', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.22)', fontSize: 11 }}
        >
          Demo mode — skip auth
        </button>

        {/* Legal */}
        <p className="text-center text-[10px] mt-3 mb-4 px-4 leading-relaxed" style={{ color: 'rgba(255,255,255,0.2)' }}>
          By continuing you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  )
}
