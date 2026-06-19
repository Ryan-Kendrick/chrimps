import clsx from "clsx/lite"
import coinURL from "/assets/icons/coin.png"
import { formatSmallNumber } from "../../../gameconfig/utils"
import { SnakeBorder } from "../../miscellanious/SnakeBorder"

interface LevelUpProps {
  id: string
  onLevelUp: (e: React.MouseEvent<HTMLButtonElement>) => void
  currentLevel: number
  levelUpCost: number
  isAffordable: boolean
  hoveredOTPUpgrade: number | null
  OTPUpgradeCount: number
  nextOTPCost: number
  purchaseOTPUpgrade: () => void
}

export default function LevelUpButton({
  id,
  onLevelUp,
  currentLevel,
  levelUpCost,
  isAffordable,
  hoveredOTPUpgrade,
  OTPUpgradeCount,
  nextOTPCost,
  purchaseOTPUpgrade,
}: LevelUpProps) {
  const formattedLevelUpCost = formatSmallNumber(levelUpCost)
  const formattedOTPCost = nextOTPCost && formatSmallNumber(nextOTPCost)

  const displayOTPCost = hoveredOTPUpgrade && OTPUpgradeCount < hoveredOTPUpgrade

  return (
    <div className="w-full border-2 border-amber-900 ring-1 ring-amber-950 md:w-auto">
      <div className="relative w-full border-4 border-amber-950 bg-amber-950 md:w-auto">
        <button
          disabled={!isAffordable}
          id={id}
          className={clsx(
            // Base
            "flex w-full min-w-32 cursor-active flex-col items-center py-2 font-paytone text-xl text-white disabled:cursor-inactive md:w-auto",
            "border-2 border-amber-300",
            "transition-transform duration-75",
            "shadow-[0_0_8px_0px_rgba(251,191,36,0.9),inset_0_0_4px_-1px_rgba(251,191,36,0.8)]",

            // Enabled state
            "enabled:hover:border-amber-200",
            "enabled:hover:shadow-[0_0_6px_0px_rgba(251,191,36,1),inset_0_0_6px_-1px_rgba(251,191,36,0.9)]",

            // Pressed state
            "peer",
            "enabled:active:translate-y-0.5",
            "enabled:active:shadow-[0_0_3px_0px_rgba(251,191,36,0.8),inset_0_0_8px_-1px_rgba(251,191,36,1)]",
            "enabled:active:border-amber-400",

            isAffordable ? "bg-blue-600 hover:bg-blue-700 active:bg-blue-950" : "border-amber-950 bg-blue-950",
          )}
          onPointerUp={displayOTPCost ? purchaseOTPUpgrade : onLevelUp}>
          {/* If there is a hovered OTP upgrade, display cost when on mobile */}
          {displayOTPCost ? (
            <>
              <span className="z-30 block lg:hidden">Upgrade</span>
              <span className="z-30 hidden lg:block">Level {currentLevel}</span>
            </>
          ) : (
            <span className="z-30">Level {currentLevel}</span>
          )}
          <span className="text-lg">
            <img className="inline-block w-[1.4rem] self-center" src={`${coinURL}`} alt="gold coin" />{" "}
            {displayOTPCost ? (
              <>
                <span className="inline lg:hidden">{formattedOTPCost}</span>
                <span className="hidden lg:inline">{formattedLevelUpCost}</span>
              </>
            ) : (
              formattedLevelUpCost
            )}
          </span>
        </button>

        {/* Inner button borders */}
        {/* Top, left, bottom */}
        <div
          className={clsx(
            "pointer-events-none absolute inset-0 z-20 m-[2px] transition-transform duration-75",
            "border-2 border-l-4 border-t-4 border-b-[#062A77] border-l-[#8289c7] border-t-[#EBEBEB]",

            // Disabled state
            "peer-disabled:border-b-[#041d54] peer-disabled:border-l-[#565da1] peer-disabled:border-t-[#9d9d9d]",

            // Button pressed state
            "peer-enabled:peer-active:translate-y-0.5 peer-enabled:peer-active:border-l-[6px] peer-enabled:peer-active:border-t-[6px] peer-enabled:peer-active:border-b-[#031130] peer-enabled:peer-active:border-l-[#2f356a] peer-enabled:peer-active:border-t-[#4d4d4d]",
          )}
        />
        {/* Right */}
        <div
          className={clsx(
            "absolute bottom-[2px] right-[2px] top-[2px] z-20 w-[2px] bg-gradient-to-b from-[#EBEBEB] via-[#343F66] to-[#052058] transition-transform duration-75",

            // Disabled state
            "peer-disabled:from-[#9d9d9d] peer-disabled:via-[#565da1] peer-disabled:to-[#041d54]",

            // Button pressed state
            "peer-enabled:peer-active:translate-y-0.5 peer-enabled:peer-active:from-[#4d4d4d] peer-enabled:peer-active:via-[#2f356a] peer-enabled:peer-active:to-[#031130]",
          )}
        />

        {/* Inner button shine gradient */}
        <div
          className={clsx(
            "absolute inset-x-0 bottom-3/4 top-0 z-20 ml-1 mr-1 mt-1 bg-blue-300/50 transition-transform duration-75",
            "pointer-events-none peer-enabled:peer-active:ml-2 peer-enabled:peer-active:mt-2 peer-enabled:peer-active:translate-y-0.5 peer-enabled:peer-active:bg-blue-300/30",
          )}
        />
        <div
          className={clsx(
            "absolute inset-x-0 bottom-1/2 top-[calc(25%+0.0009rem)] z-20 ml-1 mr-1 rounded-bl bg-gradient-to-t from-blue-300/0 to-blue-300/50 transition-transform duration-75",
            "pointer-events-none peer-enabled:peer-active:ml-2 peer-enabled:peer-active:translate-y-0.5 peer-enabled:peer-active:from-blue-300/0 peer-enabled:peer-active:to-blue-300/30",
          )}
        />
      </div>{" "}
    </div>
  )
}
