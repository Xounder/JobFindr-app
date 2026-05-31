/**
 * Synonym dictionary for skill matching.
 * TASK-045: Create Synonym Dictionary
 *
 * Maps related technologies and concepts to groups for similarity matching.
 */

export type SynonymGroup = {
  group: string
  terms: string[]
}

/**
 * Pre-defined synonym groups for common technology stacks.
 */
const SYNONYM_GROUPS: SynonymGroup[] = [
  { group: 'frontend', terms: ['react', 'vue', 'angular', 'svelte', 'frontend', 'front-end', 'ui', 'web'] },
  { group: 'backend', terms: ['node.js', 'express', 'django', 'flask', 'spring', 'backend', 'back-end', 'api', 'server'] },
  { group: 'css_frameworks', terms: ['tailwind', 'bootstrap', 'sass', 'less', 'css', 'styled-components', 'material ui'] },
  { group: 'databases_relational', terms: ['postgresql', 'mysql', 'mariadb', 'sqlite', 'oracle', 'sql server', 'rdbms'] },
  { group: 'databases_nosql', terms: ['mongodb', 'cassandra', 'dynamodb', 'couchdb', 'redis', 'nosql'] },
  { group: 'cloud_providers', terms: ['aws', 'azure', 'gcp', 'google cloud', 'cloud', 'cloud computing'] },
  { group: 'containers', terms: ['docker', 'kubernetes', 'k8s', 'container', 'podman', 'containerd'] },
  { group: 'ci_cd', terms: ['jenkins', 'github actions', 'gitlab ci', 'circleci', 'ci/cd', 'argocd'] },
  { group: 'message_queues', terms: ['rabbitmq', 'kafka', 'sqs', 'nats', 'pub/sub', 'message queue'] },
  { group: 'testing', terms: ['jest', 'mocha', 'cypress', 'playwright', 'pytest', 'junit', 'testing', 'tdd'] },
  { group: 'python_ecosystem', terms: ['python', 'django', 'flask', 'fastapi', 'pandas', 'numpy', 'scikit-learn'] },
  { group: 'js_ecosystem', terms: ['javascript', 'typescript', 'node.js', 'react', 'angular', 'vue'] },
  { group: 'mobile', terms: ['react native', 'flutter', 'android', 'ios', 'kotlin', 'swift', 'mobile'] },
  { group: 'data_science', terms: ['machine learning', 'data science', 'ai', 'deep learning', 'analytics', 'python'] },
  { group: 'devops', terms: ['devops', 'sre', 'terraform', 'ansible', 'chef', 'puppet', 'infrastructure'] },
  { group: 'monitoring', terms: ['prometheus', 'grafana', 'datadog', 'new relic', 'sentry', 'monitoring'] },
  { group: 'version_control', terms: ['git', 'github', 'gitlab', 'bitbucket', 'version control'] },
  { group: 'agile', terms: ['agile', 'scrum', 'kanban', 'jira', 'confluence', 'project management'] },
  { group: 'authentication', terms: ['oauth', 'jwt', 'saml', 'openid', 'auth0', 'authentication'] },
  { group: 'microservices', terms: ['microservices', 'micro-service', 'service mesh', 'istio', 'distributed systems'] },
]

class SynonymDictionary {
  private termToGroup: Map<string, SynonymGroup> = new Map()
  private groupToTerms: Map<string, string[]> = new Map()

  constructor() {
    this.buildIndex()
  }

  private buildIndex(): void {
    for (const group of SYNONYM_GROUPS) {
      this.groupToTerms.set(group.group, group.terms)
      for (const term of group.terms) {
        this.termToGroup.set(term.toLowerCase(), group)
      }
    }
  }

  /**
   * Get all synonyms for a term.
   */
  getSynonyms(term: string): string[] {
    const lower = term.toLowerCase().trim()
    const group = this.termToGroup.get(lower)
    if (!group) return [term]
    return group.terms.filter((t) => t !== lower)
  }

  /**
   * Get the synonym group name for a term.
   */
  getGroupName(term: string): string | undefined {
    const lower = term.toLowerCase().trim()
    return this.termToGroup.get(lower)?.group
  }

  /**
   * Check if two terms are synonyms (same group).
   */
  areSynonyms(termA: string, termB: string): boolean {
    const lowerA = termA.toLowerCase().trim()
    const lowerB = termB.toLowerCase().trim()
    if (lowerA === lowerB) return true
    const groupA = this.termToGroup.get(lowerA)
    const groupB = this.termToGroup.get(lowerB)
    if (!groupA || !groupB) return false
    return groupA.group === groupB.group
  }

  /**
   * Add a custom synonym group.
   */
  addGroup(group: SynonymGroup): void {
    SYNONYM_GROUPS.push(group)
    this.buildIndex()
  }

  /**
   * Expand a list of skills with their synonyms.
   */
  expandWithSynonyms(skills: string[]): string[] {
    const expanded = new Set(skills.map((s) => s.toLowerCase().trim()))
    for (const skill of skills) {
      const synonyms = this.getSynonyms(skill)
      for (const syn of synonyms) {
        expanded.add(syn.toLowerCase())
      }
    }
    return [...expanded]
  }

  /**
   * Calculate synonym overlap between two skill sets.
   */
  calculateSynonymOverlap(userSkills: string[], jobSkills: string[]): number {
    if (userSkills.length === 0 || jobSkills.length === 0) return 0

    const normalizedUser = userSkills.map((s) => s.toLowerCase().trim())
    const normalizedJob = jobSkills.map((s) => s.toLowerCase().trim())

    let matchCount = 0
    for (const userSkill of normalizedUser) {
      for (const jobSkill of normalizedJob) {
        if (userSkill === jobSkill || this.areSynonyms(userSkill, jobSkill)) {
          matchCount++
          break
        }
      }
    }

    return matchCount / Math.max(normalizedUser.length, 1)
  }
}

export const synonymDictionary = new SynonymDictionary()
