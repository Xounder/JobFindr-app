/**
 * Salary-based ranking factor.
 * TASK-060: Create Salary Ranking
 *
 * Uses salary data to influence ranking.
 * Higher salaries get a boost (but not too much - avoids pay-to-rank appearance).
 */
import type { NormalizedJob, RankingWeights } from '@jobfindr/types'
import { salaryToYearly } from '../../normalization/services/salary-parser.ts'

// Reasonable salary range for normalization
const MIN_SALARY = 20_000 // Below this, likely not a salary field
const MAX_SALARY = 500_000 // Above this, likely executive or inaccurate

/**
 * Compute salary score contribution (0-100).
 * Jobs without salary data get a neutral score.
 */
export function computeSalaryScore(
  job: NormalizedJob,
  weights: RankingWeights
): number {
  if (!job.salary) return weights.salary * 50 // Neutral for no salary data

  const yearly = salaryToYearly(job.salary)

  // Normalize salary to 0-100 scale
  if (yearly <= MIN_SALARY) return 0
  if (yearly >= MAX_SALARY) return weights.salary * 100

  // Logarithmic scale to prevent extreme salaries from dominating
  const normalized =
    (Math.log(yearly - MIN_SALARY + 1) / Math.log(MAX_SALARY - MIN_SALARY + 1)) *
    100

  return normalized * weights.salary
}
