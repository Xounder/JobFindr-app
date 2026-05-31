/**
 * Remote work mode detection system.
 * TASK-041: Create Remote Detection System
 */
import type { RemoteMode } from '@jobfindr/types'

const REMOTE_PATTERNS: Array<{ mode: RemoteMode; patterns: RegExp[] }> = [
  {
    mode: 'remote',
    patterns: [
      /\bremote\b/i,
      /\bwork\s*from\s*home\b/i,
      /\bwfh\b/i,
      /\bfully\s*remote\b/i,
      /\b100%\s*remote\b/i,
      /\bremote[- ]?(?:first|friendly|ok|only|position|job|work)\b/i,
      /\b(?:work|job)\s*(?:from\s*)?home\b/i,
      /\bvirtual\b/i,
      /\btelecommute\b/i,
      /\btelework\b/i,
      /\bdistributed\s*(?:team|work|company)\b/i,
      /\banywhere\b/i,
      /\bworldwide\b/i,
      /\bglobal\s*(?:team|remote|role)\b/i,
    ],
  },
  {
    mode: 'hybrid',
    patterns: [
      /\bhybrid\b/i,
      /\bhybrid[- ]?(?:remote|work|model|schedule|role)\b/i,
      /\bflexible\s*(?:remote|work\s*arrangement|working)\b/i,
      /\b(?:few|several|some|2|3)\s*days?\s*(?:a\s*week|per\s*week|weekly)\s*(?:in\s*office|office|on[- ]?site)\b/i,
      /\bin[- ]?office\s*(?:and|&)\s*remote\b/i,
      /\bpartial\s*remote\b/i,
      /\bblended\b/i,
    ],
  },
  {
    mode: 'on-site',
    patterns: [
      /\bon[- ]?site\b/i,
      /\bonsite\b/i,
      /\bin[- ]?office\b/i,
      /\boffice[- ]?based\b/i,
      /\b(?:work|located|based)\s*(?:from|at|in)\s*office\b/i,
      /\bno\s*remote\b/i,
      /\bnot\s*remote\b/i,
      /\blocation[- ]?based\b/i,
    ],
  },
]

/**
 * Detect the remote mode from job title, description, and location.
 */
export function detectRemoteMode(
  title: string,
  description: string,
  location?: string
): RemoteMode {
  const combined = `${title} ${description} ${location ?? ''}`

  // Score each mode
  const scores = new Map<RemoteMode, number>()

  for (const { mode, patterns } of REMOTE_PATTERNS) {
    for (const pattern of patterns) {
      const matches = combined.match(pattern)
      if (matches) {
        const currentScore = scores.get(mode) ?? 0
        scores.set(mode, currentScore + matches.length)
      }
    }
  }

  if (scores.size === 0) return 'unknown'

  // Determine based on highest score, with remote taking precedence
  const remoteScore = scores.get('remote') ?? 0
  const hybridScore = scores.get('hybrid') ?? 0
  const onSiteScore = scores.get('on-site') ?? 0

  if (remoteScore > hybridScore && remoteScore > onSiteScore) return 'remote'
  if (hybridScore > remoteScore && hybridScore > onSiteScore) return 'hybrid'
  if (onSiteScore > remoteScore && onSiteScore > hybridScore) return 'on-site'

  // If scores are tied, default to hybrid if there's evidence of both
  if (remoteScore > 0 && onSiteScore > 0) return 'hybrid'
  if (remoteScore > 0) return 'remote'
  if (onSiteScore > 0) return 'on-site'

  return 'unknown'
}
