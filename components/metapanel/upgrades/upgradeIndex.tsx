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
  selectLevelUpCosts,
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
  const dotDamage = useAppSelector(selectDotDamage)
  const { adventurerLevelUpCost, warriorLevelUpCost, healerLevelUpCost, mageLevelUpCost } =
    useAppSelector(selectLevelUpCosts)
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
      cost: healerLevelUpCost,
      canAfford: useAppSelector(selectGCanAfford(healerLevelUpCost)),
      action: updateDotDamage("healer-levelup"),
    },
    mage: {
      // TODO: replace placeholder values
      cost: mageLevelUpCost,
      canAfford: useAppSelector(selectGCanAfford(mageLevelUpCost)),
      action: updateDotDamage("mage-levelup"),
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
          OTPIcons={[ClickOTPIcon1(), ClickOTPIcon2(), ClickOTPIcon3()]}
          onUpgrade={onUpgrade}
          onLevelUp={onLevelup}
        />
        <UpgradePane
          config={UPGRADE_CONFIG.warrior}
          OTPIcons={[ClickOTPIcon1(), ClickOTPIcon2(), ClickOTPIcon3()]}
          onUpgrade={onUpgrade}
          onLevelUp={onLevelup}
        />
        <UpgradePane
          config={UPGRADE_CONFIG.healer}
          OTPIcons={[ClickOTPIcon1(), ClickOTPIcon2(), ClickOTPIcon3()]}
          onUpgrade={onUpgrade}
          onLevelUp={onLevelup}
        />
        <UpgradePane
          config={UPGRADE_CONFIG.mage}
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
