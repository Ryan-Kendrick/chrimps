import { PropsWithChildren, useEffect, useState } from "react"
import clsx from "clsx/lite"
import { useAppSelector } from "../../redux/hooks"
import { selectCurrentZoneNumber } from "../../redux/zoneSlice"
import MonsterHealth from "./monsterHealth"
import Monster from "./monster"
import ZoneMap from "./zoneMap"
import ZoneSelector from "./zoneSelector"
import FarmToggle from "./farmToggle"
import Spotlight from "../miscellanious/Spotlight"

export default function CombatIndex({ children }: PropsWithChildren) {
  const currentZoneNumber = useAppSelector(selectCurrentZoneNumber)

  const [shouldMount, setShouldMount] = useState(false)
  const [fadeIn, setFadeIn] = useState(false)
  const [hasFadedIn, setHasFadedIn] = useState(false)

  useEffect(() => {
    if (currentZoneNumber > 5 && !hasFadedIn) {
      setHasFadedIn(true)
    } else if (currentZoneNumber > 4 && !shouldMount) {
      setShouldMount(true)
      const timeout = setTimeout(() => setFadeIn(true), 350)
      return () => clearTimeout(timeout)
    }
  }, [currentZoneNumber])

  return (
    <div className="relative flex flex-col text-white lg:min-h-[822px] lg:basis-2/5 xl:min-h-[753px]">
      {/* Background */}

      <div className="pointer-events-none absolute inset-0 -z-20">
        <div className="absolute aspect-square h-full w-full -translate-x-[15%] translate-y-[20%] scale-[1.5] rounded-full bg-gradient-to-b from-yellow-400 to-orange-600 blur-3xl lg:aspect-[4/5] lg:w-auto lg:-translate-x-[10%] lg:scale-[1.55] xl:-translate-x-[20%] xl:scale-[1.6] 2xl:scale-[1.7]" />
        <div className="absolute aspect-square h-full w-full scale-[1.5] rounded-full bg-gradient-to-r from-purple-700 to-violet-900 blur-3xl lg:aspect-[4/5] lg:w-auto lg:scale-[1.45] xl:scale-[1.5] 2xl:scale-[1.6]" />

        <Spotlight />
      </div>

      <div
        className={clsx(
          "relative z-0 flex h-full w-full flex-col items-center overflow-hidden",
          currentZoneNumber > 4 ? "justify-normal" : "justify-evenly",
        )}>
        {/* Absolutely positioned content container to ignore bg overflow */}
        <div className="static inset-0 lg:absolute">
          <div className="flex h-full w-full flex-col items-center">
            {currentZoneNumber > 4 && (
              <div
                className={clsx(
                  "flex w-full justify-center opacity-0 duration-1000 xl:px-2",
                  shouldMount ? "transition-opacity" : "transition-none",
                  fadeIn && "opacity-100",
                  hasFadedIn && "opacity-100 transition-none",
                )}>
                <ZoneSelector />
              </div>
            )}

            {currentZoneNumber > 4 && (
              <div
                className={clsx(
                  "opacity-0 duration-300",
                  shouldMount ? "transition-opacity" : "transition-none",
                  fadeIn && "opacity-100",
                  hasFadedIn && "opacity-100 transition-none",
                )}>
                <FarmToggle />
              </div>
            )}
            <Monster>
              <MonsterHealth />
            </Monster>
            <ZoneMap />
          </div>
        </div>
      </div>
      <div className="items-between hidden lg:block">{children}</div>
    </div>
  )
}
