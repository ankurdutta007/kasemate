import { useNavigate } from 'react-router-dom'
import { formatRelativeDate } from '../data/cases'
import img12 from '@/imports/image-12.webp'
import img13 from '@/imports/image-13.webp'
import img14 from '@/imports/image-14.webp'
import { getScoreColor } from '../lib/utils'

const FEMALE_AVATARS = [img12, img14]
const MALE_AVATARS = [img13]

function avatarFor(name: string): string {
  const female = ['Priya', 'Sneha', 'Ananya', 'Neha', 'Riya', 'Pooja', 'Divya', 'Meera']
  const firstName = name ? name.split(' ')[0] : 'Arjun'
  if (female.includes(firstName)) return FEMALE_AVATARS[firstName.length % FEMALE_AVATARS.length]
  return MALE_AVATARS[firstName.length % MALE_AVATARS.length]
}

export function ScoreRing({ score, size = 38 }: { score: number; size?: number }) {
  const r = size * 0.37
  const circ = 2 * Math.PI * r
  const color = getScoreColor(score)
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--border-strong)" strokeWidth={size * 0.075} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={size * 0.075}
          strokeDasharray={`${(score / 100) * circ} ${circ}`} strokeLinecap="round" />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: size * 0.28, fontWeight: 700, color: color, lineHeight: 1 }}>{Math.round(score)}</span>
      </div>
    </div>
  )
}

export function HistoryItem({ item, isLast }: { item: any, isLast?: boolean }) {
  const navigate = useNavigate()
  const shortSubtype = item.subtype?.split(/[-/]/)[0].trim() || ''
  const tc = item.track === 'consulting' 
    ? { c: 'var(--violet)', bg: 'rgba(124,58,237,0.1)' }
    : { c: 'var(--blue)', bg: 'rgba(59,130,246,0.1)' }

  return (
    <div onClick={() => navigate('/feedback', { state: { historyItem: item } })}
      style={{ 
        padding: '12px 14px', 
        display: 'flex', 
        alignItems: 'center', 
        gap: 12, 
        borderBottom: isLast ? 'none' : '1px solid var(--border)', 
        cursor: 'pointer', 
        backgroundColor: 'transparent',
        transition: 'background-color 0.15s' 
      }}
      onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg3)'}
      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
    >
      <div style={{ width: 40, height: 40, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, border: '1.5px solid var(--border)' }}>
        <img src={avatarFor(item.name)} alt={item.name || 'User'} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 4 }}>
          {item.title}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ 
            padding: '2px 6px', 
            borderRadius: 4, 
            backgroundColor: tc.bg, 
            color: tc.c,
            fontSize: 10, 
            fontWeight: 700,
            whiteSpace: 'nowrap'
          }}>
            {shortSubtype}
          </span>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
            · {formatRelativeDate(item.date)}
          </span>
        </div>
      </div>
      <ScoreRing score={item.score} size={36} />
    </div>
  )
}
