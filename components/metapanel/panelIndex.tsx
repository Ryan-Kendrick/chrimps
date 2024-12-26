import React, { useState } from "react"
import UpgradeIndex from "./upgrades/upgradeIndex"
import clsx from "clsx/lite"
import Prestige from "./prestige"

export default function PanelIndex() {
  const [activeTab, setActiveTab] = useState("upgrade")

  const tabs = [
    { id: "upgrade", title: "Upgrades", component: <UpgradeIndex /> },
    { id: "prestige", title: "Prestige", component: <Prestige /> },
  ]

  return (
    <>
      <div
        className={clsx(
          // Base
          "flex flex-col relative lg:basis-3/5 radius rounded-b-xl mx-3 lg:m-6 overflow-y-auto",
        )}>
        <div className="flex gap-1 h-12 w-full">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                "flex cursor-hand items-center shadow-panel-t-1 w-full px-4 py-1.5 text-lg rounded-t-lg",
                activeTab === tab.id
                  ? "bg-gradient-to-b from-amber-400 to-orange-500 border-[3px] border-amber-800 text-white"
                  : "bg-gradient-to-b from-amber-600 to-orange-700 border-[3px] border-black/60 hover:from-amber-400/90 hover:to-orange-500/90 text-orange-900",
              )}>
              {tab.title}
            </button>
          ))}
        </div>
        <div
          className={clsx(
            "h-full shadow-panel rounded-t",
            "bg-gradient-to-tr from-amber-400 via-orange-500 to-purple-950",
            "lg:bg-gradient-to-br lg:from-amber-400 lg:via-orange-500 lg:to-purple-950",
          )}>
          {tabs.find((tab) => tab.id === activeTab)?.component}
        </div>
      </div>
    </>
  )
}
