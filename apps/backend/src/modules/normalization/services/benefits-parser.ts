/**
 * Benefits parser for extracting benefits from job descriptions.
 * TASK-038: Create Benefits Parser
 */

const BENEFIT_PATTERNS = [
  /health\s*(?:insurance|care|coverage|plan)/gi,
  /dental\s*(?:insurance|coverage|plan)/gi,
  /vision\s*(?:insurance|coverage|plan)/gi,
  /life\s*insurance/gi,
  /401k|401\(k\)|retirement\s*(?:plan|savings|contribution|matching|match)/gi,
  /paid\s*(?:time\s*off|vacation|leave|sick\s*leave|holiday|pto)/gi,
  /unlimited\s*(?:pto|vacation|time\s*off)/gi,
  /stock\s*(?:options|grants|awards|equity|rsu)/gi,
  /bonus|signing\s*bonus|performance\s*bonus|annual\s*bonus/gi,
  /remote\s*(?:work|job|position|opportunity|option|first|friendly)/gi,
  /flexible\s*(?:hours|schedule|work|time|working)/gi,
  /gym\s*(?:membership|pass|reimbursement|benefit)/gi,
  /tuition\s*(?:reimbursement|assistance|aid|support)/gi,
  /professional\s*(?:development|growth|training)/gi,
  /conference\s*(?:budget|allowance|stipend)/gi,
  /free\s*(?:lunch|meals|snacks|food|coffee)/gi,
  /parental\s*(?:leave|time\s*off|benefit)/gi,
  /maternity\s*leave/gi,
  /paternity\s*leave/gi,
  /sabbatical/gi,
  /commuter\s*(?:benefits|assistance|pass)/gi,
  /parking/gi,
  /relocation\s*(?:assistance|support|package|reimbursement)/gi,
  /equity/gi,
  /profit\s*sharing/gi,
  /wellness\s*(?:program|benefit|stipend|allowance)/gi,
  /mental\s*health/gi,
  /employee\s*(?:assistance|discount|resource|program)/gi,
  /home\s*office\s*(?:budget|stipend|allowance)/gi,
  /internet\s*(?:reimbursement|allowance|stipend)/gi,
  /phone\s*(?:reimbursement|allowance|stipend)/gi,
]

/**
 * Extract benefits from a job description text.
 */
export function parseBenefits(text: string): string[] {
  if (!text) return []

  const benefits = new Set<string>()

  for (const pattern of BENEFIT_PATTERNS) {
    const matches = text.matchAll(pattern)
    for (const match of matches) {
      const benefit = match[0]?.trim()
      if (benefit) {
        // Normalize benefit name
        const normalized = benefit.charAt(0).toUpperCase() + benefit.slice(1).toLowerCase()
        benefits.add(normalized)
      }
    }
  }

  return [...benefits].sort()
}
