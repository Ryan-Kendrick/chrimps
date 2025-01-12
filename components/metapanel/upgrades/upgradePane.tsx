import clsx from "clsx/lite"
import { useEffect, useState } from "react"
import { useAppDispatch, useAppSelector } from "../../../redux/hooks"
import {
  initialiseElement,
  selectGCanAfford,
  selectAdventurerLevelUpCost,
  selectWarriorLevelUpCost,
  selectPlayerState,
} from "../../../redux/playerSlice"
import MultiplierUpgrade from "./multiplierUpgrade"
import { UPGRADE_CONFIG } from "../../../gameconfig/upgrades"
import { Upgrade, UpgradeIdWithLevel, HeroName, UpgradeProps } from "../../../models/upgrades"
import LevelUpButton from "./levelUpButton"
import { selectCurrentZoneNumber } from "../../../redux/zoneSlice"
import { initSelectorMap } from "../../../gameconfig/utils"

interface UpgradePaneProps {
  config: Upgrade
  damage: number
  multiIcons: JSX.Element[]
  onUpgrade: (e: React.MouseEvent<HTMLDivElement>, hidden: boolean, cost: number, isAffordable: boolean) => void
  onLevelUp: (e: React.MouseEvent<HTMLButtonElement>) => void
}

export default function UpgradePane({ config, damage, multiIcons, onUpgrade, onLevelUp }: UpgradePaneProps) {
  const dispatch = useAppDispatch()
  const [upgradeName] = config.elementId.split("-")
  const thisUpgradeName = upgradeName as HeroName

  const { adventurerLevel, adventurerMultiUpgradeCount, dotLevel, dotMultiUpgradeCount } =
    useAppSelector(selectPlayerState)

  const upgradeProps: UpgradeProps = {
    adventurer: {
      level: adventurerLevel,
      upgradeCount: adventurerMultiUpgradeCount,
      levelUpCost: useAppSelector(selectAdventurerLevelUpCost),
    },
    warrior: {
      level: dotLevel,
      upgradeCount: dotMultiUpgradeCount,
      levelUpCost: useAppSelector(selectWarriorLevelUpCost),
    },
  }
  const thisUpgradeProps = upgradeProps[thisUpgradeName]

  const canAffordLevelUp = useAppSelector(selectGCanAfford(thisUpgradeProps.levelUpCost))
  const canAffordMultiUpgrade = useAppSelector(
    selectGCanAfford(UPGRADE_CONFIG.calcMultiCost(config.elementId, thisUpgradeProps.upgradeCount)),
  )

  const currentZoneNumber = useAppSelector(selectCurrentZoneNumber)

  const [shouldMount, setShouldMount] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [animationComplete, setAnimationComplete] = useState(false)

  const isNotClick = upgradeName !== "click"

  const thisSelector = isNotClick ? initSelectorMap[thisUpgradeName] : null
  const hasInitialised = isNotClick ? thisSelector && useAppSelector(thisSelector) : true

  useEffect(() => {
    if (isNotClick) {
      // If already initialised, skip animation sequence
      if (hasInitialised) setAnimationComplete(true)
      // Once animation is completed, dispatch to store
      if (animationComplete && !hasInitialised) dispatch(initialiseElement(thisUpgradeName))
    }

    if (currentZoneNumber >= config.visibleAtZone && !shouldMount) {
      setShouldMount(true)
      const fadeinTimeout = setTimeout(() => {
        setIsVisible(true)
        const preventFurtherAnimations = setTimeout(() => {
          setAnimationComplete(true)
        }, 500)
        return () => clearTimeout(preventFurtherAnimations)
      }, 350)
      return () => clearTimeout(fadeinTimeout)
    }
  }, [currentZoneNumber, config.visibleAtZone, hasInitialised, animationComplete])

  if (!shouldMount && isNotClick) return null

  return (
    <div
      className={clsx(
        "flex w-full items-start justify-between align-start py-4 px-4 gap-2 border-amber-950 transition-opacity duration-1000",
        upgradeName === "click" ? "border-y-2" : "border-b-2",
        isVisible && isNotClick && "opacity-100",
        !animationComplete && !isVisible && isNotClick && "opacity-0",
        animationComplete && "opacity-100 transition-none",
      )}>
      <div className="flex flex-col w-40 items-center">
        <div className="">{config.displayName}</div>
        <div className="self-center">{Math.round(damage)}</div>
        <div className="flex gap-2.5 pt-1">
          {multiIcons.map((icon, i) => (
            <MultiplierUpgrade
              key={upgradeName + i}
              id={`${config.elementId}.${i + 1}` as UpgradeIdWithLevel}
              onClick={onUpgrade}
              icon={icon}
              hidden={i === 0 ? thisUpgradeProps.level < 10 : thisUpgradeProps.upgradeCount < i}
              cost={thisUpgradeProps.levelUpCost}
              isAffordable={canAffordMultiUpgrade}
              isPurchased={thisUpgradeProps.upgradeCount > i}
            />
          ))}
        </div>
      </div>
      <LevelUpButton
        id={upgradeName}
        onClick={onLevelUp}
        currentLevel={thisUpgradeProps.level}
        levelUpCost={thisUpgradeProps.levelUpCost}
        isAffordable={canAffordLevelUp}
      />
    </div>
  )
}
