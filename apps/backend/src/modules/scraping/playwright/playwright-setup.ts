/**
 * Playwright configuration for browser automation.
 * TASK-025: Configure Playwright
 *
 * For MVP, Playwright is configured but only used when necessary (JS-heavy pages).
 * Most providers use Axios + Cheerio for simplicity.
 * Playwright is NOT installed by default - must be installed separately.
 */

export type PlaywrightConfig = {
  headless: boolean
  timeout: number
  viewport: {
    width: number
    height: number
  }
  userAgent?: string
}

const defaultConfig: PlaywrightConfig = {
  headless: true,
  timeout: 30_000,
  viewport: {
    width: 1920,
    height: 1080,
  },
}

export interface PlaywrightBrowser {
  browser: { close: () => Promise<void> }
  context: { close: () => Promise<void> }
}

/**
 * Lazy-load playwright and create a browser instance.
 * Returns null if playwright is not installed.
 * Playwright is optional - install separately with `pnpm add -w playwright`.
 */
export async function getPlaywrightBrowser(): Promise<PlaywrightBrowser | null> {
  try {
    // Dynamic import - playwright is optional, may not be installed
    // @ts-expect-error - playwright is optional
    const pw: typeof import('playwright') = await import('playwright')
    const browser = await pw.chromium.launch({
      headless: defaultConfig.headless,
      timeout: defaultConfig.timeout,
    })
    const context = await browser.newContext({
      viewport: defaultConfig.viewport,
      userAgent: defaultConfig.userAgent,
    })
    return { browser, context }
  } catch {
    return null
  }
}

export { defaultConfig as playwrightDefaultConfig }
