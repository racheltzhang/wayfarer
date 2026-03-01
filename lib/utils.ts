import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatRating(rating: number | null): string {
  if (rating === null) return '—'
  return rating.toFixed(1)
}

export function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return String(n)
}

export function starsFilled(rating: number | null, scale = 10): number {
  // Maps 0–10 rating to 0–5 stars
  if (rating === null) return 0
  return Math.round((rating / scale) * 5)
}
