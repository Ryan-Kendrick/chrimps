// @ts-nocheck

import { useEffect, useState } from "react"
import { PrestigeUpgradeConfig, PrestigeUpgradeName, UpgradeIdWithLevel, HeroName, HeroStats } from "../models/upgrades"
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
}

export const setInitElementMap: Record<UpgradeIdWithLevel | HeroName, (state: PlayerState) => boolean> = {
  "adventurer-otp.1": (state) => {
    state.hasInitClickMulti1 = true
  },
  "adventurer-otp.2": (state) => {
    state.hasInitClickMulti2 = true
  },
  "adventurer-otp.3": (state) => {
    state.hasInitClickMulti3 = true
  },
  "warrior-otp.1": (state) => {
    state.hasInitDotMulti1 = true
  },
  "warrior-otp.2": (state) => {
    state.hasInitDotMulti2 = true
  },
  "warrior-otp.3": (state) => {
    state.hasInitDotMulti3 = true
  },
  warrior: (state) => {
    state.hasInitDotPane = true
  },
  adventurer: (state) => true,
}

export const initSelectorMap: Record<UpgradeIdWithLevel | HeroName, (state: RootState) => boolean> = {
  "adventurer-otp.1": (state) => selectInitState(state).hasInitClickMulti1,
  "adventurer-otp.2": (state) => selectInitState(state).hasInitClickMulti2,
  "adventurer-otp.3": (state) => selectInitState(state).hasInitClickMulti3,
  "warrior-otp.1": (state) => selectInitState(state).hasInitDotMulti1,
  "warrior-otp.2": (state) => selectInitState(state).hasInitDotMulti2,
  "warrior-otp.3": (state) => selectInitState(state).hasInitDotMulti3,
  dot: (state) => selectInitState(state).hasInitDotPane,
}

export const prestigeUpgradeMap: Record<PrestigeUpgradeName, (state: RootState) => number> = {
  damage: (state) => selectPrestigeState(state).pDamageUpgradeCount,
  health: (state) => selectPrestigeState(state).pHealthUpgradeCount,
}

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
