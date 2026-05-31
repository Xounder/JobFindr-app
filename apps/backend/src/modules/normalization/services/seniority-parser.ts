/**
 * Seniority parser for detecting seniority levels from job descriptions.
 * TASK-040: Create Seniority Parser
 */
import type { SeniorityLevel } from '@jobfindr/types'

const SENIORITY_PATTERNS: Array<{
  level: SeniorityLevel
  patterns: RegExp[]
  weight: number
}> = [
  {
    level: 'intern',
    patterns: [
      /\bintern(?:ship)?\b/i,
      /\binternship\b/i,
      /\bstudent\b/i,
      /\bgraduate\s*(?:intern|program|trainee)?\b/i,
      /\btrainee\b/i,
    ],
    weight: 1,
  },
  {
    level: 'junior',
    patterns: [
      /\bjr\.?\b/i,
      /\bjunior?\b/i,
      /\bjunior\s*(?:developer|engineer|analyst|designer)?\b/i,
      /\bentry[- ]?level\b/i,
      /\bearly[- ]?career\b/i,
      /\bassociate\b/i,
      /\bjunior\b/i,
    ],
    weight: 1,
  },
  {
    level: 'mid',
    patterns: [
      /\bmid[- ]?level\b/i,
      /\bmid[- ]?senior\b/i,
      /\bintermediate\b/i,
      /\bmid\b/i,
    ],
    weight: 0.5,
  },
  {
    level: 'senior',
    patterns: [
      /\bsr\.?\b/i,
      /\bsenior?\b/i,
      /\bsenior\s*(?:developer|engineer|analyst|designer|architect)?\b/i,
      /\blead\s*(?:developer|engineer)?\b/i,
      /\bstaff\s*(?:engineer|developer)?\b/i,
      /\bprincipal\s*(?:engineer|developer)?\b/i,
    ],
    weight: 1,
  },
  {
    level: 'lead',
    patterns: [
      /\blead\b/i,
      /\btech\s*lead\b/i,
      /\bteam\s*lead\b/i,
      /\bengineering\s*manager\b/i,
      /\bmanager\b/i,
      /\bhead\s*of\b/i,
      /\bdirector\b/i,
    ],
    weight: 1,
  },
  {
    level: 'principal',
    patterns: [
      /\bprincipal\b/i,
      /\bfellow\b/i,
      /\bdistinguished\b/i,
      /\barchitect\b/i,
      /\bsoftware\s*architect\b/i,
      /\bsolutions\s*architect\b/i,
    ],
    weight: 1,
  },
  {
    level: 'executive',
    patterns: [
      /\bcto\b/i,
      /\bchief\b/i,
      /\bvice\s*president\b/i,
      /\bvp\s*(?:of|engineering|technology)?\b/i,
      /\bexecutive\b/i,
      /\bc-level\b/i,
      /\bc-suite\b/i,
    ],
    weight: 1,
  },
]

/**
 * Detect the seniority level from a job title and description.
 * Uses weighted scoring to determine the most likely level.
 */
export function detectSeniority(
  title: string,
  description: string
): SeniorityLevel | undefined {
  const combined = `${title} ${description}`

  const scores = new Map<SeniorityLevel, number>()

  for (const { level, patterns, weight } of SENIORITY_PATTERNS) {
    for (const pattern of patterns) {
      const matches = combined.match(pattern)
      if (matches) {
        const currentScore = scores.get(level) ?? 0
        scores.set(level, currentScore + weight * matches.length)
      }
    }
  }

  if (scores.size === 0) return undefined

  // Return the level with the highest score
  let bestLevel: SeniorityLevel | undefined
  let bestScore = 0

  for (const [level, score] of scores) {
    if (score > bestScore) {
      bestScore = score
      bestLevel = level
    }
  }

  return bestLevel
}
