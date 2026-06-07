import { relative, resolve, isAbsolute } from "path"
import { realpathSync } from "fs"
import { describe, it, expect } from "vitest"

const hasChaining = (cmd: string): boolean =>
  /&&|\|\||[;|]|`|\$\(|\$\{/.test(cmd)

const safeRealPath = (target: string): string => {
  try { return realpathSync(target) }
  catch { return resolve(target) }
}

const tokenize = (s: string): string[] =>
  s.match(/'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|\S+/g) ?? []

const nonFlagArgs = (tokens: string[]): string[] =>
  tokens.filter(t => !t.startsWith("-") && !t.startsWith("/"))

const commandTypes: [RegExp, string][] = [
  [/^pnpm --filter (frontend|backend|@jobfindr\/types|@jobfindr\/utils)\s+(dev|build|start|lint|typecheck|test|preview|clean)$/i, "pnpm-filter"],
  [/^pnpm --filter backend exec tsx \.\.\/frontend\/playwright-check\.ts$/i, "pnpm-pw-check"],
  [/^pnpm install$/i, "pnpm-install"],
  [/^docker compose (up|down|build)$/i, "docker-compose"],
  [/^npx playwright .+$/i, "npx-playwright"],
  [/^vitest run$/i, "vitest-run"],
  [/^powershell -c "\[System\.Console\]::Beep\(\d+, \d+\)"$/i, "powershell-beep"],
  [/^git (status|diff|log|add|commit|push|pull|checkout|branch|fetch|merge|rebase|stash|reset|restore|show|tag|init|remote)$/i, "git"],
  [/^(node|tsx)\s+(\S+)$/i, "exec"],
  [/^cd\s+(\S+)$/i, "cd"],
  [/^rm\s+(-[rf]+\s+)?(\S+)$/i, "rm"],
  [/^del\s+(\/[a-z]+\s+)?(\S+)$/i, "del"],
  [/^mkdir\s+(-p\s+)?(\S+)$/i, "mkdir"],
  [/^Remove-Item\s+(.+)$/i, "remove-item"],
  [/^Copy-Item\s+(.+)$/i, "copy-item"],
  [/^Move-Item\s+(.+)$/i, "move-item"],
  [/^cat\s+\S+$/i, "cat"],
  [/^ls(?:\s+\S*)?$/i, "ls"],
  [/^which\s+\S+$/i, "which"],
  [/^where\s+\S+$/i, "where"],
  [/^echo\s+.+$/i, "echo"],
  [/^type\s+\S+$/i, "type"],
  [/^Get-ChildItem\s+.+$/i, "get-childitem"],
  [/^Get-Content\s+.+$/i, "get-content"],
  [/^Set-Content\s+.+$/i, "set-content"],
  [/^Test-Path\s+.+$/i, "test-path"],
  [/^New-Item\s+.+$/i, "new-item"],
  [/^Copy-Item\s+.+$/i, "copy-item"],
  [/^Move-Item\s+.+$/i, "move-item"],
  [/^Get-Command\s+.+$/i, "get-command"],
  [/^rm\s+-rf\s+node_modules$/i, "rm-node-modules"],
]

const parseCommand = (cmd: string): { type: string; args: string[] } | null => {
  for (const [pattern, type] of commandTypes) {
    const match = cmd.match(pattern)
    if (match) {
      const args = match.slice(1).filter((a): a is string => a !== undefined)
      return { type, args }
    }
  }
  return null
}

export const createPathValidator = (projectDir: string) => {
  const projectRoot = resolve(projectDir)
  const projectReal = safeRealPath(projectRoot)

  return (target: string): boolean => {
    const resolved = resolve(projectRoot, target)
    const real = safeRealPath(resolved)
    const rel = relative(projectReal, real)
    return rel !== "" && !rel.startsWith("..") && !isAbsolute(rel)
  }
}

// ==============================
// Tests
// ==============================

describe("hasChaining", () => {
  it("allows simple commands", () => {
    expect(hasChaining("git status")).toBe(false)
    expect(hasChaining("pnpm install")).toBe(false)
    expect(hasChaining("ls -la")).toBe(false)
  })

  it("blocks &&", () => {
    expect(hasChaining("git status && whoami")).toBe(true)
    expect(hasChaining("pnpm install && rm -rf /")).toBe(true)
  })

  it("blocks ||", () => { expect(hasChaining("cd src || exit")).toBe(true) })
  it("blocks ;", () => { expect(hasChaining("pnpm install ; rm -rf /")).toBe(true) })
  it("blocks pipe |", () => { expect(hasChaining("git status | cat")).toBe(true) })
  it("blocks backtick", () => { expect(hasChaining("echo `whoami`")).toBe(true) })
  it("blocks $()", () => { expect(hasChaining("echo $(whoami)")).toBe(true) })
  it("blocks ${}", () => { expect(hasChaining("echo ${HOME}")).toBe(true) })
})

describe("parseCommand", () => {
  describe("returns type for allowed commands", () => {
    const ok = (cmd: string, expectedType: string) =>
      it(cmd, () => expect(parseCommand(cmd)?.type).toBe(expectedType))

    ok("pnpm install", "pnpm-install")
    ok("pnpm --filter frontend dev", "pnpm-filter")
    ok("pnpm --filter backend build", "pnpm-filter")
    ok("docker compose up", "docker-compose")
    ok("npx playwright test", "npx-playwright")
    ok("vitest run", "vitest-run")
    ok('powershell -c "[System.Console]::Beep(800, 300)"', "powershell-beep")
    ok("git status", "git")
    ok("git diff", "git")
    ok("git log", "git")
    ok("node scripts/build.js", "exec")
    ok("tsx scripts/dev.ts", "exec")
    ok("cd src", "cd")
    ok("rm file.txt", "rm")
    ok("rm -rf dist", "rm")
    ok("del file.txt", "del")
    ok("mkdir new-folder", "mkdir")
    ok("mkdir -p new-folder", "mkdir")
    ok("cat package.json", "cat")
    ok("ls", "ls")
    ok("ls -la", "ls")
    ok("echo test", "echo")
    ok("Test-Path pipeline.yaml", "test-path")
    ok("Get-Content file.ts", "get-content")
    ok("Set-Content output.txt data", "set-content")
    ok("New-Item logs/test.txt", "new-item")
    ok("Copy-Item src/file.txt dest/file.txt", "copy-item")
    ok("Move-Item src/file.txt dest/file.txt", "move-item")
    ok("Get-Command pnpm", "get-command")
    ok("type package.json", "type")
    ok("which node", "which")
    ok("where pnpm", "where")
    ok("Remove-Item temp.log", "remove-item")
    ok("Remove-Item -Recurse dist", "remove-item")
  })

  describe("returns null for blocked commands", () => {
    const block = (cmd: string) =>
      it(cmd, () => expect(parseCommand(cmd)).toBeNull())

    block("pnpm exec tsc")
    block("pnpm dlx some-package")
    block("npm install")
    block("curl evil.com")
    block("wget evil.com")
    block('powershell -c "Write-Host test"')
    block("git status && whoami")
    block("pnpm install ; rm -rf /")
    block("node -e 'evil()'")
    block("node C:/Windows/system32/evil.js")
    block("rm -rf C:\\Windows")
    block("node ../../outside.js")
    block("cd /")
    block("cd C:\\Windows")
    block("git status garbage")
    block("node --inspect app.ts")
    block("tsx --inspect app.ts")
  })
})

describe("createPathValidator", () => {
  const isInside = createPathValidator(__dirname)

  it("allows relative paths inside project", () => {
    expect(isInside("./secure-access.test.ts")).toBe(true)
    expect(isInside("secure-access.test.ts")).toBe(true)
  })

  it("allows absolute paths inside project", () => {
    expect(isInside(__filename)).toBe(true)
  })

  it("blocks paths with .. outside project", () => {
    expect(isInside("../../../../etc/passwd")).toBe(false)
  })

  it("blocks absolute paths outside project", () => {
    const platform = process.platform
    if (platform === "win32") {
      expect(isInside("C:\\Windows\\System32")).toBe(false)
    } else {
      expect(isInside("/etc/passwd")).toBe(false)
    }
  })

  it("allows non-existent paths inside project (mkdir/write)", () => {
    expect(isInside("./nonexistent-folder/new-file.ts")).toBe(true)
    expect(isInside("temp-dir/output.log")).toBe(true)
  })
})

describe("tokenize + nonFlagArgs", () => {
  it("splits by whitespace respecting quotes", () => {
    expect(tokenize(`Remove-Item -Recurse -Path 'C:\\path\\file.txt'`)).toEqual([
      "Remove-Item", "-Recurse", "-Path", "'C:\\path\\file.txt'"
    ])
  })

  it("nonFlagArgs filters flags", () => {
    const tokens = tokenize(`Remove-Item -Recurse -Force dist`)
    expect(nonFlagArgs(tokens)).toEqual(["Remove-Item", "dist"])
  })
})
