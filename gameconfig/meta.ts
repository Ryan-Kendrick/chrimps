// Version number based on semantic versioning https://semver.org/
export const METADATA_CONFIG = {
  version: "v0.7.2",
  softcap: "Zone 40",
  chatServerUrl:
    process.env.NODE_ENV === "production"
      ? "https://slimechat-cnd5hfafbue9gcap.australiaeast-01.azurewebsites.net/chathub"
      : "http://localhost:5000/chathub",
} as const

export type AnimationPreference = 0 | 1 | 2

export const PERFORMANCE_CONFIG = {
  animPrefGameSpeedMod: {
    0: 4,
    1: 2,
    2: 1,
  } as Record<AnimationPreference, number>,
  catchup: {
    shortBreakpoint: 300000, // 5 minutes
    longBreakpoint: 1800000, // 30 minutes
    chunkSize: 120000, // 120 seconds
  },
  autoSave: 30000, // Autosave every 30 seconds

  bpm: 89,

  critDisplayLimit: 10,
  fadeoutDuration: 2500, // Crit fadeout effect duration
} as const
