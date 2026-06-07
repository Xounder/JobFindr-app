import type { Plugin } from "@opencode-ai/plugin"
import { resolve } from "path"

export const SecureAccessPlugin: Plugin = async ({ project, client, $, directory, worktree }) => {
  const projectRoot = resolve(directory)

  const isOutsideProject = (filePath: string): boolean => {
    const resolved = resolve(projectRoot, filePath)
    return !resolved.toLowerCase().startsWith(projectRoot.toLowerCase())
  }

  const allowedBashPatterns = [
    /^pnpm install(?:\s|$)/,
    /^pnpm --filter (frontend|backend|@jobfindr\/types|@jobfindr\/utils)\s+(dev|build|start|lint|typecheck|test|preview|clean)(?:\s|$)/,
    /^pnpm --filter backend exec tsx .+/,
    /^pnpm dlx .+/,
    /^pnpm exec .+/,
    /^docker compose up(?:\s|$)/,
    /^docker compose down(?:\s|$)/,
    /^docker compose build(?:\s|$)/,
    /^git (status|diff|log|add|commit|push|pull|checkout|branch|fetch|merge|rebase|stash|reset|restore|show|tag|init|remote)(\s|$)/i,
    /^npm (install|run|test|build|lint)(\s|$)/,
    /^node (\S+\/)?\S+(\.js|\.mjs|\.cjs)?(\s|$)/,
    /^tsx .+/,
    /^npx .+/,
    /^vitest run(\s|$)/,
    /^powershell -c ".+"/,
    /^mkdir\s+-?p?\s+/,
    /^rm\s+-rf\s+node_modules/,
    /^Get-ChildItem/,
    /^Get-Content/,
    /^Set-Content/,
    /^Test-Path/,
    /^Remove-Item/,
    /^New-Item/,
    /^Copy-Item/,
    /^Move-Item/,
    /^cat\s+/,
    /^ls\s+/,
    /^which\s+/,
    /^echo\s+/,
  ]

  const isAllowedBash = (command: string): boolean => {
    return allowedBashPatterns.some(p => p.test(command))
  }

  return {
    "tool.execute.before": async (input, output) => {
      // Block file access outside project directory
      if (["read", "write", "edit", "glob", "grep"].includes(input.tool)) {
        const filePath = (output.args as any)?.filePath || (output.args as any)?.path
        if (filePath && isOutsideProject(filePath)) {
          throw new Error(
            `[secure-access] Blocked ${input.tool} outside project:\n${filePath}`
          )
        }
      }

      // Block undocumented bash commands
      if (input.tool === "bash") {
        const command = ((output.args as any)?.command || "").trim()
        if (!command) return

        if (!isAllowedBash(command)) {
          throw new Error(
            `[secure-access] Blocked undocumented command:\n${command}\n\nAllowed patterns: pnpm --filter <workspace> <script>, git <cmd>, docker compose up/down, node, tsx, npx, vitest, and basic file operations.`
          )
        }
      }
    }
  }
}
