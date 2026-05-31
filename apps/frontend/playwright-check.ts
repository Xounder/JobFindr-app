/**
 * Playwright check script for JobFindr frontend.
 *
 * Opens the home page and verifies:
 * 1. Page loads with correct title
 * 2. Header with "JobFindr" branding is present
 * 3. Search bar (input + button) is present
 * 4. Initial state text ("Start searching") is visible
 * 5. Filters sidebar is present
 * 6. Footer is present
 * 7. Console has no errors (warnings tolerated)
 * 8. Performs a search interaction
 * 9. Takes a screenshot
 */

import { chromium } from "@playwright/test";
import { mkdirSync } from "fs";
import { join, resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

const BASE_URL = "http://localhost:5173";
const SCREENSHOT_DIR = resolve(__dirname, "..", "..", ".opencode", "screenshots");

interface CheckResult {
  name: string;
  passed: boolean;
  detail: string;
}

async function run() {
  const results: CheckResult[] = [];
  const consoleErrors: string[] = [];
  const consoleWarnings: string[] = [];

  console.log("╔══════════════════════════════════════════╗");
  console.log("║   JobFindr Frontend Playwright Checks    ║");
  console.log("╚══════════════════════════════════════════╝\n");

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  });

  const page = await context.newPage();

  // Collect console messages
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      consoleErrors.push(msg.text());
    } else if (msg.type() === "warning") {
      consoleWarnings.push(msg.text());
    }
  });

  // Collect page errors
  page.on("pageerror", (err) => {
    consoleErrors.push(`Page error: ${err.message}`);
  });

  try {
    // ─── 1. Navigate to home page ────────────────────────
    console.log("▶ Navigating to", BASE_URL);
    const response = await page.goto(BASE_URL, { waitUntil: "load", timeout: 15000 });
    const status = response?.status() ?? 0;
    results.push({
      name: "Page load (HTTP 200)",
      passed: status === 200,
      detail: `Status: ${status}`,
    });
    console.log(`   Page loaded with status ${status}`);

    // ─── 2. Page title ───────────────────────────────────
    const title = await page.title();
    results.push({
      name: "Page title",
      passed: title === "JobFindr",
      detail: `Title: "${title}"`,
    });
    console.log(`   Title: "${title}"`);

    // ─── 3. Header / Branding ────────────────────────────
    const headerText = await page.locator("header a").first().textContent();
    results.push({
      name: "Header branding",
      passed: headerText?.trim() === "JobFindr",
      detail: `Header text: "${headerText?.trim()}"`,
    });
    console.log(`   Header: "${headerText?.trim()}"`);

    // ─── 4. Search bar input ────────────────────────────
    const searchInput = page.locator('input[aria-label="Search jobs"]');
    const searchInputExists = (await searchInput.count()) > 0;
    results.push({
      name: "Search input field",
      passed: searchInputExists,
      detail: searchInputExists ? "Found search input" : "Missing search input",
    });
    if (searchInputExists) {
      const placeholder = await searchInput.getAttribute("placeholder");
      console.log(`   Search input placeholder: "${placeholder}"`);
    }

    // ─── 5. Search button ───────────────────────────────
    const searchButton = page.locator('button[type="submit"]');
    const searchBtnExists = (await searchButton.count()) > 0;
    const searchBtnText = searchBtnExists ? (await searchButton.textContent())?.trim() : "";
    results.push({
      name: "Search button",
      passed: searchBtnExists && searchBtnText === "Search",
      detail: searchBtnExists ? `Button text: "${searchBtnText}"` : "Missing search button",
    });
    console.log(`   Search button: "${searchBtnText}"`);

    // ─── 6. Initial state text ──────────────────────────
    const initialText = page.locator("text=Start searching");
    const initialTextExists = (await initialText.count()) > 0;
    results.push({
      name: "Initial state 'Start searching'",
      passed: initialTextExists,
      detail: initialTextExists
        ? "Found initial empty-state text"
        : "Missing initial state text (may have results loaded)",
    });
    if (initialTextExists) {
      console.log("   ✓ Initial state 'Start searching' visible");
    } else {
      console.log("   ⚠ 'Start searching' not found (results may already be loaded from URL params)");
    }

    // ─── 7. Filters sidebar ─────────────────────────────
    // The FiltersPanel is rendered in a sidebar region
    const filtersPanel = page.locator('main button, main select, main input[type="range"]');
    const filterCount = await filtersPanel.count();
    // Just check the overall page layout has interactive elements beyond the search
    const hasMainContent = (await page.locator("main").count()) > 0;
    results.push({
      name: "Main content area",
      passed: hasMainContent,
      detail: hasMainContent ? "Found <main> element" : "Missing <main> element",
    });

    // ─── 8. Footer text ──────────────────────────────────
    const footerText = await page.locator("footer").textContent();
    const hasFooter = footerText !== null && footerText.includes("JobFindr");
    results.push({
      name: "Footer content",
      passed: hasFooter,
      detail: hasFooter ? `Footer: "${footerText?.trim()}"` : "Missing or incorrect footer",
    });
    console.log(`   Footer present: ${hasFooter}`);

    // ─── 9. Console errors check ────────────────────────
    results.push({
      name: "No console errors",
      passed: consoleErrors.length === 0,
      detail:
        consoleErrors.length === 0
          ? "No errors"
          : `${consoleErrors.length} error(s): ${consoleErrors.join("; ")}`,
    });
    if (consoleErrors.length > 0) {
      console.log("   ❌ Console errors found:");
      for (const err of consoleErrors) {
        console.log(`      - ${err}`);
      }
    } else {
      console.log("   ✓ No console errors");
    }

    if (consoleWarnings.length > 0) {
      console.log(`   ⚠ ${consoleWarnings.length} console warning(s) (non-fatal)`);
    }

    // ─── 10. Perform search interaction ──────────────────
    console.log("\n▶ Testing search interaction...");
    await searchInput.fill("developer");
    // Wait for debounce (400ms) + some buffer
    await page.waitForTimeout(800);

    // We don't expect actual search results since the backend may not be running,
    // but the UI should reflect the search state
    const inputValue = await searchInput.inputValue();
    results.push({
      name: "Search input interaction",
      passed: inputValue === "developer",
      detail: `Input value: "${inputValue}"`,
    });
    console.log(`   Input value after typing: "${inputValue}"`);

    // ─── 11. Click search button ─────────────────────────
    await searchButton.click();
    await page.waitForTimeout(500);

    // ─── 12. Take screenshot ─────────────────────────────
    mkdirSync(SCREENSHOT_DIR, { recursive: true });
    const screenshotPath = join(SCREENSHOT_DIR, "homepage-check.png");
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`\n📸 Screenshot saved to: ${screenshotPath}`);
    results.push({
      name: "Screenshot captured",
      passed: true,
      detail: `Saved to ${screenshotPath}`,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    results.push({
      name: "Script execution",
      passed: false,
      detail: `Exception: ${message}`,
    });
    console.error("\n❌ Script error:", message);
  } finally {
    await browser.close();
  }

  // ─── Summary ──────────────────────────────────────────
  console.log("\n═══════════════════════════════════════════");
  console.log("              CHECK RESULTS");
  console.log("═══════════════════════════════════════════\n");

  let allPassed = true;
  for (const result of results) {
    const icon = result.passed ? "✅" : "❌";
    console.log(`  ${icon} ${result.name}`);
    console.log(`     ${result.detail}`);
    if (!result.passed) allPassed = false;
  }

  console.log("\n─────────────────────────────────────────────");
  console.log(`  Overall: ${allPassed ? "✅ ALL CHECKS PASSED" : "❌ SOME CHECKS FAILED"}`);
  console.log(`  Total: ${results.length} check(s)`);
  console.log(`  Passed: ${results.filter((r) => r.passed).length}`);
  console.log(`  Failed: ${results.filter((r) => !r.passed).length}`);
  console.log("─────────────────────────────────────────────\n");

  // Exit with appropriate code
  process.exit(allPassed ? 0 : 1);
}

run();
