import type { Plugin } from "@opencode-ai/plugin"

export const SoundAlertPlugin: Plugin = async ({ project, client, $, directory, worktree }) => {
  const playSound = async (soundType: "idle" | "permission") => {
    try {
      if (process.platform === "win32") {
        const soundPath = soundType === "idle"
          ? "C:\\Windows\\Media\\Windows Notify System Generic.wav"
          : "C:\\Windows\\Media\\Windows Notify Calendar.wav"
        await $`powershell -c "(New-Object Media.SoundPlayer '${soundPath}').PlaySync()"`
      } else if (process.platform === "darwin") {
        await $`afplay /System/Library/Sounds/${soundType === "idle" ? "Glass" : "Ping"}.aiff`
      } else {
        await $`paplay /usr/share/sounds/freedesktop/stereo/${soundType === "idle" ? "complete" : "message-new-instant"}.oga 2>/dev/null || true`
      }
    } catch {
      // Silently fail if sound cannot be played
    }
  }

  const hooks = {
    "session.idle": async () => {
      await playSound("idle")
    },
    "permission.asked": async () => {
      await playSound("permission")
    }
  }

  return hooks
}