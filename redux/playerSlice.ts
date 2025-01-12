import { createSelector, createSlice } from "@reduxjs/toolkit"
import type { PayloadAction } from "@reduxjs/toolkit"
import { AppDispatch, type RootState } from "./store"
import { PlayerState, Tab } from "../models/player"
import { playerCalc, UPGRADE_CONFIG } from "../gameconfig/upgrades"
import { heroDamageMap, setInitElementMap } from "../gameconfig/utils"
import { PrestigeState, PrestigeUpgradeName, UpgradeIdWithLevel, HeroName } from "../models/upgrades"
import { prestigeReset } from "./shared/actions"
import { ACHIEVEMENTS } from "../gameconfig/achievements"
import { checkAchievementUnlock } from "./shared/helpers"

const debugState: PlayerState = {
  adventurerLevel: 500,
  adventurerMultiUpgradeCount: 3,
  warriorLevel: 500,
  warriorMultiUpgradeCount: 3,
  gold: 1000000,
  plasma: 1000000,
  achievementModifier: 0,

  activeHeroes: ["adventurer", "warrior"],
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
  adventurerLevel: 1,
  adventurerMultiUpgradeCount: 0,
  warriorLevel: 0,
  warriorMultiUpgradeCount: 0,
  gold: 0,
  achievementModifier: 0,

  activeHeroes: ["adventurer"],
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
    incrementAdventurerLevel: (state) => {
      state.adventurerLevel++
    },
    incrementAdventurerMultiUpgradeCount: (state) => {
      state.adventurerMultiUpgradeCount++
    },
    incrementWarriorLevel: (state) => {
      if (!state.activeHeroes.includes("warrior")) state.activeHeroes.push("warrior")
      state.warriorLevel++
    },
    incrementWarriorMultiUpgradeCount: (state) => {
      state.warriorMultiUpgradeCount++
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
    initialiseElement(state, action: PayloadAction<UpgradeIdWithLevel | HeroName>) {
      setInitElementMap[action.payload](state)
    },
    setTabInView: (state, action: PayloadAction<Tab>) => {
      state.tabInView = action.payload
    },
    toggleDebugState: (state) => {
      if (state.adventurerLevel < 500) {
        return (state = debugState)
      } else {
        return (state = { ...initialState, gold: 1000000, plasma: 1000000 })
      }
    },
  },
  extraReducers(builder) {
    builder.addCase(prestigeReset, (state, action: PayloadAction<Record<PrestigeUpgradeName, PrestigeState>>) => {
      state.adventurerLevel = 1
      state.adventurerMultiUpgradeCount = 0
      state.warriorLevel = 0
      state.warriorMultiUpgradeCount = 0
      state.gold = 0
      state.plasmaSpent += state.plasmaReserved
      state.activeHeroes = ["adventurer"]
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
  incrementAdventurerLevel,
  incrementAdventurerMultiUpgradeCount,
  incrementWarriorLevel,
  incrementWarriorMultiUpgradeCount,
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
  clickLevel: player.adventurerLevel,
  clickMultiUpgradeCount: player.adventurerMultiUpgradeCount,
  dotLevel: player.warriorLevel,
  dotMultiUpgradeCount: player.warriorMultiUpgradeCount,
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

export const selectAdventurerLevel = (state: RootState) => state.player.adventurerLevel
export const selectGold = (state: RootState) => state.player.gold
export const selectGCanAfford = (cost: number) => createSelector([selectGold], (gold) => gold >= cost)
export const selectPlasma = (state: RootState) => state.player.plasma
export const selectPCanAfford = (cost: number) => createSelector([selectPlasma], (plasma) => plasma >= cost)
export const selectPlasmaReserved = (state: RootState) => state.player.plasmaReserved
export const selectAchievementModifier = (state: RootState) => state.player.achievementModifier

const prestigeDamage = UPGRADE_CONFIG.prestige.find((pUpgrade) => pUpgrade.id === "damage")!.modifier
export const selectAdventurerDamage = createSelector(
  [selectAdventurerLevel, (state: RootState) => state.player.adventurerMultiUpgradeCount],
  (adventurerLevel, adventurerUpgrades) => {
    let damage = adventurerLevel
    for (let i = 0; i < adventurerUpgrades; i++) {
      damage *= UPGRADE_CONFIG.adventurer.OneTimePurchases.OTPModifiers[i]
    }
    return damage
  },
)
export const selectWarriorDamage = createSelector(
  [(state: RootState) => state.player.warriorLevel, (state: RootState) => state.player.warriorMultiUpgradeCount],
  (warriorLevel, warriorUpgrades) => {
    let damage = warriorLevel
    for (let i = 0; i < warriorUpgrades; i++) {
      damage *= UPGRADE_CONFIG.warrior.OneTimePurchases.OTPModifiers[i]
    }
    return damage
  },
)
export const selectClickDamage = (state: RootState) =>
  playerCalc.clickDamage(
    state.player.adventurerLevel,
    state.player.adventurerMultiUpgradeCount,
    1 + state.player.pDamageUpgradeCount * prestigeDamage,
    1 + state.player.achievementModifier,
  )
export const selectDotDamage = (state: RootState) => {
  type HeroStats = { level: number; upgradeCount: number }

  const activeHeroesStats = [] as HeroStats[]

  for (const hero of state.player.activeHeroes) {
    const thisHeroStats = heroDamageMap[hero](state)
    activeHeroesStats.push(thisHeroStats)
  }

  playerCalc.heroDamage(
    state.player.activeHeroes,
    activeHeroesStats,
    1 + state.player.pDamageUpgradeCount * prestigeDamage,
    1 + state.player.achievementModifier,
  )
}

export const selectAdventurerLevelUpCost = (state: RootState) =>
  UPGRADE_CONFIG.adventurer.levelUpCost(state.player.adventurerLevel)
export const selectWarriorLevelUpCost = (state: RootState) =>
  UPGRADE_CONFIG.warrior.levelUpCost(state.player.warriorLevel)

export const selectTabInView = (state: RootState) => state.player.tabInView
export const selectPrestigeTabVisible = createSelector(
  [selectPlasma, selectPlasmaReserved, (state: RootState) => state.player.plasmaSpent],
  (plasma, plasmaReserved, plasmaSpent) => plasma || plasmaReserved || plasmaSpent > 0,
)

export const updateClickDamage = (whatChanged: string) => (dispatch: AppDispatch, getState: () => RootState) => {
  switch (whatChanged) {
    case "adventurer-levelup":
      dispatch(incrementAdventurerLevel())
      break
    case "adventurer-multi":
      dispatch(incrementAdventurerMultiUpgradeCount())
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
    case "warrior-levelup":
      dispatch(incrementWarriorLevel())
      break
    case "warrior-multi":
      dispatch(incrementWarriorMultiUpgradeCount())
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
