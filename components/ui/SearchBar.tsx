'use client'

interface Props {
  placeholder?: string
  onSearch?: (q: string) => void
}

export default function SearchBar({ placeholder = 'Search…', onSearch }: Props) {
  return (
    <div
      className="mx-5 mb-5 flex items-center gap-2.5 rounded-[14px] px-4 py-3"
      style={{ background: 'var(--bg3)', border: '1px solid var(--border)' }}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16" style={{ color: 'var(--text3)', flexShrink: 0 }}>
        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
      <input
        type="text"
        placeholder={placeholder}
        className="bg-transparent border-none outline-none text-sm w-full"
        style={{ color: 'var(--text)' }}
        onChange={e => onSearch?.(e.target.value)}
      />
    </div>
  )
}
