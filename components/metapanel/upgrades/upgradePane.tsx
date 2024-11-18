import React from "react"
import clsx from "clsx/lite"
import { useAppSelector } from "../../../redux/hooks"
import { selectGold } from "../../../redux/playerSlice"
import MultiplierUpgrade from "./multiplierUpgrade"
import { UPGRADE_CONFIG } from "../../../gameconfig/upgrades"
import { Upgrade } from "../../../models/upgrades"
import { PlayerState } from "../../../models/state"
import LevelUpButton from "./levelUpButton"
import { selectZoneNumber } from "../../../redux/zoneSlice"

interface UpgradePaneProps {
  config: Upgrade
  damage: number
  multiIcons: JSX.Element[]
  onUpgrade: (e: React.MouseEvent<HTMLDivElement>) => void
  onLevelUp: (e: React.MouseEvent<HTMLButtonElement>) => void
}

export default function UpgradePane({ config, damage, multiIcons, onUpgrade, onLevelUp }: UpgradePaneProps) {
  const [upgradeName] = config.elementId.split("-")
  const thisLevelUp = `${upgradeName}Level` as keyof PlayerState
  const thisMultiUpgradeCount = `${upgradeName}MultiUpgradeCount` as keyof PlayerState

  const upgradeLevel = useAppSelector((state) => state.player[thisLevelUp])
  const multiUpgradeCount = useAppSelector((state) => state.player[thisMultiUpgradeCount])
  const cost = config.levelUpCost(upgradeLevel)
  const gold = useAppSelector(selectGold)
  const canAffordLevelUp = gold >= cost
  const zone = useAppSelector(selectZoneNumber)

  return (
    <div
      className={clsx(
        "w-full items-start justify-between align-start py-4 px-4 border-amber-950 transition-opacity duration-1000",
        upgradeName === "click" ? "border-y-2" : "border-b-2",
        zone >= config.visibleAtZone ? "flex" : "hidden",
      )}>
      <div className="flex flex-col w-40 items-center">
        <div className="">{`${upgradeName[0].toUpperCase()}${upgradeName.substring(1)} Damage`}</div>
        <div className="self-center">{damage}</div>
        <div className="flex gap-2.5 pt-1">
          {multiIcons.map((icon, i) => (
            <MultiplierUpgrade
              key={upgradeName + i}
              id={`${upgradeName}-multi.${i + 1}`}
              onClick={onUpgrade}
              icon={icon}
              hidden={i === 0 ? upgradeLevel < 10 : multiUpgradeCount < i}
              isAffordable={gold >= UPGRADE_CONFIG.calcMultiCost(config.elementId, multiUpgradeCount)}
              isPurchased={multiUpgradeCount > i}
            />
          ))}
        </div>
      </div>
      <LevelUpButton
        id={upgradeName}
        onClick={onLevelUp}
        currentLevel={upgradeLevel}
        levelUpCost={cost}
        isAffordable={canAffordLevelUp}
      />
    </div>
  )
}