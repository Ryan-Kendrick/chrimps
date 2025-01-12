import { PropsWithChildren, useCallback, useEffect, useRef } from "react"
import { useAppDispatch, useAppSelector } from "../../redux/hooks"
import {
  increaseGold,
  increasePlasma,
  selectClickDamage,
  selectDotDamage,
  selectPlayerState,
} from "../../redux/playerSlice"
import { monsterSlice, selectMonsterAlive, selectMonsterState, spawnMonster } from "../../redux/monsterSlice"
import {
  incrementKillCount,
  updateDotDamageDealt,
  updateMonsterClicked,
  updateFarmZonesCompleted,
  updateZone,
} from "../../redux/statsSlice"
import { selectZoneState, incrementStageNumber, refreshFarmZone, setZoneInView } from "../../redux/zoneSlice"
import { ZONE_CONFIG } from "../../gameconfig/zone"
import { store } from "../../redux/store"
import { EnemyState } from "../../models/monsters"
import { clearCatchUpTime, saveGame, selectLastSaveCatchUp, selectLoading, setLoading } from "../../redux/metaSlice"

export default function Monster({ children }: PropsWithChildren) {
  const dispatch = useAppDispatch()

  const { adventurerLevel: clickLevel } = useAppSelector(selectPlayerState)
  const clickDamage = useAppSelector(selectClickDamage)
  const dotDamage = useAppSelector(selectDotDamage)
  const lastSaveCatchUp = useAppSelector(selectLastSaveCatchUp)
  const loading = useAppSelector(selectLoading)

  const lastSaveCatchUpRef = useRef(lastSaveCatchUp)

  // Interface between requestAnimationFrame and React to prevent infinite catchup loops
  useEffect(() => {
    lastSaveCatchUpRef.current = lastSaveCatchUp
  }, [lastSaveCatchUp])

  const zoneLength = ZONE_CONFIG.length
  const {
    currentZoneNumber: currentZone,
    stageNumber: currentStageNumber,
    zoneMonsters,
    isFarming,
    farmZoneMonsters,
    farmZoneNumber,
    zoneInView,
  } = useAppSelector(selectZoneState)

  const { monsterName, monsterPlasmaValue, monsterLevel, monsterImage, monsterAlive } =
    useAppSelector(selectMonsterState)

  const tickCount = useRef(0)
  const lastFrameTime = useRef(performance.now())
  const frameRef = useRef<number>()
  const TICK_RATE = 20
  const TICK_TIME = 1000 / TICK_RATE

  const checkAchievements = useCallback(() => {}, [clickLevel])
  const runTasks = useCallback(
    (catchup?: boolean) => {
      // 200ms
      if (tickCount.current % 4 === 0) {
      }

      // 500ms
      if (tickCount.current % 10 === 0) {
      }

      // 1 second
      if (tickCount.current % 20 === 0) {
        checkAchievements()
      }

      // 2 seconds
      if (tickCount.current % 40 === 0) {
      }

      // 10 seconds
      if (tickCount.current % 200 === 0) {
        // dispatch(updateLastPlayed)
      }

      // 30 seconds
      if (!catchup && tickCount.current % 600 === 0) {
        dispatch(saveGame())
      }
    },
    [checkAchievements],
  )

  const dealDamageOverTime = () => {
    if (dotDamage) {
      const damageThisTick = dotDamage / 20
      dispatch(updateDotDamageDealt(damageThisTick))
    }
  }

  const onMonsterDeath = () => {
    const {
      currentZoneNumber: currentZone,
      zoneMonsters,
      stageNumber: currentStage,
      isFarming,
      farmZoneMonsters,
      farmStageNumber,
      zoneInView,
    } = selectZoneState(store.getState())
    const { monsterGoldValue, monsterPlasmaValue } = selectMonsterState(store.getState())

    dispatch(incrementKillCount())
    dispatch(increaseGold(monsterGoldValue))
    let nextMonster: undefined | EnemyState

    const isProgressing = zoneInView === currentZone
    const stageNumber = isProgressing ? currentStage : farmStageNumber

    // Zone transition
    if (stageNumber === zoneLength) {
      // When highest zone
      if (isProgressing) {
        dispatch(updateZone())
        if (currentZone > 9) dispatch(increasePlasma(monsterPlasmaValue))

        // Highest zone & farming toggled; zone transition in place
        if (isFarming) {
          const newFarmZoneMonsters = selectZoneState(store.getState()).farmZoneMonsters
          if (newFarmZoneMonsters) nextMonster = newFarmZoneMonsters[0]
        } else {
          const newZoneMonsters = selectZoneState(store.getState()).zoneMonsters
          nextMonster = newZoneMonsters[0]
        }

        // When farming and farming is toggled, continue; else goto zoneInView useEffect block
      } else if (zoneInView < currentZone) {
        dispatch(updateFarmZonesCompleted())
        if (isFarming && farmZoneMonsters) {
          dispatch(refreshFarmZone())
          const newFarmZoneMonsters = selectZoneState(store.getState()).farmZoneMonsters
          if (newFarmZoneMonsters) nextMonster = newFarmZoneMonsters[0]
        } else if (!isFarming) {
          dispatch(setZoneInView(currentZone))
        } else throw new Error("Logic error during farm zone transition")
      } else throw new Error("Logic error during highest zone transition")

      // Stage transition case
    } else {
      dispatch(incrementStageNumber())
      if (zoneInView < currentZone && farmZoneMonsters) {
        nextMonster = farmZoneMonsters[stageNumber]
      } else {
        nextMonster = zoneMonsters[stageNumber]
      }
    }
    // Spawn the next monster when we didn't jump to zoneInView transition
    if (nextMonster) {
      dispatch(spawnMonster(nextMonster))
    }
  }

  useEffect(() => {
    let nextMonster: undefined | EnemyState

    if (currentZone === zoneInView && !isFarming) {
      const monsterFromThisZone = monsterLevel >= currentZone * 30 - 29
      // If zone in view changed due to progression, do nothing; else return currentZone to view
      if (monsterFromThisZone) {
        return
      } else {
        nextMonster = zoneMonsters[currentStageNumber - 1]
      }
    }

    // Zone in view changed due to farming toggle or previous zone selection
    // Spawn monster from another zone
    if (farmZoneNumber === zoneInView && farmZoneMonsters) {
      nextMonster = farmZoneMonsters[0]
    }

    if (nextMonster) {
      dispatch(spawnMonster(nextMonster))
    } else throw new Error("Monster undefined during zone transition")
  }, [zoneInView])

  const handleProgress = useCallback(
    (delta: number): number => {
      while (delta >= TICK_TIME) {
        tickCount.current++

        dealDamageOverTime()
        // More than 30 seconds behind, use catchup flag to prevent save spam
        if (delta >= 30000) {
          runTasks(true)
        } else {
          runTasks()
        }
        const monsterDied = selectMonsterAlive(store.getState()) === false
        if (monsterDied) onMonsterDeath()

        if (lastSaveCatchUpRef.current && delta <= 100) dispatch(clearCatchUpTime())
        delta -= TICK_TIME
      }
      return delta
    },
    [tickCount, dealDamageOverTime, runTasks, store, onMonsterDeath, dispatch],
  )

  const handleOfflineProgress = useCallback(
    async (delta: number, long?: boolean): Promise<number> => {
      dispatch(setLoading(true))
      await new Promise((resolve) => setTimeout(resolve, 0))
      try {
        if (long) {
          // TODO: Fullscreen catchup with asynchronous break
          // Split into chunks, await new Promise(resolve => setTimeout(resolve, 0))
          console.warn("Reduced offline progression to 1 hour because long catchup is yet to be implemented")
          delta = 3600000
          delta = handleProgress(delta)
        } else {
          // console.log("Processing offline ticks:", delta / TICK_RATE)
          delta = handleProgress(delta)
        }
      } catch (err) {
        console.error("Offline progress failed:", err)
      } finally {
        dispatch(setLoading(false))
      }
      return delta
    },

    [saveGame, handleProgress],
  )

  const gameLoop = useCallback(
    (currentTime: number) => {
      let delta: number
      if (lastSaveCatchUpRef.current) {
        delta = Date.now() - lastSaveCatchUpRef.current
        dispatch(clearCatchUpTime())
      } else {
        delta = currentTime - lastFrameTime.current
      }

      const handleCatchUp = async () => {
        delta = delta > 3600000 ? await handleOfflineProgress(delta, true) : await handleOfflineProgress(delta)
        lastFrameTime.current = currentTime - (delta % TICK_TIME)
        frameRef.current = requestAnimationFrame(gameLoop)
      }

      if (delta <= 600000) {
        delta = handleProgress(delta)
        lastFrameTime.current = currentTime - (delta % TICK_TIME)
        frameRef.current = requestAnimationFrame(gameLoop)
        if (loading) dispatch(setLoading(false))
        return
      }

      handleCatchUp()
    },
    [onMonsterDeath, handleOfflineProgress, handleProgress],
  )

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (frameRef.current) {
          cancelAnimationFrame(frameRef.current)
          frameRef.current = undefined
        }
      } else {
        setTimeout(() => {
          if (!frameRef.current) {
            frameRef.current = requestAnimationFrame(gameLoop)
          }
        }, 0)
      }
    }
    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange)
  }, [gameLoop])

  useEffect(() => {
    frameRef.current = requestAnimationFrame(gameLoop)
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
    }
  }, [gameLoop])

  function handleClick() {
    dispatch(updateMonsterClicked(clickDamage))
    // Goto !monsterAlive useEffect if monster died
  }

  useEffect(() => {
    if (!monsterAlive) onMonsterDeath()
  }, [monsterAlive, onMonsterDeath])

  return (
    <>
      <div className="flex flex-col w-full items-center">
        <div className="relative flex w-full justify-center text-2xl">
          <div className="text-center">{monsterName}</div>
        </div>
        <div className="">{children}</div>
      </div>
      <button className="flex flex-grow items-end h-[27rem] max-h-[34rem] hover:cursor-dagger" onClick={handleClick}>
        <img
          className="max-h-full h-full w-full object-cover lg:object-contain pointer-events-none"
          src={monsterImage}
          alt={monsterName}
        />
      </button>
    </>
  )
}
