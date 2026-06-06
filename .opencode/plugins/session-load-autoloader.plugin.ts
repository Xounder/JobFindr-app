import type { Plugin, Hooks } from "@opencode-ai/plugin"

export const SessionLoadAutoLoaderPlugin: Plugin = async ({ project, client, $, directory, worktree }) => {
  const hooks: Hooks = {
    "session.created": async () => {
      try {
        const sessionsDir = `${directory}/.opencode/sessions`
        // List session files, sorted by modification time (newest first)
        const lsResult = await $`ls -t ${sessionsDir}/*.tmp 2>/dev/null`.text()
        const files = lsResult.trim().split('\n').filter(Boolean)
        if (files.length === 0) {
          // No session files found
          return
        }
        const mostRecent = files[0]
        const content = await $`cat ${mostRecent}`.text()
        // Output to console so the user sees it
        console.log(`\n=== Last Session (loaded by plugin) ===\n${content}\n=== End of Last Session ===\n`)
      } catch (error) {
        // Don't break session start on error
        console.warn('Session load plugin warning:', error.message)
      }
    }
  }
  return hooks
}