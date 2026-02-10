import { useAppSelector } from "../../redux/hooks"
import { selectBreakpoint, selectLongCatchupDelta } from "../../redux/metaSlice"
import CombatIndex from "../combat/combatIndex"
import PanelIndex from "../metapanel/panelIndex"
import FullscreenCatchup from "./FullscreenCatchup"
import Navigation from "../nav/navigation"
import { GameEngineProvider } from "./Engine"

export default function Main() {
  const delta = useAppSelector(selectLongCatchupDelta)
  const breakpoint = useAppSelector(selectBreakpoint)
  const renderDesktopNavigation = breakpoint > 1024

  return (
    <>
      <GameEngineProvider />
      {delta ? (
        <FullscreenCatchup />
      ) : (
        <main className="flex flex-1 overflow-visible md:min-h-0">
          <div className="relative flex w-full flex-col-reverse lg:flex-row">
            <PanelIndex />
            <CombatIndex>{renderDesktopNavigation && <Navigation />}</CombatIndex>
          </div>
        </main>
      )}
    </>
  )
}
