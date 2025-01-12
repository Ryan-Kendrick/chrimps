import { useEffect, useMemo, useRef, useState } from "react"
import UpgradeIndex from "./upgrades/upgradeIndex"
import clsx from "clsx/lite"
import Prestige from "./prestige"
import { TabData } from "../../models/player"
import { useAppDispatch, useAppSelector } from "../../redux/hooks"
import { selectPrestigeTabVisible, selectTabInView, setTabInView } from "../../redux/playerSlice"

export default function PanelIndex() {
  const dispatch = useAppDispatch()

  const activeTab = useAppSelector(selectTabInView)
  const prestigeTabVisible = useAppSelector(selectPrestigeTabVisible)
  const [tabHeight, setTabHeight] = useState(0)
  const tabRef = useRef<HTMLDivElement>(null)

  const tabs = useMemo(() => {
    const tabsToRender: TabData[] = [
      {
        id: "upgrade",
        title: "Upgrade",
        component: <UpgradeIndex />,
      },
    ]

    if (prestigeTabVisible) {
      tabsToRender.push({
        id: "prestige",
        title: "Prestige",
        component: <Prestige />,
      })
    }

    return tabsToRender
  }, [prestigeTabVisible])

  useEffect(() => {
    if (tabRef.current) {
      setTabHeight(prestigeTabVisible ? tabRef.current.scrollHeight : 0)
    }
  }, [prestigeTabVisible])

  return (
    <>
      <div
        className={clsx(
          // Base
          "flex flex-col relative lg:basis-3/5 radius rounded-b-xl mx-3 lg:m-6",
        )}>
        <div style={{ height: `${tabHeight}px` }} className="transition-[height]">
          {prestigeTabVisible && (
            <div ref={tabRef} className="flex gap-1 h-12 w-full">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => dispatch(setTabInView(tab.id))}
                  className={clsx(
                    "flex cursor-hand items-center shadow-panel-t-1 w-full px-4 py-1.5 rounded-t-lg",
                    activeTab === tab.id
                      ? "bg-gradient-to-b from-amber-400 to-orange-500 border-[3px] border-amber-800 text-white"
                      : "bg-gradient-to-b from-amber-600 to-orange-700 border-[3px] border-black/60 hover:from-amber-400/90 hover:to-orange-500/90 text-orange-900",
                  )}>
                  <h2 className="text-lg">{tab.title}</h2>
                </button>
              ))}
            </div>
          )}
        </div>
        <div
          className={clsx(
            "flex flex-col grow shadow-panel rounded-t rounded-b-xl",
            "bg-gradient-to-tr from-amber-400 via-orange-500 to-purple-950",
            "lg:bg-gradient-to-br lg:from-amber-400 lg:via-orange-500 lg:to-purple-950",
          )}>
          {tabs.find((tab) => tab.id === activeTab)?.component}
        </div>
      </div>
    </>
  )
}
