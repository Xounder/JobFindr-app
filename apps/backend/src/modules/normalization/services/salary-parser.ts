/**
 * Salary parser for extracting salary ranges from text.
 * TASK-037: Create Salary Parser
 */
import type { SalaryInfo, SalaryPeriod } from '@jobfindr/types'

// Patterns for salary extraction
const SALARY_PATTERNS = [
  // $100,000 - $150,000 per year
  /(\$[\d,]+(?:\.\d+)?)\s*(?:-|to|–)\s*(\$[\d,]+(?:\.\d+)?)\s*(?:per\s+)?(year|yr|annum|annual|yearly|month|mo|monthly|hour|hr|hourly|week|weekly)?/gi,
  // $100,000/year
  /(\$[\d,]+(?:\.\d+)?)\s*(?:\/|per)\s*(year|yr|annum|annual|yearly|month|mo|monthly|hour|hr|hourly|week|weekly)/gi,
  // $100k - $150k
  /(\$[\d.]+k?)\s*(?:-|to|–)\s*(\$[\d.]+k?)\s*(?:per\s+)?(year|yr|annum|annual|yearly|month|mo|monthly|hour|hr|hourly)?/gi,
  // $100k
  /\$(\d+)k\s*(?:-|to|–)?\s*(?:\$(\d+)k)?/gi,
  // R$ format (Brazilian)
  /R\$\s*([\d.]+(?:,\d{2})?)\s*(?:-|a|até)\s*R\$\s*([\d.]+(?:,\d{2})?)/gi,
  // EUR format
  /€\s*([\d.,]+)\s*(?:-|to|–)\s*€\s*([\d.,]+)/gi,
]

function parseSalaryValue(value: string): number {
  const cleaned = value
    .replace(/[$,€R\s]/g, '')
    .replace(/\.(?=\d{3})/g, '')
    .replace(',', '.')
  if (cleaned.endsWith('k')) {
    return Number.parseFloat(cleaned) * 1000
  }
  return Number.parseFloat(cleaned)
}

function normalizePeriod(period: string | undefined): SalaryPeriod {
  switch (period?.toLowerCase()) {
    case 'year':
    case 'yr':
    case 'annum':
    case 'annual':
    case 'yearly':
      return 'yearly'
    case 'month':
    case 'mo':
    case 'monthly':
      return 'monthly'
    case 'hour':
    case 'hr':
    case 'hourly':
      return 'hourly'
    default:
      return 'yearly'
  }
}

/**
 * Parse salary information from text.
 * Returns the first valid salary range found, or undefined.
 */
export function parseSalary(text: string): SalaryInfo | undefined {
  if (!text) return undefined

  let bestMatch: SalaryInfo | undefined

  for (const pattern of SALARY_PATTERNS) {
    const matches = text.matchAll(pattern)
    for (const match of matches) {
      const groups = match.slice(1).filter(Boolean)
      if (groups.length >= 2) {
        const min = parseSalaryValue(groups[0] ?? '0')
        const max = parseSalaryValue(groups[1] ?? '0')
        const period = normalizePeriod(groups[2])

        if (min > 0 && max > 0 && min <= max) {
          bestMatch = {
            min,
            max,
            currency: match[0]!.startsWith('R$') ? 'BRL' : match[0]!.startsWith('€') ? 'EUR' : 'USD',
            period,
          }
        }
      }
    }
  }

  return bestMatch
}

/**
 * Convert a salary to yearly for comparison purposes.
 */
export function salaryToYearly(salary: SalaryInfo): number {
  const avg = (salary.min + salary.max) / 2
  switch (salary.period) {
    case 'monthly':
      return avg * 12
    case 'hourly':
      return avg * 2080 // 40h * 52 weeks
    default:
      return avg
  }
}
