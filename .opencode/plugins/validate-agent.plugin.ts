import type { Plugin, Hooks } from "@opencode-ai/plugin"

export const ValidateAgentPlugin: Plugin = async ({ project, client, $, directory, worktree }) => {
  const hooks: Hooks = {
    "file.edited": async ({ input, output }) => {
      if (!input.args.filePath.endsWith("pipeline.yaml")) return

      const content = await $`cat ${input.args.filePath}`.text()
      
      // Check for completed frontend/backend steps
      const frontendDone = content.includes('steps.senior-frontend.status: "completed"')
      const backendDone = content.includes('steps.senior-backend.status: "completed"')
      
      if (!frontendDone && !backendDone) return

      const layer = frontendDone ? "frontend" : "backend"
      
      try {
        // Run validation equivalent to the hook
        await $`pnpm --filter ${layer} lint`
        await $`pnpm --filter ${layer} ${layer === "frontend" ? "build" : "typecheck"}` as any
        // If we get here, validation passed - no need to return anything
      } catch (error) {
        // Format errors like the original hook
        const errorMsg = error?.toString() || "Validation failed"
        throw new Error(`[${layer}] VALIDATION ERRORS:\n${errorMsg}`)
      }
    }
  }

  return hooks
}