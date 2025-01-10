import { useAppDispatch, useAppSelector } from "../../../redux/hooks"
import {
  decreaseGold,
  selectGCanAfford,
  selectClickDamage,
  selectDotDamage,
  selectClickLevelUpCost,
  selectDotLevelUpCost,
  selectGold,
  updateDotDamage,
  updateClickDamage,
  selectAdventurerDamage,
} from "../../../redux/playerSlice"
import { ClickMultiIcon1, ClickMultiIcon2, ClickMultiIcon3 } from "../../../assets/svg/clickIcons"
import { UPGRADE_CONFIG } from "../../../gameconfig/upgrades"
import { UpgradeKey } from "../../../models/upgrades"
import UpgradePane from "./upgradePane"
import Currency from "../currency"
import { GoldIcon } from "../../../assets/svg/resourceIcons"

export default function UpgradeIndex() {
  const dispatch = useAppDispatch()

  const clickDamage = useAppSelector(selectClickDamage)
  const adventurerDamage = useAppSelector(selectAdventurerDamage)
  const dotDamage = useAppSelector(selectDotDamage)
  const clickLevelUpCost = useAppSelector(selectClickLevelUpCost)
  const dotLevelUpCost = useAppSelector(selectDotLevelUpCost)
  const goldSelector = selectGold

  const LevelUp = {
    adventurer: {
      cost: clickLevelUpCost,
      canAfford: useAppSelector(selectGCanAfford(clickLevelUpCost)),
      action: updateClickDamage("levelup"),
    },
    warrior: {
      cost: dotLevelUpCost,
      canAfford: useAppSelector(selectGCanAfford(dotLevelUpCost)),
      action: updateDotDamage("levelup"),
    },
    healer: {},
    mage: {},
  }

  function onLevelup(e: React.MouseEvent<HTMLButtonElement>) {
    const levelUpId = e.currentTarget.id as UpgradeKey

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
      "click-multi": updateClickDamage("multi"),
      "dot-multi": updateDotDamage("multi"),
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
      <div>
        <UpgradePane
          config={UPGRADE_CONFIG.adventurer}
          damage={adventurerDamage}
          multiIcons={[ClickMultiIcon1(), ClickMultiIcon2(), ClickMultiIcon3()]}
          onUpgrade={onUpgrade}
          onLevelUp={onLevelup}
        />
        <UpgradePane
          config={UPGRADE_CONFIG.warrior}
          damage={dotDamage}
          multiIcons={[ClickMultiIcon1(), ClickMultiIcon2(), ClickMultiIcon3()]}
          onUpgrade={onUpgrade}
          onLevelUp={onLevelup}
        />
      </div>
    </>
  )
}
