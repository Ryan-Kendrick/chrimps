// @ts-nocheck

import { useEffect, useState } from "react"
import {
  PrestigeUpgradeConfig,
  PrestigeUpgradeName,
  UpgradeIdWithLevel,
  HeroName,
  HeroStats,
  UpgradeId,
} from "../models/upgrades"
import { RootState } from "../redux/store"
import { PlayerState } from "../models/player"
import { selectInitState, selectPrestigeState } from "../redux/playerSlice"
import * as LZString from "lz-string"
import { METADATA_CONFIG } from "./meta"

export const heroStateMap: Record<HeroName, { level: keyof PlayerState; upgradeCount: keyof PlayerState }> = {
  adventurer: {
    level: "adventurerLevel",
    upgradeCount: "adventurerOTPUpgradeCount",
  },
  warrior: {
    level: "warriorLevel",
    upgradeCount: "warriorOTPUpgradeCount",
  },
  healer: {
    level: "adventurerLevel",
    upgradeCount: "adventurerOTPUpgradeCount",
  },
  mage: {
    level: "adventurerLevel",
    upgradeCount: "adventurerOTPUpgradeCount",
  },
} as const

export const heroDamageMap: Record<HeroName, (state: RootState) => HeroStats> = {
  adventurer: (state) => {
    return { level: state.player.adventurerLevel, upgradeCount: state.player.adventurerOTPUpgradeCount }
  },
  warrior: (state) => {
    return { level: state.player.warriorLevel, upgradeCount: state.player.warriorOTPUpgradeCount }
  },
  healer: (state) => {
    return { level: state.player.healerLevel, upgradeCount: state.player.healerOTPUpgradeCount }
  },
  mage: (state) => {
    return { level: state.player.mageLevel, upgradeCount: state.player.mageOTPUpgradeCount }
  },
} as const

export const setInitElementMap: Record<UpgradeId | HeroName, (state: PlayerState) => boolean> = {
  "adventurer-otp": (state: PlayerState) => {
    state.hasInitAdventurerOTP++
  },
  "warrior-otp": (state: PlayerState) => {
    state.hasInitWarriorOTP++
  },
  "healer-otp": (state: PlayerState) => {
    state.hasInitHealerOTP++
  },
  "mage-otp": (state: PlayerState) => {
    state.hasInitMageOTP++
  },
  adventurer: (state: PlayerState) => true,
  warrior: (state: PlayerState) => {
    state.hasInitWarriorPane = true
  },
  healer: (state: PlayerState) => {
    state.hasInitHealerPane = true
  },
  mage: (state: PlayerState) => {
    state.hasInitMagePane = true
  },
} as const

export const initSelectorMap: Record<UpgradeId | HeroName, (state: RootState) => number | boolean> = {
  "adventurer-otp": (state: PlayerState) => selectInitState(state).hasInitAdventurerOTP,
  "warrior-otp": (state: PlayerState) => selectInitState(state).hasInitWarriorOTP,
  "healer-otp": (state: PlayerState) => selectInitState(state).hasInitHealerOTP,
  "mage-otp": (state: PlayerState) => selectInitState(state).hasInitMageOTP,
  warrior: (state: PlayerState) => selectInitState(state).hasInitWarriorPane,
} as const

export const prestigeUpgradeMap: Record<PrestigeUpgradeName, (state: RootState) => number> = {
  damage: (state) => selectPrestigeState(state).pDamageUpgradeCount,
  health: (state) => selectPrestigeState(state).pHealthUpgradeCount,
} as const

export function useForcedDPI(): number {
  const getDPIScale = () => (window.matchMedia("(min-width: 1024px)").matches ? window.devicePixelRatio : 1)

  const [dpiScale, setDpiScale] = useState(getDPIScale)

  useEffect(() => {
    const queries = [
      window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`),
      window.matchMedia("(min-width: 1024px)"),
    ]

    const handleChange = () => setDpiScale(getDPIScale())

    queries.forEach((query) => query.addEventListener("change", handleChange))

    return () => queries.forEach((query) => query.removeEventListener("change", handleChange))
  }, [])

  return dpiScale
}

export function serialize(classInstance) {
  if (classInstance == null || typeof classInstance !== "object") return classInstance

  if (Array.isArray(classInstance)) return classInstance.map(serialize)

  const serialized = {}

  for (const key of Object.keys(classInstance)) {
    serialized[key] = serialize(classInstance[key])
  }
  return serialized
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

    const saveVersion = gameState.meta.gameVersion
    const saveMinorVersion = saveVersion.split(".")[1]
    const currentVersion = METADATA_CONFIG.version
    const currentMinorVersion = currentVersion.split(".")[1]

    if (saveMinorVersion !== currentMinorVersion) {
      setTimeout(() => {
        alert(`
Attention Slime Slayer!

Your save from ${saveVersion} doesn't quite fit into the ${currentVersion} world.

The time has come to start a brand new adventure.`)
      }, 100)
      return undefined
    }

    return { ...gameState, meta: { ...gameState.meta, gameVersion: METADATA_CONFIG.version } }
  } catch (err) {
    console.error(`Error loading from local storage: ${err}`)
    return undefined
  }
}
