import React from "react"
import clsx from "clsx/lite"

interface LevelUpProps {
  id: string
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void
  currentLevel: number
  levelUpCost: number
  isAffordable: boolean
}

export default function LevelUpButton({ id, onClick, currentLevel, levelUpCost, isAffordable }: LevelUpProps) {
  return (
    <div className="border-4 border-amber-950 bg-amber-950">
      <button
        disabled={!isAffordable}
        id={id}
        className={clsx(
          // This buttons frame has a nice texture when disabled, need to find way to reproduce it when enabled
          // Base
          "flex flex-col items-center py-2 px-4 min-w-32 text-white font-bold",
          "border-2 border-amber-300",
          "transition-all duration-75",
          "shadow-[0_0_4px_0px_rgba(251,191,36,0.9),inset_0_0_4px_-1px_rgba(251,191,36,0.8)]",

          // Enabled
          "enabled:hover:border-amber-200",
          "enabled:hover:shadow-[0_0_6px_0px_rgba(251,191,36,1),inset_0_0_6px_-1px_rgba(251,191,36,0.9)]",

          // Pressed
          "enabled:active:translate-y-0.5",
          "enabled:active:shadow-[0_0_3px_0px_rgba(251,191,36,0.8),inset_0_0_8px_-1px_rgba(251,191,36,1)]",
          "enabled:active:border-amber-400",

          isAffordable ? "bg-blue-500 hover:bg-blue-600 active:bg-blue-700" : "bg-blue-950 border-amber-950",
        )}
        onClick={onClick}>
        <span>Level {currentLevel}</span>
        <span>
          <img className="w-[1.4rem] inline-block self-center" src="/icons/coin.png" alt="gold coin" /> {levelUpCost}
        </span>
      </button>
    </div>
  )
}