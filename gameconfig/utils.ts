// @ts-nocheck

import { useEffect, useState } from "react"
import { PrestigeUpgradeConfig, PrestigeUpgradeName, UpgradeIdWithLevel, HeroName, HeroStats } from "../models/upgrades"
import { RootState } from "../redux/store"
import { PlayerState } from "../models/player"
import { selectInitState, selectPrestigeState } from "../redux/playerSlice"
import * as LZString from "lz-string"
import { METADATA_CONFIG } from "./meta"

export const heroDamageMap: Record<HeroName, (state: RootState) => HeroStats> = {
  adventurer: (state) => {
    return { level: state.player.adventurerLevel, upgradeCount: state.player.adventurerMultiUpgradeCount }
  },
  warrior: (state) => {
    return { level: state.player.warriorLevel, upgradeCount: state.player.warriorMultiUpgradeCount }
  },
  healer: (state) => {
    return { level: state.player.healerLevel, upgradeCount: state.player.healerMultiUpgradeCount }
  },
  mage: (state) => {
    return { level: state.player.mageLevel, upgradeCount: state.player.mageMultiUpgradeCount }
  },
}

export const setInitElementMap: Record<UpgradeIdWithLevel | HeroName, (state: PlayerState) => boolean> = {
  "click-multi.1": (state) => {
    state.hasInitClickMulti1 = true
  },
  "click-multi.2": (state) => {
    state.hasInitClickMulti2 = true
  },
  "click-multi.3": (state) => {
    state.hasInitClickMulti3 = true
  },
  "dot-multi.1": (state) => {
    state.hasInitDotMulti1 = true
  },
  "dot-multi.2": (state) => {
    state.hasInitDotMulti2 = true
  },
  "dot-multi.3": (state) => {
    state.hasInitDotMulti3 = true
  },
  dot: (state) => {
    state.hasInitDotPane = true
  },
  click: (state) => true,
}

export const initSelectorMap: Record<UpgradeIdWithLevel | HeroName, (state: RootState) => boolean> = {
  "click-multi.1": (state) => selectInitState(state).hasInitClickMulti1,
  "click-multi.2": (state) => selectInitState(state).hasInitClickMulti2,
  "click-multi.3": (state) => selectInitState(state).hasInitClickMulti3,
  "dot-multi.1": (state) => selectInitState(state).hasInitDotMulti1,
  "dot-multi.2": (state) => selectInitState(state).hasInitDotMulti2,
  "dot-multi.3": (state) => selectInitState(state).hasInitDotMulti3,
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

    return { ...gameState, stats: { ...gameState.stats, gameVersion: METADATA_CONFIG.version } }
  } catch (err) {
    console.error(`Error loading from local storage: ${err}`)
    return undefined
  }
}
