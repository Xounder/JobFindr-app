import type { FastifyInstance } from 'fastify'

const SUGGESTED_SKILLS = [
  'TypeScript', 'JavaScript', 'React', 'Node.js', 'Python',
  'AWS', 'Docker', 'Kubernetes', 'Go', 'Java',
  'SQL', 'PostgreSQL', 'MongoDB', 'Redis', 'GraphQL',
  'CSS', 'HTML', 'Vue.js', 'Angular', 'Next.js',
  'Rust', 'C++', 'C#', '.NET', 'PHP',
  'Ruby', 'Swift', 'Kotlin', 'Flutter', 'Terraform',
  'Machine Learning', 'Data Science', 'AI', 'Deep Learning', 'NLP',
  'DevOps', 'CI/CD', 'Git', 'Linux', 'Agile',
  'Microservices', 'REST API', 'gRPC', 'RabbitMQ', 'Kafka',
  'Figma', 'UX Research', 'Product Management', 'A/B Testing', 'Analytics',
]

const SUGGESTED_COMPANIES = [
  'Google', 'Microsoft', 'Amazon', 'Meta', 'Apple',
  'Netflix', 'Spotify', 'Stripe', 'Shopify', 'Twitter',
  'Nubank', 'iFood', 'Mercado Libre', 'Stone', 'PagSeguro',
  'QuintoAndar', 'VTEX', 'Loft', 'Creditas', 'Conductor',
  'Airbnb', 'Uber', 'Square', 'Twilio', 'Slack',
  'Dropbox', 'Pinterest', 'Coinbase', 'Robinhood', 'Palantir',
  'JPMorgan Chase', 'Goldman Sachs', 'Morgan Stanley', 'Bank of America',
  'Wells Fargo', 'Citigroup', 'Accenture', 'Deloitte', 'PwC', 'IBM',
]

async function suggestionsHandler() {
  return {
    skills: SUGGESTED_SKILLS,
    companies: SUGGESTED_COMPANIES,
  }
}

export function registerSuggestionsRoute(app: FastifyInstance): void {
  app.get('/jobs/suggestions', suggestionsHandler)
}
