/**
 * HTML parsing layer using Cheerio.
 * TASK-027: Create HTML Parsing Layer
 */
import * as cheerio from 'cheerio'
import type { CheerioAPI } from 'cheerio'

export type ParsedDocument = {
  $: CheerioAPI
  title: string
  text: string
  links: string[]
  meta: Record<string, string>
}

/**
 * Parse HTML string into a structured document.
 */
export function parseHtml(html: string): ParsedDocument {
  const $ = cheerio.load(html)

  const title = $('title').text().trim()
  const text = $('body').text().replace(/\s+/g, ' ').trim()

  const links: string[] = []
  $('a[href]').each((_i, el) => {
    const href = $(el).attr('href')
    if (href && !href.startsWith('#') && !href.startsWith('javascript:')) {
      links.push(href)
    }
  })

  const meta: Record<string, string> = {}
  $('meta').each((_i, el) => {
    const name = $(el).attr('name') ?? $(el).attr('property') ?? ''
    const content = $(el).attr('content') ?? ''
    if (name && content) {
      meta[name.toLowerCase()] = content
    }
  })

  return { $, title, text, links, meta }
}

/**
 * Extract JSON-LD structured data from HTML.
 */
export function extractJsonLd($: CheerioAPI): Record<string, unknown>[] {
  const results: Record<string, unknown>[] = []
  $('script[type="application/ld+json"]').each((_i, el) => {
    const content = $(el).html()
    if (content) {
      try {
        const parsed = JSON.parse(content)
        results.push(parsed)
      } catch {
        // Skip invalid JSON-LD
      }
    }
  })
  return results
}

/**
 * Extract microdata from HTML.
 */
export function extractMicrodata(
  $: CheerioAPI,
  itemType: string
): Record<string, string>[] {
  const results: Record<string, string>[] = []
  $(`[itemtype="${itemType}"]`).each((_i, el) => {
    const item: Record<string, string> = {}
    $(el)
      .find('[itemprop]')
      .each((_j, prop) => {
        const name = $(prop).attr('itemprop') ?? ''
        const content =
          $(prop).attr('content') ?? $(prop).text().trim()
        if (name && content) {
          item[name] = content
        }
      })
    results.push(item)
  })
  return results
}
