import React, { memo } from "react"
import { PrestigeUpgradeId } from "../../../models/upgrades"
import { UPGRADE_CONFIG } from "../../../gameconfig/upgrades"
import clsx from "clsx/lite"

interface Props {
  visible: boolean
  position: { x: number; y: number }
  tooltipRef: React.RefObject<HTMLDivElement | null>
  hoveredUpgrade: PrestigeUpgradeId | null
}

export default memo(function PrestigeTooltip({ visible, position, tooltipRef, hoveredUpgrade }: Props) {
  const upgrade = hoveredUpgrade ? UPGRADE_CONFIG.prestigeUpgrades[hoveredUpgrade] : null

  return (
    <div
      ref={tooltipRef}
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
        visibility: visible ? "visible" : "hidden",
      }}
      className="pointer-events-none absolute z-20 w-max max-w-64 border-b-[1px] border-l-[3px] border-r-[3px] border-t-[1px] border-white border-b-electricBlue border-t-electricBlue bg-slate-800 px-1 font-passion text-frost">
      <h3 className="text-center text-2xl">{upgrade?.displayName}</h3>
      <div className="text-lg">
        {upgrade?.tooltip?.split("\n").map((tooltipLine, i) => (
          <p key={i} className={clsx("mb-0", i > 0 && "last:text-center last:text-emerald-400")}>
            {tooltipLine}
          </p>
        ))}
      </div>
    </div>
  )
})
