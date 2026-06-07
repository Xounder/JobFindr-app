import type { Plugin } from "@opencode-ai/plugin"

export const ValidateAgentPlugin: Plugin = async ({ project, client, $, directory, worktree }) => {
  return {
    "tool.execute.after": async (input) => {
      const filePath = (input as any).args?.filePath || (input as any).args?.path
      if (!filePath?.endsWith("pipeline.yaml")) return

      try {
        const content = await $`cat ${filePath}`.quiet().text()

        const frontendDone = content.includes('steps.senior-frontend.status: "completed"')
        const backendDone = content.includes('steps.senior-backend.status: "completed"')

        if (!frontendDone && !backendDone) return

        const layer = frontendDone ? "frontend" : "backend"

        await $`pnpm --filter ${layer} lint`
        await $`pnpm --filter ${layer} ${layer === "frontend" ? "build" : "typecheck"}`
      } catch (error) {
        console.error(`[validate-agent] Validation failed:`, error)
      }
    }
  }
}
