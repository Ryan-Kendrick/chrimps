import { createSelector, createSlice } from "@reduxjs/toolkit"
import type { PayloadAction } from "@reduxjs/toolkit"
import { AppDispatch, type RootState } from "./store"
import { PlayerState, Tab } from "../models/player"
import { playerCalc, UPGRADE_CONFIG } from "../gameconfig/upgrades"
import { setInitElementMap } from "../gameconfig/utils"
import { PrestigeState, PrestigeUpgradeName, UpgradeIdWithLevel, UpgradeKey } from "../models/upgrades"
import { prestigeReset } from "./shared/actions"
import { ACHIEVEMENTS } from "../gameconfig/achievements"
import { checkAchievementUnlock } from "./shared/helpers"

const debugState: PlayerState = {
  clickLevel: 500,
  clickMultiUpgradeCount: 3,
  dotLevel: 500,
  dotMultiUpgradeCount: 3,
  gold: 1000000,
  plasma: 1000000,
  achievementModifier: 0,

  plasmaReserved: 0,
  hasInitClickMulti1: false,
  hasInitClickMulti2: false,
  hasInitClickMulti3: false,
  hasInitDotPane: false,
  hasInitDotMulti1: false,
  hasInitDotMulti2: false,
  hasInitDotMulti3: false,

  tabInView: "upgrade",

  startDate: performance.timeOrigin,
  pDamageUpgradeCount: 300,
  // pHealthUpgradeCount: 300,
  plasmaSpent: 50000,
}

const initialState: PlayerState = {
  clickLevel: 1,
  clickMultiUpgradeCount: 0,
  dotLevel: 0,
  dotMultiUpgradeCount: 0,
  gold: 0,
  achievementModifier: 0,

  plasmaReserved: 0,
  // Prevents animation triggering again on mount
  hasInitClickMulti1: false,
  hasInitClickMulti2: false,
  hasInitClickMulti3: false,

  hasInitDotPane: false,
  hasInitDotMulti1: false,
  hasInitDotMulti2: false,
  hasInitDotMulti3: false,

  tabInView: "upgrade",
  // Preserved between runs
  startDate: performance.timeOrigin,
  plasma: 0,
  pDamageUpgradeCount: 0,
  // pHealthUpgradeCount: 0,
  plasmaSpent: 0,
}

export const playerSlice = createSlice({
  name: "player",
  initialState,
  reducers: {
    incrementClickLevel: (state) => {
      state.clickLevel++
    },
    incrementClickMultiUpgradeCount: (state) => {
      state.clickMultiUpgradeCount++
    },
    incrementDotLevel: (state) => {
      state.dotLevel++
    },
    incrementDotMultiUpgradeCount: (state) => {
      state.dotMultiUpgradeCount++
    },
    increaseGold(state, action: PayloadAction<number>) {
      state.gold += action.payload
    },
    decreaseGold(state, action: PayloadAction<number>) {
      state.gold -= action.payload
    },
    increasePlasma(state, action: PayloadAction<number>) {
      state.plasma += action.payload
    },
    reservePlasma(state, action: PayloadAction<number>) {
      const diff = action.payload - state.plasmaReserved
      state.plasmaReserved += diff
      state.plasma -= diff
    },
    resetPlasmaReserved: (state) => {
      state.plasma += state.plasmaReserved
      state.plasmaReserved = 0
    },
    incrementPDamageUpgradeCount: (state) => {
      state.pDamageUpgradeCount++
    },
    incrementPHealthUpgradeCount: (state) => {
      // state.pHealthUpgradeCount++
    },
    prestigeRespec: (state) => {
      state.plasma += state.plasmaReserved
      state.plasma += state.plasmaSpent
      state.plasmaReserved = 0
      state.plasmaSpent = 0
      state.pDamageUpgradeCount = 0
      // state.pHealthUpgradeCount = 0
    },
    increaseAchievementModifier(state, action: PayloadAction<number>) {
      // Integer conversion to avoid floating-point imprecision
      const currentValue = Math.round(state.achievementModifier * 100)
      const payloadValue = Math.round(action.payload * 100)
      state.achievementModifier = (currentValue + payloadValue) / 100
    },
    initialiseElement(state, action: PayloadAction<UpgradeIdWithLevel | UpgradeKey>) {
      setInitElementMap[action.payload](state)
    },
    setTabInView: (state, action: PayloadAction<Tab>) => {
      state.tabInView = action.payload
    },
    toggleDebugState: (state) => {
      if (state.clickLevel < 500) {
        return (state = debugState)
      } else {
        return (state = { ...initialState, gold: 1000000, plasma: 1000000 })
      }
    },
  },
  extraReducers(builder) {
    builder.addCase(prestigeReset, (state, action: PayloadAction<Record<PrestigeUpgradeName, PrestigeState>>) => {
      state.clickLevel = 1
      state.clickMultiUpgradeCount = 0
      state.dotLevel = 0
      state.dotMultiUpgradeCount = 0
      state.gold = 0
      state.plasmaSpent += state.plasmaReserved
      state.plasmaReserved = 0
      state.hasInitClickMulti1 = false
      state.hasInitClickMulti2 = false
      state.hasInitClickMulti3 = false
      state.hasInitDotPane = false
      state.hasInitDotMulti1 = false
      state.hasInitDotMulti2 = false
      state.hasInitDotMulti3 = false

      state.tabInView = "upgrade"

      state.pDamageUpgradeCount += action.payload.damage.purchaseCount
      // state.pHealthUpgradeCount += action.payload.health.purchaseCount
    })
    // builder.addCase("stats/zoneTenCompleted", (state) => {})
  },
})

export const {
  incrementClickLevel,
  incrementClickMultiUpgradeCount,
  incrementDotLevel,
  incrementDotMultiUpgradeCount,
  increaseGold,
  decreaseGold,
  increasePlasma,
  reservePlasma,
  resetPlasmaReserved,
  incrementPDamageUpgradeCount,
  incrementPHealthUpgradeCount,
  prestigeRespec,
  increaseAchievementModifier,
  initialiseElement,
  setTabInView,
  toggleDebugState,
} = playerSlice.actions

export const selectPlayerState = createSelector([(state: RootState) => state.player], (player) => ({
  clickLevel: player.clickLevel,
  clickMultiUpgradeCount: player.clickMultiUpgradeCount,
  dotLevel: player.dotLevel,
  dotMultiUpgradeCount: player.dotMultiUpgradeCount,
  startDate: player.startDate,
}))

export const selectPrestigeState = createSelector([(state: RootState) => state.player], (player) => ({
  plasma: player.plasma,
  plasmaSpent: player.plasmaSpent,
  pDamageUpgradeCount: player.pDamageUpgradeCount,
  // pHealthUpgradeCount: player.pHealthUpgradeCount,
}))

export const selectInitState = createSelector(
  [(state: RootState) => state.player],
  ({
    hasInitClickMulti1,
    hasInitClickMulti2,
    hasInitClickMulti3,
    hasInitDotPane,
    hasInitDotMulti1,
    hasInitDotMulti2,
    hasInitDotMulti3,
  }) => ({
    hasInitClickMulti1,
    hasInitClickMulti2,
    hasInitClickMulti3,
    hasInitDotPane,
    hasInitDotMulti1,
    hasInitDotMulti2,
    hasInitDotMulti3,
  }),
)

export const selectClickLevel = (state: RootState) => state.player.clickLevel
export const selectGold = (state: RootState) => state.player.gold
export const selectGCanAfford = (cost: number) => createSelector([selectGold], (gold) => gold >= cost)
export const selectPlasma = (state: RootState) => state.player.plasma
export const selectPCanAfford = (cost: number) => createSelector([selectPlasma], (plasma) => plasma >= cost)
export const selectPlasmaReserved = (state: RootState) => state.player.plasmaReserved
export const selectAchievementModifier = (state: RootState) => state.player.achievementModifier

const prestigeDamage = UPGRADE_CONFIG.prestige.find((pUpgrade) => pUpgrade.id === "damage")!.modifier
export const selectAdventurerDamage = createSelector(
  [selectClickLevel, (state: RootState) => state.player.clickMultiUpgradeCount],
  (adventurerLevel, adventurerUpgrades) => {
    let damage = adventurerLevel
    for (let i = 0; i < adventurerUpgrades; i++) {
      damage *= UPGRADE_CONFIG.adventurer.OneTimePurchases.OTPModifiers[i]
    }
    return damage
  },
)
export const selectWarriorDamage = createSelector()
export const selectClickDamage = (state: RootState) =>
  playerCalc.clickDamage(
    state.player.clickLevel,
    state.player.clickMultiUpgradeCount,
    1 + state.player.pDamageUpgradeCount * prestigeDamage,
    1 + state.player.achievementModifier,
  )
export const selectDotDamage = (state: RootState) =>
  playerCalc.dotDamage(
    state.player.dotLevel,
    state.player.dotMultiUpgradeCount,
    1 + state.player.pDamageUpgradeCount * prestigeDamage,
    1 + state.player.achievementModifier,
  )

export const selectClickLevelUpCost = (state: RootState) => UPGRADE_CONFIG.click.levelUpCost(state.player.clickLevel)
export const selectDotLevelUpCost = (state: RootState) => UPGRADE_CONFIG.dot.levelUpCost(state.player.dotLevel)

export const selectTabInView = (state: RootState) => state.player.tabInView
export const selectPrestigeTabVisible = createSelector(
  [selectPlasma, selectPlasmaReserved, (state: RootState) => state.player.plasmaSpent],
  (plasma, plasmaReserved, plasmaSpent) => plasma || plasmaReserved || plasmaSpent > 0,
)

export const updateClickDamage = (whatChanged: string) => (dispatch: AppDispatch, getState: () => RootState) => {
  switch (whatChanged) {
    case "levelup":
      dispatch(incrementClickLevel())
      break
    case "multi":
      dispatch(incrementClickMultiUpgradeCount())
      break
    case "pDamage":
      break
    default:
      throw new Error("Unexpected updateDotDamage argument: " + whatChanged)
  }

  const state = getState()
  checkAchievementUnlock(dispatch, [
    {
      achievements: ACHIEVEMENTS.click.value,
      value: selectClickDamage(state),
    },
  ])
}

export const updateDotDamage = (whatChanged: string) => (dispatch: AppDispatch, getState: () => RootState) => {
  switch (whatChanged) {
    case "levelup":
      dispatch(incrementDotLevel())
      break
    case "multi":
      dispatch(incrementDotMultiUpgradeCount())
      break
    case "pDamage":
      break
    default:
      throw new Error("Unexpected updateDotDamage argument: " + whatChanged)
  }

  const state = getState()

  checkAchievementUnlock(dispatch, [
    {
      achievements: ACHIEVEMENTS.dot.value,
      value: selectDotDamage(state),
    },
  ])
}

export const updatePrestige =
  (prestigePurchase: Record<PrestigeUpgradeName, PrestigeState>) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(prestigeReset(prestigePurchase))
    const state = getState()
    checkAchievementUnlock(dispatch, [
      {
        achievements: ACHIEVEMENTS.prestige.count,
        value: state.stats.prestigeCount,
      },
      {
        achievements: ACHIEVEMENTS.prestige.plasmaSpent,
        value: state.player.plasmaSpent,
      },
    ])
  }

export default playerSlice.reducer
