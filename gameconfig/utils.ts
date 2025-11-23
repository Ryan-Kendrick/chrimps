//@ts-nocheck

import { RootState } from "../redux/store"
import { initialState, initialState as initPlayerState } from "../redux/playerSlice"
import { initialState as initStatsState } from "../redux/statsSlice"
import { initialState as initialMetaState } from "../redux/metaSlice"
import * as LZString from "lz-string"
import { METADATA_CONFIG, PERFORMANCE_CONFIG } from "./meta"
import { PrestigeUpgrade, PrestigeUpgradeId } from "../models/upgrades"

export function serialize(classInstance) {
  if (classInstance == null || typeof classInstance !== "object") return classInstance

  if (Array.isArray(classInstance)) return classInstance.map(serialize)

  const serialized = {}

  for (const key of Object.keys(classInstance)) {
    serialized[key] = serialize(classInstance[key])
  }

  return serialized
}

export function formatSmallNumber(num: number): string {
  num = Math.round(num)

  const tiers = [
    { threshold: 1e15, suffix: "q" },
    { threshold: 1e9, suffix: "b" },
    { threshold: 1e6, suffix: "m" },
  ]

  for (const { threshold, suffix } of tiers) {
    if (num > threshold) {
      if (threshold === 1e6) {
        if (num < 1e8) return (num / threshold).toFixed(2) + suffix
        return Math.floor(num / threshold) + suffix
      } else {
        if (num < threshold * 100) return (num / threshold).toFixed(2) + suffix
        return Math.floor(num / threshold) + suffix
      }
    }
  }

  return num.toString()
}

type ModifierCalculation = (atLevel: number, prestigeUpgrade: PrestigeUpgrade) => number

export const formatCurrPValue = (
  upgradeName: PrestigeUpgradeId,
  upgradeCount: number,
  config: PrestigeUpgrade,
  calcModifier: ModifierCalculation,
): string => {
  if (upgradeName === "multistrike") return calcModifier(upgradeCount, config).toFixed(2)
  if (upgradeCount === 1) return (config.baseValue * 100).toFixed(0)
  if (upgradeCount > 1) return (calcModifier(upgradeCount, config) * 100).toFixed(0)
  return "0"
}

export const formatPendingPIncrease = (
  upgradeName: string,
  upgradeCount: number,
  purchaseCount: number,
  config: PrestigeUpgrade,
  calcModifier: ModifierCalculation,
  calcModifierIncrease: ModifierCalculation,
): string => {
  let pendingInc: number

  if (upgradeName === "multistrike") {
    if (upgradeCount === 0 && purchaseCount === 1) {
      pendingInc = config.baseValue
    } else {
      const current = calcModifier(upgradeCount, config)
      const after = calcModifier(purchaseCount + upgradeCount, config)

      pendingInc = Math.round(current * 100 - after * 100) / 100
    }
  } else if (purchaseCount === 1 && upgradeCount === 0) {
    pendingInc = Math.round(config.baseValue * 100)
  } else if (upgradeCount === 0 && purchaseCount > 1) {
    pendingInc = Math.round(calcModifier(purchaseCount, config) * 100)
  } else {
    pendingInc = Math.round(calcModifierIncrease(purchaseCount, config) * 100)
  }

  return pendingInc.toFixed(2)
}

export const getRandomColor = (): Color => {
  const colors: Color[] = [
    "#ef4444", // red
    "#f97316", // orange
    "#f59e0b", // amber
    "#eab308", // yellow
    "#84cc16", // lime
    "#22c55e", // green
    "#10b981", // emerald
    "#14b8a6", // teal
    "#06b6d4", // cyan
    "#0ea5e9", // sky
    "#3b82f6", // blue
    "#6366f1", // indigo
    "#8b5cf6", // violet
    "#a855f7", // purple
    "#d946ef", // fuchsia
    "#ec4899", // pink
    "#f43f5e", // rose
    "#64748b", // slate
    "#78716c", // stone
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}

export const getNextCritPosition = (
  existingCrits: Array<{ id: string; damage: number; timestamp: number; position: { x: number; y: number } }> | [],
): { x: number; y: number } => {
  const basePositions = [
    { x: 0, y: 0 },
    { x: -40, y: -30 },
    { x: 40, y: -30 },
    { x: -20, y: 15 },
    { x: 20, y: 15 },
  ]

  const index = existingCrits.length

  if (index >= PERFORMANCE_CONFIG.critDisplayLimit)
    return basePositions[Math.floor(Math.random() * basePositions.length)]
  if (index < basePositions.length) return basePositions[index]

  const spiralIndex = index - 5
  const angle = spiralIndex * 0.8
  const radius = 50 + spiralIndex * 6

  return {
    x: Math.cos(angle) * radius,
    y: Math.sin(angle) * radius,
  }
}

export function saveToLocalStorage(state: RootState): void {
  try {
    const base64GameState = LZString.compressToBase64(JSON.stringify(state))
    localStorage.setItem("gameState", base64GameState)
    console.log("Saved to local storage", state)
  } catch (err) {
    console.error(`Error saving to local storage: ${err}`)
  }
}

export function loadFromLocalStorage(): RootState | undefined {
  try {
    const base64GameState = localStorage.getItem("gameState")
    if (!base64GameState) return undefined

    const gameState = JSON.parse(LZString.decompressFromBase64(base64GameState)) as RootState

    console.log("Decompressed from local storage", gameState)

    const saveVersion = gameState.meta?.gameVersion
    if (!saveVersion) return undefined

    const saveMinorVersion = saveVersion.split(".")?.[1]
    const currentVersion = METADATA_CONFIG.version
    const currentMinorVersion = currentVersion.split(".")[1]

    if (Number(saveMinorVersion) < 4) {
      setTimeout(() => {
        alert(`
Attention Slime Slayer!

Your save from ${saveVersion} doesn't quite fit into the ${currentVersion} world.

The time has come to start a brand new adventure.`)
      }, 100)
      return undefined
    } else if (Number(saveMinorVersion) < 6) {
      setTimeout(() => {
        alert(`
Attention Slime Slayer!

Your save from ${saveVersion} doesn't quite fit into the ${currentVersion} world.

We managed to salvage your achievements, but the time has come to start a new adventure.`)
      }, 100)
      return {
        player: { ...initPlayerState, achievementModifier: gameState.player.achievementModifier },
        stats: {
          ...initStatsState,
          ...gameState.stats,
          recentCrits: [],
          displayCrit: false,
          displayMultistrike: false,
        },
        meta: { ...initialMetaState, ...gameState.meta, gameVersion: METADATA_CONFIG.version },
      }
    }

    const loadedState = {
      ...gameState,
      player: { ...gameState.player, tabInView: "upgrade" },
      stats: {
        ...gameState.stats,
        recentCrits: [],
        displayCrit: false,
        displayMultistrike: false,
      },
      meta: {
        ...gameState.meta,
        gameVersion: METADATA_CONFIG.version,
        fading: false,
        lastSaveCatchUp: gameState.meta.lastPlayed,
        longCatchupDelta: 0,
        longCatchupProcessed: 0,
        longCatchupAbort: false,
      },
    }
    if (Number(saveMinorVersion) < 7 && !loadedState.stats.achievementsUnlocked.includes("special-veteran"))
      loadedState.stats.achievementsUnlocked.push("special-veteran")
    // 0.7.0 checks
    if (!loadedState.player.pHealthUpgradeCount) loadedState.player.pHealthUpgradeCount = 0
    if (!loadedState.player.maxHealth) loadedState.player.maxHealth = initialState.maxHealth
    if (!loadedState.player.currentHealth) loadedState.player.currentHealth = initialState.currentHealth
    return loadedState
  } catch (err) {
    console.error(`Error loading from local storage: ${err}`)

    return undefined
  }
}
