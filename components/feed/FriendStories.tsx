'use client'

import Image from 'next/image'
import { useToast } from '@/components/ui/Toast'
import type { Profile } from '@/lib/types'

interface Props { friends: Profile[] }

const STATUS_MESSAGES: Record<string, string> = {
  'u1': '📍 Maya is in Kyoto right now!',
  'u2': '✈️ James just posted from Amalfi',
  'u3': '🗺️ Sofia is planning Morocco',
  'u4': '🏖️ Alex just got back from Bali',
}

export default function FriendStories({ friends }: Props) {
  const { showToast } = useToast()

  return (
    <div className="flex gap-3.5 px-5 pb-5 overflow-x-auto no-scrollbar flex-shrink-0">
      {friends.map((f, i) => (
        <button
          key={f.id}
          className="flex flex-col items-center gap-1.5 flex-shrink-0"
          onClick={() => showToast(STATUS_MESSAGES[f.id] ?? `👤 ${f.full_name}`)}
        >
          <div className="relative w-[52px] h-[52px]">
            {/* Gold ring for first 3 */}
            {i < 3 && (
              <div
                className="absolute inset-[-2px] rounded-full"
                style={{ border: '2px solid var(--gold)' }}
              />
            )}
            {f.avatar_url ? (
              <Image src={f.avatar_url} alt={f.full_name} width={52} height={52}
                className="rounded-full object-cover w-full h-full" />
            ) : (
              <div className="w-full h-full rounded-full flex items-center justify-center text-lg"
                style={{ background: 'var(--bg3)' }}>
                {f.full_name[0]}
              </div>
            )}
          </div>
          <span className="text-[11px]" style={{ color: 'var(--text2)' }}>
            {f.full_name.split(' ')[0]}
          </span>
        </button>
      ))}
    </div>
  )
}
