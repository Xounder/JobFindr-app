/**
 * HTML cleaner for job descriptions.
 * TASK-039: Create HTML Cleaner
 *
 * Removes unsafe and unnecessary HTML, converting to plain text.
 */

/**
 * Clean HTML string, removing tags and dangerous content.
 */
export function cleanHtml(html: string): string {
  if (!html) return ''

  let text = html
    // Remove script and style tags and their content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    // Remove comments
    .replace(/<!--[\s\S]*?-->/g, '')
    // Replace common block-level tags with line breaks
    .replace(/<\/(p|div|h[1-6]|li|tr|blockquote|section|article)>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    // Replace remaining tags with spaces
    .replace(/<[^>]+>/g, ' ')
    // Decode common HTML entities
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, ' ')
    // Normalize whitespace
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()

  return text
}

/**
 * Strip all HTML tags completely (no newline preservation).
 */
export function stripHtml(html: string): string {
  if (!html) return ''
  return cleanHtml(html)
    .replace(/\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}
