import React, { useEffect, useRef, useState } from "react"
import { useAppSelector } from "../../redux/hooks"
import { selectMonsterHealth, selectMonsterMaxHealth } from "../../redux/monsterSlice"
import { selectPlayerState } from "../../redux/playerSlice"
import clsx from "clsx"

export default function Healthbar() {
  const monsterHealth = useAppSelector(selectMonsterHealth)
  const monsterMaxHealth = useAppSelector(selectMonsterMaxHealth)
  const { dotLevel } = useAppSelector(selectPlayerState)

  const targetHealth = useRef((monsterHealth / monsterMaxHealth) * 100)
  const interpRate = 5
  const [width, setWidth] = useState(100)
  const frameRef = useRef<number>()

  useEffect(() => {
    targetHealth.current = (monsterHealth / monsterMaxHealth) * 100

    function animateHealth() {
      setWidth((currentWidth) => {
        const diff = targetHealth.current - currentWidth

        if (Math.abs(diff) < 0.8) return targetHealth.current

        return currentWidth + diff / interpRate
      })
      frameRef.current = requestAnimationFrame(animateHealth)
    }

    if (frameRef.current) cancelAnimationFrame(frameRef.current)

    frameRef.current = requestAnimationFrame(animateHealth)

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
    }
  }, [monsterHealth, monsterMaxHealth])

  let decimals = {}
  if (!dotLevel) {
    decimals = { minimumFractionDigits: 0, maximumFractionDigits: 1 }
  } else {
    decimals = { minimumFractionDigits: 1, maximumFractionDigits: 1 }
  }

  const healthText =
    monsterHealth < 100
      ? monsterHealth.toLocaleString(undefined, { ...decimals })
      : monsterHealth.toLocaleString(undefined, { maximumFractionDigits: 0 })

  return (
    <>
      <div className="text-center">{healthText}</div>
      <div className="relative h-8 w-48 border border-black">
        <div className="relative h-full" style={{ width: `${Math.max(0, Math.min(100, width))}%` }}>
          {/* <div className="absolute w-full top-0 h-1/6 bg-gradient-to-b from-white/60 to-white/0 z-10"></div> */}
          <div className={clsx("h-full bg-gradient-to-b from-hpgreen to-darkgreen rounded-sm transform-gpu")}></div>
          {/* <div className="absolute h-3/4 bottom-0 w-full bg-gradient-to-b from-white/0 via-white/80 to-white/20 z-10"></div> */}
        </div>
      </div>
    </>
  )
}
