/**
 * Hidden companies configuration.
 * TASK-051: Create Hidden Companies Config
 *
 * Default list of companies that are hidden by default.
 * This is a static list for MVP; could be dynamic in production.
 */

// Companies that should be hidden by default due to low trust scores
const DEFAULT_HIDDEN_COMPANIES: string[] = [
  'unknown-company',
  'test-company',
  'example-corp',
]

// Known low-reputation companies (manual curation)
const LOW_REPUTATION_COMPANIES: string[] = [
  // This list would be populated based on community feedback / data
  // For MVP, it's intentionally minimal
]

export class HiddenCompaniesConfig {
  private hidden: Set<string>

  constructor() {
    this.hidden = new Set([
      ...DEFAULT_HIDDEN_COMPANIES,
      ...LOW_REPUTATION_COMPANIES,
    ].map((c) => c.toLowerCase()))
  }

  /**
   * Check if a company is in the hidden list.
   */
  isHidden(companyName: string): boolean {
    return this.hidden.has(companyName.toLowerCase().trim())
  }

  /**
   * Add a company to the hidden list.
   */
  addCompany(name: string): void {
    this.hidden.add(name.toLowerCase().trim())
  }

  /**
   * Remove a company from the hidden list.
   */
  removeCompany(name: string): void {
    this.hidden.delete(name.toLowerCase().trim())
  }

  /**
   * Get all hidden companies.
   */
  getAllHidden(): string[] {
    return [...this.hidden]
  }

  /**
   * Get count of hidden companies.
   */
  get count(): number {
    return this.hidden.size
  }
}

export const hiddenCompaniesConfig = new HiddenCompaniesConfig()
