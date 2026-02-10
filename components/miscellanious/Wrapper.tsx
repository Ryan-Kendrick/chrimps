import { PropsWithChildren } from "react"
import { useBreakpointObserver, useForcedDPI } from "../../gameconfig/customHooks"
import { useAppSelector } from "../../redux/hooks"
import { selectBreakpoint } from "../../redux/metaSlice"
import { selectPrestigeCount } from "../../redux/statsSlice"
import { selectCurrentZoneNumber } from "../../redux/zoneSlice"
import { UPGRADE_CONFIG } from "../../gameconfig/upgrades"
import clsx from "clsx/lite"
import Navigation from "../nav/navigation"

export default function Wrapper({ children }: PropsWithChildren) {
  // Reverse OS DPI scaling so the game looks as intended on high resolution displays
  const currentScale = useForcedDPI()
  const inverseScale = 1 / currentScale

  const appScale: React.CSSProperties | undefined =
    inverseScale !== 1
      ? {
          transform: `scale(${inverseScale})`,
          transformOrigin: "top left",
          width: `${100 * currentScale}vw`,
          height: `${100 * currentScale}vh`,
          position: "absolute",
          top: 0,
          left: 0,
        }
      : undefined

  // Track screen width globally
  const breakpoint = useAppSelector(selectBreakpoint)
  useBreakpointObserver(breakpoint)

  const renderDesktopNavigation = breakpoint > 1024

  // Force component remount on prestige
  const prestigeCount = useAppSelector(selectPrestigeCount)

  const isHealerVisible = useAppSelector(selectCurrentZoneNumber) > UPGRADE_CONFIG.healer.visibleAtZone

  return (
    <div
      key={`prestige-${prestigeCount}`}
      style={appScale}
      className={clsx(
        "min-h-screen w-screen cursor-inactive select-none overflow-hidden font-sigmar lg:h-screen lg:max-h-screen",
        isHealerVisible &&
          "lg:[@media(max-height:898px)]:max-h-auto lg:[@media(max-height:898px)]:h-auto lg:[@media(max-height:898px)]:overflow-y-auto lg:[@media(max-height:898px)]:overflow-x-hidden",
      )}>
      <div className="relative z-0 flex h-full w-full flex-col-reverse overflow-hidden bg-amber-200 md:flex-col lg:pt-1 lg:[@media(max-height:898px)]:min-h-[906px] lg:[@media(max-height:898px)]:pb-3">
        {!renderDesktopNavigation && (
          <div className="flex-none lg:hidden">
            <Navigation />
          </div>
        )}
        {children}
      </div>
    </div>
  )
}
