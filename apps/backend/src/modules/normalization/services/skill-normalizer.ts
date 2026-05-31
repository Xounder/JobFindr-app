/**
 * Skill normalizer - maps aliases and variants to canonical forms.
 * TASK-036: Create Skill Normalizer
 *
 * Converts various spellings and aliases (e.g., "JS", "JavaScript", "ECMAScript")
 * to a single canonical form for consistent matching.
 */

const SKILL_ALIASES: Record<string, string> = {
  // JavaScript variants
  'js': 'javascript',
  'ecmascript': 'javascript',
  'es6': 'javascript',
  'es2015': 'javascript',
  'esnext': 'javascript',
  'node': 'node.js',
  'nodejs': 'node.js',
  'node js': 'node.js',

  // TypeScript variants
  'ts': 'typescript',

  // Python variants
  'py': 'python',
  'python3': 'python',
  'python 3': 'python',

  // React variants
  'reactjs': 'react',
  'react js': 'react',
  'react.js': 'react',

  // AWS variants
  'amazon web services': 'aws',
  'amazon web service': 'aws',

  // GCP variants
  'google cloud platform': 'gcp',

  // Docker variants
  'docker ': 'docker',

  // Kubernetes variants
  'k8s': 'kubernetes',
  'kube': 'kubernetes',

  // Miscellaneous
  'c#': 'csharp',
  'csharp': 'csharp',
  'c plus plus': 'c++',
  'cpp': 'c++',
  'golang': 'go',
  'react native': 'react-native',
  'reactnative': 'react-native',
  'next': 'next.js',
  'nextjs': 'next.js',
  'nuxt': 'nuxt.js',
  'nuxtjs': 'nuxt.js',
  'postgres': 'postgresql',
  'psql': 'postgresql',
  'kafka ': 'kafka',
  'ml': 'machine learning',
  'ai/ml': 'machine learning',
}

export class SkillNormalizer {
  private aliases: Map<string, string>

  constructor(additionalAliases?: Record<string, string>) {
    this.aliases = new Map(Object.entries(SKILL_ALIASES))
    if (additionalAliases) {
      for (const [key, value] of Object.entries(additionalAliases)) {
        this.aliases.set(key.toLowerCase(), value.toLowerCase())
      }
    }
  }

  /**
   * Add a custom alias mapping.
   */
  addAlias(variant: string, canonical: string): void {
    this.aliases.set(variant.toLowerCase(), canonical.toLowerCase())
  }

  /**
   * Normalize a single skill name to its canonical form.
   * Returns the normalized skill, or the original if no alias exists.
   */
  normalize(skill: string): string {
    const lower = skill.toLowerCase().trim()
    const canonical = this.aliases.get(lower)
    return canonical ?? lower
  }

  /**
   * Normalize an array of skills.
   */
  normalizeAll(skills: string[]): string[] {
    const normalized = new Set<string>()
    for (const skill of skills) {
      normalized.add(this.normalize(skill))
    }
    return [...normalized].sort()
  }

  /**
   * Check if two skill names refer to the same canonical skill.
   */
  areSame(skillA: string, skillB: string): boolean {
    return this.normalize(skillA) === this.normalize(skillB)
  }
}

export const skillNormalizer = new SkillNormalizer()
