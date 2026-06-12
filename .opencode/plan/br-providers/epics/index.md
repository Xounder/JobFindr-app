# BR Providers - Epics Index

## Context
Add Brazilian job API providers to expand job coverage in Brazil. Two providers identified as viable:

1. **Adzuna** — General job search API with free tier, covers Brazil (br), API key auth
2. **TheirStack** — 199M jobs from 195 countries, tech-focused, API key auth

## Epics

| # | Epic | Description | Layer |
|---|------|-------------|-------|
| 1 | Adzuna Provider | Implement REST API provider for Adzuna (developer.adzuna.com) | Backend |
| 2 | TheirStack Provider | Implement REST API provider for TheirStack (theirstack.com) | Backend |
| 3 | Provider Registration | Register both providers in the provider loader | Backend |
