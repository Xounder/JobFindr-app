/**
 * User skill parser - processes user skill input.
 * TASK-042: Create User Skill Parser
 */
import { skillNormalizer } from '../../normalization/services/skill-normalizer.ts'

export type ParsedUserSkills = {
  raw: string[]
  normalized: string[]
  expanded: string[]
}

/**
 * Parse user-provided skill input.
 * Accepts comma-separated strings and arrays.
 */
export function parseUserSkills(input: string | string[]): ParsedUserSkills {
  const raw: string[] = []

  if (Array.isArray(input)) {
    for (const item of input) {
      if (typeof item === 'string') {
        raw.push(...item.split(',').map((s) => s.trim()).filter(Boolean))
      }
    }
  } else if (typeof input === 'string') {
    raw.push(...input.split(',').map((s) => s.trim()).filter(Boolean))
  }

  // Normalize
  const normalized = skillNormalizer.normalizeAll(raw)

  // For MVP, expanded is the same as normalized (no synonym expansion at this stage)
  const expanded = [...normalized]

  return { raw, normalized, expanded }
}
