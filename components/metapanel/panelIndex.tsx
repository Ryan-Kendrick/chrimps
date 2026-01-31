import React, { ReactNode, useEffect, useMemo, useRef, useState } from "react"
import UpgradeIndex from "./upgrades/upgradeIndex"
import clsx from "clsx/lite"
import Prestige from "./prestige/prestige"
import { Tab, TabData } from "../../models/player"
import { useAppDispatch, useAppSelector } from "../../redux/hooks"
import {
  selectHasPlasma as selectHasFoundPlasma,
  selectTabInView,
  selectTabAnimationComplete,
  setTabInView,
  incrementUIProgression,
  selectOneLineMaskVisible,
  selectDotDamage,
  selectRespawnTime,
} from "../../redux/playerSlice"
import { selectCurrentZoneNumber } from "../../redux/zoneSlice"
import { UPGRADE_CONFIG } from "../../gameconfig/upgrades"
import { selectAnimationPref, selectBreakpoint } from "../../redux/metaSlice"
import PlayerHealth from "./playerHealth"

export default function PanelIndex() {
  const dispatch = useAppDispatch()

  const currentZone = useAppSelector(selectCurrentZoneNumber)
  const activeTab = useAppSelector(selectTabInView)
  const hasFoundPlasma = useAppSelector(selectHasFoundPlasma)
  const tabAnimationComplete = useAppSelector(selectTabAnimationComplete)
  const breakpoint = useAppSelector(selectBreakpoint)
  const [isWarriorVisible, isHealerVisible, isMageVisible] = [
    currentZone >= UPGRADE_CONFIG.warrior.visibleAtZone,
    currentZone >= UPGRADE_CONFIG.healer.visibleAtZone,
    currentZone >= UPGRADE_CONFIG.mage.visibleAtZone,
  ]
  const [tabHeight, setTabHeight] = useState(0)
  const isMobile = breakpoint === 768
  const tabRef = useRef<HTMLDivElement>(null)
  const oneLineMaskVisible = useAppSelector(selectOneLineMaskVisible)
  const dotDamage = useAppSelector(selectDotDamage)
  const animationPref = useAppSelector(selectAnimationPref)

  const respawnTime = useAppSelector(selectRespawnTime)
  const timerRef = useRef<NodeJS.Timeout | null | undefined>(null)
  const respawnSessionRef = useRef<number>(0)
  const [currentRespawnTime, setCurrentRespawnTime] = useState(0)

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }

    if (respawnTime > 0) {
      if (respawnTime !== respawnSessionRef.current) {
        respawnSessionRef.current = respawnTime
        setCurrentRespawnTime(respawnTime / 1000)
        return
      }

      if (currentRespawnTime > 0) {
        // Faster countdown for the first second so it can flash "0" briefly
        const time = currentRespawnTime === respawnTime / 1000 ? 910 : 1000
        timerRef.current = setTimeout(() => {
          setCurrentRespawnTime((prev) => Math.max(0, prev - 1))
        }, time)
      }
    } else {
      respawnSessionRef.current = 0
      setCurrentRespawnTime(0)
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
    }
  }, [respawnTime, currentRespawnTime])

  const PlayerHealthMemo = useMemo(
    () => <PlayerHealth respawnTime={respawnTime} currentRespawnTime={currentRespawnTime} />,
    [respawnTime, currentRespawnTime],
  )

  const tabs = useMemo(() => {
    const tabsToRender: TabData[] = [
      {
        id: "upgrade",
        title: "Upgrade",
        component: <UpgradeIndex PlayerHealthMemo={PlayerHealthMemo} />,
        activeStyle: "text-white",
        inactiveStyle: "",
      },
    ]

    if (hasFoundPlasma) {
      tabsToRender.push({
        id: "prestige",
        title: "Prestige",
        component: <Prestige PlayerHealthMemo={PlayerHealthMemo} />,
        activeStyle: "text-frost font-outline-electricBlue",
        inactiveStyle: "",
      })
    }

    return tabsToRender
  }, [hasFoundPlasma, PlayerHealthMemo])

  useEffect(() => {
    if (tabRef.current) {
      setTabHeight(hasFoundPlasma ? tabRef.current.scrollHeight : 0)
      if (oneLineMaskVisible && !tabAnimationComplete) {
        const timeout = setTimeout(() => dispatch(incrementUIProgression()), 1100)
        return () => clearTimeout(timeout)
      }
    }
  }, [hasFoundPlasma])

  const handleTabChange = (tabId: Tab) => {
    if (tabId !== activeTab) {
      if (!document.startViewTransition) {
        dispatch(setTabInView(tabId))
      } else {
        document.startViewTransition(() => {
          dispatch(setTabInView(tabId))
        })
      }
    }
  }

  interface MaskConfig {
    top: number
    chainImg: string[]
    mask: string
  }
  const getMaskState = (): MaskConfig | null => {
    let top = 200
    const chainImg = []
    let mask = ""

    if (activeTab !== "upgrade") return null
    if (!isWarriorVisible) {
      if (hasFoundPlasma) {
        chainImg.push("bg-chainsLeftBottom", "bg-chainsRightBottom")
        top -= 285
        mask = "mask-postPrestige"
      }
    } else if (!isMobile) {
      if (!isMageVisible && !isHealerVisible) {
        if (!oneLineMaskVisible || (!dotDamage && !hasFoundPlasma)) {
          // Wait for the cue from heroCard.tsx that the animations are in the right state & damageTotals component visible
          return null
        } else {
          chainImg.push("bg-chainsLeftBottom", "bg-chainsRightBottom")
          top -= 369
          if (hasFoundPlasma) top += 48
          mask = "mask-single"
        }
      } else if (isHealerVisible) {
        chainImg.push("bg-chainsLeft", "bg-chainsRight")
        mask = "mask-full"
      }
    } else {
      if (!isMageVisible && !isHealerVisible) {
        if (!oneLineMaskVisible || (!dotDamage && !hasFoundPlasma)) {
          // Warrior unlocked, zone selector not visible
          mask = "mask-mobile-single"
        } else {
          chainImg.push("bg-chainsLeft", "bg-chainsRight")
          mask = "mask-mobile-double"
        }
      } else if (!isMageVisible && isHealerVisible) {
        chainImg.push("bg-chainsLeft", "bg-chainsRight")
        mask = "mask-mobile-triple"
      } else {
        chainImg.push("bg-chainsLeft", "bg-chainsRight")
        mask = "mask-mobile-full"
      }
    }
    return { top, chainImg, mask }
  }
  const maskClasses = getMaskState()

  const renderMobileChains = (): ReactNode => {
    let j = 0
    const elements = []

    if (maskClasses && maskClasses.mask === "mask-mobile-full") {
      j = 4
    } else if (maskClasses && maskClasses.mask === "mask-mobile-triple") {
      j = 3
    } else if (maskClasses && maskClasses.mask === "mask-mobile-double") {
      j = 2
    }

    if (j === 0) {
      elements.push(
        <React.Fragment key={1}>
          <div
            key={`left-${1}`}
            style={{ top: `${-36}px` }}
            className={clsx(
              `pointer-events-none absolute h-full w-[311px]`,
              "left-0 bg-no-repeat",
              "bg-chainsLeftBottom",
            )}
          />
          <div
            key={`right-${1}`}
            style={{ top: `${-36}px` }}
            className={clsx(
              `pointer-events-none absolute h-full w-[311px]`,
              "right-0 bg-no-repeat",
              "bg-chainsRightBottom",
            )}
          />
        </React.Fragment>,
      )
    } else {
      for (let i = 0; i < j || j === 0; i++) {
        let top = 336 + i * 365 // px to gap plus card height
        if (!hasFoundPlasma) top -= 48

        if (j === 0) {
          elements.push(
            <React.Fragment key={i}>
              <div
                key={`left-${i}`}
                style={{ top: `(${-36}px` }}
                className={clsx(
                  `pointer-events-none absolute h-full w-[311px]`,
                  "left-0 bg-no-repeat",
                  "bg-chainsLeftBottom",
                )}
              />
              <div
                key={`right-${i}`}
                style={{ top: `${-36}px` }}
                className={clsx(
                  `pointer-events-none absolute h-full w-[311px]`,
                  "right-0 bg-no-repeat",
                  "bg-chainsRightBottom",
                )}
              />
            </React.Fragment>,
          )
          break
        }

        const drawFullMask = i === j - 2
        if (drawFullMask) {
          elements.push(
            <React.Fragment key={i}>
              <div
                key={`left-${i}`}
                style={{ top: `${top + 58}px` }}
                className={clsx(
                  `pointer-events-none absolute h-full w-[311px]`,
                  "left-0 bg-no-repeat",
                  "bg-chainsLeft",
                )}
              />
              <div
                key={`right-${i}`}
                style={{ top: `${top + 58}px` }}
                className={clsx(
                  `pointer-events-none absolute h-full w-[311px]`,
                  "right-0 bg-no-repeat",
                  "bg-chainsRight",
                )}
              />
            </React.Fragment>,
          )
          break
        } else {
          elements.push(
            <React.Fragment key={i}>
              <div
                key={`left-${i}`}
                style={{ top: `${top}px` }}
                className={clsx(
                  `pointer-events-none absolute h-full w-[311px]`,
                  "left-0 bg-no-repeat",
                  "bg-chainsLeftPartial",
                )}
              />
              <div
                key={`right-${i}`}
                style={{ top: `${top}px` }}
                className={clsx(
                  `pointer-events-none absolute h-full w-[311px]`,
                  "right-0 bg-no-repeat",
                  "bg-chainsRightPartial",
                )}
              />
            </React.Fragment>,
          )
        }
      }
    }

    return elements
  }

  return (
    <div className="relative mx-2 duration-300 md:mb-3 lg:mx-3 lg:my-0 lg:max-w-[59%] lg:basis-3/5">
      <div className="pointer-events-none absolute right-10 top-0 -z-20 aspect-square h-full w-full scale-[1.5] overflow-clip rounded-full bg-gradient-to-r from-amber-950 to-amber-800 blur-3xl md:scale-[1.45]" />
      <div
        className={clsx(
          "flex flex-col rounded-b-xl",
          !isWarriorVisible && "px-2 sm:px-4 md:px-8 xl:pr-14 2xl:pr-24",
          oneLineMaskVisible ? "transition-none" : "transition-[padding]",
        )}>
        {isMobile ? (
          renderMobileChains()
        ) : (
          <>
            <div
              style={{ top: `${maskClasses?.top}px` }}
              className={clsx(
                `pointer-events-none absolute hidden h-[150%] w-[311px] md:block`,
                "left-16 bg-no-repeat",
                maskClasses && maskClasses.chainImg[0],
              )}
            />
            <div
              style={{ top: `${maskClasses?.top}px` }}
              className={clsx(
                `pointer-events-none absolute hidden h-[150%] w-[311px] md:block`,
                "right-16 bg-no-repeat",
                maskClasses && maskClasses.chainImg[1],
              )}
            />
          </>
        )}
        <div
          style={{ height: `${tabHeight}px` }}
          className={clsx(tabAnimationComplete ? "transition-none" : "transition-[height] duration-1000")}>
          {hasFoundPlasma && (
            <div ref={tabRef} className="z-10 flex h-12 w-full gap-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={clsx(
                    "relative flex w-full items-center overflow-hidden rounded-t-lg px-4 py-1.5 shadow-panel-t-1",
                    animationPref > 0 && "before:transition-all",
                    activeTab === tab.id
                      ? "cursor-inactive rounded-t-xl border-b-0 border-l-[3px] border-r-[3px] border-t-[3px] border-amber-700 border-orange-200 bg-frost bg-gradient-to-b from-orange-300 via-orange-400 to-orange-600 pb-[9px] before:absolute before:-left-6 before:-top-4 before:h-24 before:w-48 before:rotate-[55deg] before:bg-amber-950/50 before:blur " +
                          tab.activeStyle
                      : "cursor-active rounded-t-xl border-[3px] border-black/60 border-stone-400 bg-gradient-to-b from-stone-400 via-stone-500 to-stone-600 text-orange-900 shadow-md before:absolute before:-left-4 before:-top-4 before:h-36 before:w-72 before:rotate-45 before:bg-slate-300 before:blur-lg after:absolute after:inset-0 after:-z-10 after:bg-frost hover:border-stone-300 hover:from-orange-400/70 hover:via-stone-400 hover:to-orange-600/70 hover:shadow-lg before:hover:bg-slate-400 " +
                          tab.inactiveStyle,
                  )}>
                  <h2
                    className={clsx("z-10 text-xl drop-shadow", animationPref > 0 && "transition-color, duration-500")}>
                    {tab.title}
                  </h2>
                </button>
              ))}
            </div>
          )}
        </div>
        <div
          id="panel-content"
          className={clsx(
            "panel-content relative z-20 flex flex-col rounded-b-xl rounded-t lg:min-w-[627px]",
            "bg-gradient-to-tr from-amber-400 via-orange-500 to-purpleOrange",
            "lg:bg-gradient-to-br lg:from-amber-400 lg:via-orange-500 lg:to-purpleOrange",
            activeTab === "upgrade" && "shadow-panel-main",
            activeTab === "prestige" && "shadow-panel-prestige",
            maskClasses && maskClasses.mask,
          )}>
          {tabs.find((tab) => tab.id === activeTab)?.component}
        </div>
      </div>
    </div>
  )
}
