import clsx from "clsx"
import { formatSmallNumber } from "../../../gameconfig/utils"
import { useAppSelector } from "../../../redux/hooks"
import { selectClickDamage, selectDotDamage, selectHasPlasma, selectRespawnTime } from "../../../redux/playerSlice"

export default function DamageTotals() {
  const clickDamage = useAppSelector(selectClickDamage)
  const dotDamage = useAppSelector(selectDotDamage)
  const displayClickDamage = formatSmallNumber(clickDamage)
  const displayDotDamage = formatSmallNumber(dotDamage)
  const respawnTime = useAppSelector(selectRespawnTime)

  const hasPrestiged = useAppSelector(selectHasPlasma)

  if (!dotDamage && !hasPrestiged) return null

  return (
    <div className="relative">
      <div className="mb-2 flex h-28">
        <div className="mt-auto flex w-full flex-col items-center justify-end font-arial text-[#2c1810]">
          <h2 className="text-shadow z-10 text-2xl font-extrabold tracking-widest">TOTAL</h2>
          <div className="z-10 flex w-full justify-center gap-6 text-lg font-extrabold">
            <h3>Click: {displayClickDamage}</h3>
            <span className="mt-0.5 text-base opacity-80">|</span>
            <h3>
              Passive:{" "}
              <span className={clsx("transition-opacity", respawnTime > 0 ? "opacity-0" : "opacity-100")}>
                {displayDotDamage}
              </span>
            </h3>
          </div>
        </div>
      </div>
      <div className="absolute inset-0 z-0 bg-gold shadow-panel-main" />
    </div>
  )
}
