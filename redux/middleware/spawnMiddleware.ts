import { Dispatch, isAnyOf, isAllOf, Middleware } from "@reduxjs/toolkit"
import { selectMonsterState, spawnMonster } from "../monsterSlice"
import {
  selectZoneState,
  incrementStageNumber,
  refreshFarmZone,
  zoneComplete,
  zoneSelected,
  setZoneInView,
} from "../zoneSlice"
import { ZONE_CONFIG } from "../../gameconfig/zone"
import { EnemyState } from "../../models/monsters"
import { increaseGold, increasePlasma, incrementPDamageUpgradeCount, setFullHealth } from "../playerSlice"
import {
  incrementFarmZonesCompleted,
  incrementKillCount,
  monsterBeaten,
  selectUnlockedAchievements,
} from "../statsSlice"
import { RootState, store } from "../store"
import { AchievementCategory, ACHIEVEMENTS } from "../../gameconfig/achievements"
import { checkAchievementUnlock } from "../shared/helpers"
import { monsterClicked, increaseTotalDotDamageDealt } from "../statsSlice"

export const spawnMiddleware: Middleware = (store) => (next) => (action) => {
  const nextAction = next(action)

  if (!isAnyOf(monsterClicked, monsterBeaten, increaseTotalDotDamageDealt, zoneSelected)(action)) return nextAction

  const state: RootState = store.getState()
  const dispatch = store.dispatch
  const { alive, goldValue, plasmaValue } = selectMonsterState(state) as EnemyState

  if (isAllOf(zoneSelected)(action)) {
    zoneTransition(state, dispatch, false, action.payload.prevZone)
  }
  if (alive) return nextAction

  const {
    currentZoneNumber,
    zoneMonsters,
    stageNumber: currentStage,
    isFarming,
    farmZoneMonsters,
    farmStageNumber,
    zoneInView,
  } = selectZoneState(state)

  const zoneLength = ZONE_CONFIG.length
  const killedMonster =
    isFarming && farmZoneMonsters ? farmZoneMonsters[farmStageNumber - 1] : zoneMonsters[currentStage - 1]

  if (killedMonster.name === "Errant Plasma") dispatch(incrementPDamageUpgradeCount())
  dispatch(incrementKillCount())
  if (goldValue) dispatch(increaseGold(goldValue))
  let nextMonster: undefined | EnemyState

  const isProgressing = zoneInView === currentZoneNumber
  const stageNumber = isProgressing ? currentStage : farmStageNumber

  // Zone transition
  if (stageNumber === zoneLength) {
    // When highest zone
    if (isProgressing) {
      updateZonesCompleted(dispatch)
      if (plasmaValue > 0) dispatch(increasePlasma(plasmaValue))

      // Highest zone & farming toggled; zone transition in place
      if (isFarming) {
        const newFarmZoneMonsters = selectZoneState(store.getState()).farmZoneMonsters
        if (newFarmZoneMonsters) nextMonster = newFarmZoneMonsters[0]
      } else {
        const newZoneMonsters = selectZoneState(store.getState()).zoneMonsters
        nextMonster = newZoneMonsters[0]
      }

      // When farming and farming is toggled, continue; else goto zoneTransition
    } else if (zoneInView < currentZoneNumber) {
      updateFarmAchievements(dispatch)
      if (isFarming && farmZoneMonsters) {
        dispatch(refreshFarmZone())
        const newFarmZoneMonsters = selectZoneState(store.getState()).farmZoneMonsters
        if (newFarmZoneMonsters) nextMonster = newFarmZoneMonsters[0]
      } else if (!isFarming) {
        zoneTransition(state, dispatch, true)
      } else throw new Error("Logic error during farm zone transition")
    } else throw new Error("Logic error during highest zone transition")

    // Stage transition case
  } else {
    dispatch(incrementStageNumber())
    if (zoneInView < currentZoneNumber && farmZoneMonsters) {
      nextMonster = farmZoneMonsters[stageNumber]
    } else {
      nextMonster = zoneMonsters[stageNumber]
    }
  }
  // Spawn the next monster when we didn't jump to zoneTransition
  if (nextMonster) {
    dispatch(setFullHealth())
    dispatch(spawnMonster(nextMonster))
  }

  return nextAction
}

function zoneTransition(state: RootState, dispatch: Dispatch, returnToProgression: boolean, previousZone?: number) {
  let nextMonster: undefined | EnemyState
  const stageNumber = state.zone.nextStageIndex - 1

  // Case 1: Transition from farming to the current zone
  if (returnToProgression) {
    // TODO: add builder to zoneSlice to handle this as incrementFarmZonesCompelted
    dispatch(setZoneInView(state.zone.currentZoneNumber))
    nextMonster = state.zone.monsters[stageNumber]
    // Case 2: Transitions via zoneSelector
  } else if (previousZone && previousZone === state.zone.zoneInView) {
    // Case 2a: Chose same zone, do nothing
    return
  } else if (state.zone.zoneInView === state.zone.currentZoneNumber) {
    // Case 2b: Chose current zone, continue from current stage
    nextMonster = state.zone.monsters[stageNumber]
  } else {
    // Case 2c: Chose farm zone, start from stage 1
    nextMonster = state.zone.farmZoneMonsters?.[0]
  }
  if (nextMonster) {
    dispatch(setFullHealth())
    dispatch(spawnMonster(nextMonster))
  } else throw new Error("Monster undefined during zone transition")
}

function updateZonesCompleted(dispatch: Dispatch) {
  dispatch(zoneComplete())
  const state = store.getState()
  const countAchievements = ACHIEVEMENTS.zone.count as AchievementCategory
  const progressAchievements = ACHIEVEMENTS.zone.progression as AchievementCategory

  checkAchievementUnlock(dispatch, [
    {
      unlockedAchievements: state.stats.achievementsUnlocked,
      achievements: countAchievements.achievements,
      value: state.stats.totalZonesCompleted,
    },
    {
      unlockedAchievements: state.stats.achievementsUnlocked,
      achievements: progressAchievements.achievements,
      value: state.stats.highestZoneEver,
    },
  ])
}

function updateFarmAchievements(dispatch: Dispatch) {
  dispatch(incrementFarmZonesCompleted())
  const state = store.getState()
  const countAchievements = ACHIEVEMENTS.zone.farm as AchievementCategory

  checkAchievementUnlock(dispatch, [
    {
      unlockedAchievements: selectUnlockedAchievements(state),
      achievements: countAchievements.achievements,
      value: state.stats.farmZonesCompleted,
    },
  ])
}
