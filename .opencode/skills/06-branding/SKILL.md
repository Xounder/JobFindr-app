---
name: 06-branding
description: >
  Defines and maintains JobFindr's branding guidelines — color palette, typography,
  design tokens and visual identity. Should be loaded whenever the frontend agent
  modifies colors, themes, layouts or any visual element.
---

# Branding Skill — JobFindr

## When to use

Load this skill whenever:

- Creating or modifying colors, gradients or themes
- Adding/changing layout components (header, footer, navigation)
- Defining design tokens (Tailwind theme extension, CSS custom properties)
- Working with typography, icons or spacing
- Implementing dark mode or themes
- Creating new components that affect visual identity
- Modifying `index.css` or Tailwind config

## Color Analysis

### Project Context

JobFindr is a B2C **job aggregator**. The visual identity needs to convey:

| Attribute | Justification |
|-----------|---------------|
| **Trust** | Users need to trust the listed jobs and trust scores |
| **Professionalism** | Platform focused on career and real opportunities |
| **Intelligence** | Algorithmic matchmaking and ranking — the brand should feel "smart" |
| **Clarity** | Dense content (job listings, filters, scores) demands clean UI |

### Current Colors (mapped from existing components)

| Color | Current Usage | Occurrences |
|-----|-----------|-------------|
| `indigo-600` (#4F46E5) | Logo, Search button, active pagination, links, range accent | Layout, SearchBar, Pagination, FiltersPanel, TrustFilters |
| `indigo-50` (#EEF2FF) | Background de MatchSummary | MatchSummary |
| `indigo-100` (#E0E7FF) | Background de badge de match | JobCard |
| `indigo-700` (#4338CA) | Search button hover | SearchBar |
| `indigo-500` (#6366F1) | Focus ring de inputs | SearchBar |
| `indigo-800` (#3730A3) | Texto do badge de match | JobCard |
| `gray-50` (#F9FAFB) / `white` | Cards, Header, Footer | General |
| `gray-100` (#F3F4F6) | Background de skills tags | JobCard |
| `gray-200` (#E5E7EB) | Bordas de cards, divisores | Layout, FiltersPanel, JobCard, Pagination |
| `gray-300` (#D1D5DB) | Borda de inputs | SearchBar |
| `gray-400` (#9CA3AF) | Footer text, placeholder, low emphasis | Layout, SearchBar, HomePage |
| `gray-500` (#6B7280) | Secondary text (location, meta) | JobCard, Pagination, HomePage |
| `gray-600` (#4B5563) | Company name, Previous/Next button | JobCard, Pagination |
| `gray-700` (#374151) | Labels, salary text | TrustFilters, JobCard |
| `gray-900` (#111827) | Headings, job title | FiltersPanel, JobCard |
| `green-100` / `green-800` | Trust badge (high) | JobCard |
| `yellow-100` / `yellow-800` | Trust badge (medium) | JobCard |
| `red-100` / `red-800` | Trust badge (low) | JobCard |
| `red-50` / `red-200` / `red-700` | Error banner | HomePage |

### Recommended Palette — "Indigo Trust"

Indigo is already the dominant color in the project and is the best choice for JobFindr:

1. **Color psychology**: Indigo conveys trust, wisdom, intelligence and professionalism
2. **Context**: Career/tech platforms (LinkedIn uses blue, Indeed uses blue, Glassdoor uses blue/green)
3. **Accessibility**: Indigo (#4F46E5) has 4.5:1+ contrast with white for large text, and 7:1+ when darkened
4. **Ecosystem**: Tailwind already supports indigo natively with good tonal variation

#### Design Tokens (Tailwind + CSS Custom Properties)

**Primary Palette**

```css
/* Primary — Indigo */
--color-primary-50:  #EEF2FF;   /* soft backgrounds */
--color-primary-100: #E0E7FF;   /* badges, tags */
--color-primary-200: #C7D2FE;   /* hover on backgrounds */
--color-primary-400: #818CF8;   /* icons, light highlights */
--color-primary-500: #6366F1;   /* focus rings */
--color-primary-600: #4F46E5;   /* main CTAs, logo, links */
--color-primary-700: #4338CA;   /* CTA hover */
--color-primary-800: #3730A3;   /* text on primary badges */
--color-primary-900: #312E81;   /* special headings */
```

**Neutral Palette**

```css
/* Neutral — Gray (Cool Gray para tom mais moderno) */
--color-neutral-50:  #F9FAFB;
--color-neutral-100: #F3F4F6;   /* skill tags */
--color-neutral-200: #E5E7EB;   /* bordas, divisores */
--color-neutral-300: #D1D5DB;   /* bordas de input */
--color-neutral-400: #9CA3AF;   /* placeholder, footer, low emphasis */
--color-neutral-500: #6B7280;   /* secondary text */
--color-neutral-600: #4B5563;   /* secondary body text */
--color-neutral-700: #374151;   /* labels, salary */
--color-neutral-800: #1F2937;   /* body text principal */
--color-neutral-900: #111827;   /* headings */
```

**Semantic Palette**

```css
/* Success — High Trust */
--color-success-bg:    #D1FAE5;   /* green-100 */
--color-success-text:  #065F46;   /* green-800 */
--color-success-border:#A7F3D0;   /* green-200 */

/* Warning — Medium Trust */
--color-warning-bg:    #FEF3C7;   /* yellow-100 */
--color-warning-text:  #92400E;   /* yellow-800 */
--color-warning-border:#FDE68A;   /* yellow-200 */

/* Error — Low Trust + error banner */
--color-error-bg:      #FEE2E2;   /* red-100 / red-50 */
--color-error-text:    #991B1B;   /* red-800 / red-700 */
--color-error-border:  #FECACA;   /* red-200 */
```

### Usage Rules

1. **Always use `primary` (indigo) for CTAs and links** — never use gray for primary actions
2. **Never use pure primary for large backgrounds** — use `primary-50` or `primary-100` at most
3. **Keep neutrals cool (cool gray)** — avoid warm tones in neutral (no brown/beige)
4. **Trust score badges** follow a fixed rule:
   - >= 80: `success-bg` + `success-text`
   - >= 50: `warning-bg` + `warning-text`
   - < 50: `error-bg` + `error-text`
5. **Card borders** follow `neutral-200` with `shadow-sm`
6. **Focus rings** always `primary-500` with `ring-1` or `ring-2`
7. **Decorative icons** use `neutral-400` (never solid black)

### Tipografia

- **Font family**: Tailwind default system stack (`-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`)
- **Headings**: `text-base font-semibold` (job title), `text-sm font-semibold` (filter titles), `text-lg font-medium` (initial state)
- **Body**: `text-sm` (default), `text-xs` (metadata, badges, footer)
- **Links**: `text-sm text-primary-600 hover:text-primary-800`

### Spacing & Layout

- **Max width**: `max-w-7xl` (1280px)
- **Card padding**: `p-4`
- **Gap entre cards**: `space-y-4` ou `gap-4`
- **Grid**: `grid-cols-1 lg:grid-cols-4` (sidebar 1, results 3)
- **Header/Footer padding**: `px-4 sm:px-6 lg:px-8`

### Shadow System

- **Cards**: `shadow-sm` (default), `hover:shadow-md` (interaction)
- **Modals/Dropdowns** (future): `shadow-lg`
- **Never** use `shadow-xl`, `shadow-2xl` in MVP — keeps UI clean

### Dark Mode (roadmap)

When implementing dark mode:
- `neutral-50` → `neutral-900` (bg swap)
- `neutral-900` → `neutral-50` (text swap)
- `neutral-200` → `neutral-700` (borders)
- `white` → `neutral-800` (card bg)
- `primary-600` → `primary-400` (CTAs in dark)
- Semantic colors maintain hue but adjust luminance
