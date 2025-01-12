import { useAppDispatch, useAppSelector } from "../../../redux/hooks"
import {
  decreaseGold,
  selectGCanAfford,
  selectClickDamage,
  selectDotDamage,
  selectAdventurerLevelUpCost,
  selectWarriorLevelUpCost,
  selectGold,
  updateDotDamage,
  updateClickDamage,
  selectAdventurerDamage,
  selectWarriorDamage,
} from "../../../redux/playerSlice"
import { ClickOTPIcon1, ClickOTPIcon2, ClickOTPIcon3 } from "../../../assets/svg/clickIcons"
import { UPGRADE_CONFIG } from "../../../gameconfig/upgrades"
import { HeroName } from "../../../models/upgrades"
import UpgradePane from "./upgradePane"
import Currency from "../currency"
import { GoldIcon } from "../../../assets/svg/resourceIcons"

export default function UpgradeIndex() {
  const dispatch = useAppDispatch()

  const clickDamage = useAppSelector(selectClickDamage)
  const adventurerDamage = useAppSelector(selectAdventurerDamage)
  const dotDamage = useAppSelector(selectDotDamage)
  const warriorDamage = useAppSelector(selectWarriorDamage)
  const adventurerLevelUpCost = useAppSelector(selectAdventurerLevelUpCost)
  const warriorLevelUpCost = useAppSelector(selectWarriorLevelUpCost)
  const goldSelector = selectGold

  const LevelUp = {
    adventurer: {
      cost: adventurerLevelUpCost,
      canAfford: useAppSelector(selectGCanAfford(adventurerLevelUpCost)),
      action: updateClickDamage("adventurer-levelup"),
    },
    warrior: {
      cost: warriorLevelUpCost,
      canAfford: useAppSelector(selectGCanAfford(warriorLevelUpCost)),
      action: updateDotDamage("warrior-levelup"),
    },
    healer: {
      // TODO: replace placeholder values
      cost: adventurerLevelUpCost,
      canAfford: useAppSelector(selectGCanAfford(adventurerLevelUpCost)),
      action: updateClickDamage("adventurer-levelup"),
    },
    mage: {
      // TODO: replace placeholder values
      cost: adventurerLevelUpCost,
      canAfford: useAppSelector(selectGCanAfford(adventurerLevelUpCost)),
      action: updateClickDamage("adventurer-levelup"),
    },
  }

  function onLevelup(e: React.MouseEvent<HTMLButtonElement>) {
    const levelUpId = e.currentTarget.id as HeroName

    const { cost, canAfford, action } = LevelUp[levelUpId]

    if (canAfford) {
      dispatch(action)
      dispatch(decreaseGold(cost))
    } else {
      throw new Error(`Unexpected levelup target ${levelUpId}`)
    }
  }

  function onUpgrade(
    e: React.MouseEvent<HTMLImageElement> | React.MouseEvent<HTMLDivElement>,
    hidden: boolean,
    cost: number,
    isAffordable: boolean,
  ) {
    const [upgradeId, purchasedUpgradeLevel] = e.currentTarget.id.split(".")
    const upgradeActions = {
      "adventurer-otp": updateClickDamage("adventurer-otp"),
      "warrior-otp": updateDotDamage("warrior-otp"),
    }

    if (isAffordable && !hidden) {
      dispatch(upgradeActions[upgradeId as keyof typeof upgradeActions])
      dispatch(decreaseGold(cost))
    } else {
      throw new Error(`Unexpected upgrade target ${upgradeId}`)
    }
  }

  return (
    <>
      <Currency image={GoldIcon()} fontstyle="text-white font-outline-2" currencySelector={goldSelector} />
      <div className="flex flex-col flex-1">
        <UpgradePane
          config={UPGRADE_CONFIG.adventurer}
          damage={adventurerDamage}
          OTPIcons={[ClickOTPIcon1(), ClickOTPIcon2(), ClickOTPIcon3()]}
          onUpgrade={onUpgrade}
          onLevelUp={onLevelup}
        />
        <UpgradePane
          config={UPGRADE_CONFIG.warrior}
          damage={warriorDamage}
          OTPIcons={[ClickOTPIcon1(), ClickOTPIcon2(), ClickOTPIcon3()]}
          onUpgrade={onUpgrade}
          onLevelUp={onLevelup}
        />
        {dotDamage > 0 && (
          <div className="flex gap mt-auto mb-2">
            <div className="flex-col text-white place-items-center w-full">
              <h2 className="text-2xl font-outline">Total</h2>
              <div className="flex text-lg w-full justify-evenly">
                <h3>Click Damage: {Math.round(clickDamage)}</h3>
                <h3>Damage Over Time: {Math.round(dotDamage)}</h3>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
