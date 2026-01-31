import { useAppDispatch, useAppSelector } from "../../../redux/hooks"
import {
  decreaseGold,
  selectGold,
  updateDotDamage,
  updateClickDamage,
  selectHasPlasma,
  selectOneLineMaskVisible,
} from "../../../redux/playerSlice"
import { selectLevelUpCosts } from "../../../redux/shared/heroSelectors"
import {
  ClickOTPIcon1,
  ClickOTPIcon2,
  ClickOTPIcon3,
  ClickOTPIcon4,
  HealerOTPIcon1,
  HealerOTPIcon2,
  HealerOTPIcon3,
  HealerOTPIcon4,
  MageOTPIcon1,
  MageOTPIcon2,
  MageOTPIcon3,
  MageOTPIcon4,
  WarriorOTPIcon1,
  WarriorOTPIcon2,
  WarriorOTPIcon3,
  WarriorOTPIcon4,
} from "../../svgIcons/OTPIcons"
import { UPGRADE_CONFIG } from "../../../gameconfig/upgrades"
import { HeroName, UpgradeId, UpgradeIdWithLevel } from "../../../models/upgrades"
import HeroCard from "./heroCard"
import Currency from "../currency"
import { GoldIcon } from "../../svgIcons/resourceIcons"
import clsx from "clsx/lite"
import { selectCurrentZoneNumber } from "../../../redux/zoneSlice"
import { useTouchObserver } from "../../../gameconfig/customHooks"
import DamageTotals from "./damageTotals"
import { cardProps } from "../../../redux/shared/maps"

export default function UpgradeIndex({ PlayerHealthMemo }: { PlayerHealthMemo: JSX.Element }) {
  const dispatch = useAppDispatch()

  const currentZone = useAppSelector(selectCurrentZoneNumber)

  const gold = useAppSelector(selectGold)
  const { adventurerLevelUpCost, warriorLevelUpCost, healerLevelUpCost, mageLevelUpCost } =
    useAppSelector(selectLevelUpCosts)
  const hasPrestiged = useAppSelector(selectHasPlasma)
  const isHealerVisible = currentZone >= UPGRADE_CONFIG.healer.visibleAtZone
  const isWarriorVisible = currentZone >= UPGRADE_CONFIG.warrior.visibleAtZone
  const isMageVisible = currentZone >= UPGRADE_CONFIG.mage.visibleAtZone
  const oneLineMaskVisible = useAppSelector(selectOneLineMaskVisible)

  const LevelUp = {
    adventurer: {
      OTPCount: useAppSelector(cardProps["adventurer"].upgradeCount),
      cost: adventurerLevelUpCost,
      canAfford: gold >= adventurerLevelUpCost,
    },
    warrior: {
      OTPCount: useAppSelector(cardProps["warrior"].upgradeCount),
      cost: warriorLevelUpCost,
      canAfford: gold >= warriorLevelUpCost,
    },
    healer: {
      OTPCount: useAppSelector(cardProps["healer"].upgradeCount),
      cost: healerLevelUpCost,
      canAfford: gold >= healerLevelUpCost,
    },
    mage: {
      OTPCount: useAppSelector(cardProps["mage"].upgradeCount),
      cost: mageLevelUpCost,
      canAfford: gold >= mageLevelUpCost,
    },
  }

  function onLevelup(e: React.MouseEvent<HTMLButtonElement>) {
    const heroName = e.currentTarget.id as HeroName

    const { cost, canAfford } = LevelUp[heroName]

    if (canAfford) {
      dispatch(updateDotDamage(heroName + "-levelup"))
      dispatch(decreaseGold(cost))
    } else if (!cost) {
      throw new Error(`Unexpected levelup target ${heroName}`)
    }
  }

  function onUpgrade(id: UpgradeIdWithLevel, hidden: boolean, cost: number, isAffordable: boolean) {
    if (!isAffordable || hidden) return

    let upgradeAction
    const [heroId, OTPstr] = id.split(".") as [UpgradeId, string]
    const thisHeroName = heroId.split("-")[0] as HeroName
    const thisHeroOTPCount = LevelUp[thisHeroName].OTPCount

    if (heroId === "adventurer-otp") {
      upgradeAction = updateClickDamage(heroId)
    } else {
      if (thisHeroOTPCount === Number(OTPstr) - 1) {
        upgradeAction = updateDotDamage(heroId)
      } else {
        console.warn(
          `The selected upgrade number ${OTPstr} is not the next upgrade for ${thisHeroName}, expected upgrade ${thisHeroOTPCount + 1}`,
        )
      }
    }

    if (upgradeAction) {
      dispatch(upgradeAction)
      dispatch(decreaseGold(cost))
    } else {
      console.warn("Upgrade handler called and no action was dispatched")
    }
  }

  const touchedHero = useTouchObserver()

  return (
    <div className="flex flex-col">
      <div className="flex w-full flex-col-reverse flex-wrap md:h-auto md:flex-row md:flex-nowrap">
        <Currency
          image={GoldIcon()}
          fontStyle="text-white font-paytone font-outline"
          containerStyle="[border-image:linear-gradient(40deg,#C0C0C0,#868686,#E7E7E7,#868686,#868686)_20] border-2 border-solid border-transparent rounded-t bg-slate-300/20
        after:content-[''] after:w-full after:h-full after:[background:radial-gradient(circle_80px_at_15%_-30%,#E2DFD2,transparent),radial-gradient(circle_80px_at_100%_80%,#36454F80,transparent)]
        "
          innerStyle="currency-gold-inner"
          currencySelector={selectGold}
        />
        {PlayerHealthMemo}
      </div>
      <div className="flex flex-1 flex-col">
        <div
          className={clsx(
            "relative z-50 -mt-1 grid gap-1 md:mt-0",
            isWarriorVisible
              ? isHealerVisible
                ? isMageVisible
                  ? "mb-0 mt-0 grid-cols-1 md:mt-0 md:grid-cols-2"
                  : "mb-0 mt-0 grid-cols-1 md:mt-0 md:grid-cols-2"
                : "-mt-1 mb-0 grid-cols-1 md:mt-0 md:grid-cols-2"
              : "-mt-3 mb-8 grid-cols-1 md:mt-2",
          )}>
          <HeroCard
            config={UPGRADE_CONFIG.adventurer}
            touchedHero={touchedHero}
            OTPIcons={[ClickOTPIcon1(), ClickOTPIcon2(), ClickOTPIcon3()]}
            onUpgrade={onUpgrade}
            onLevelUp={onLevelup}
          />
          <HeroCard
            config={UPGRADE_CONFIG.warrior}
            touchedHero={touchedHero}
            OTPIcons={[WarriorOTPIcon1(), WarriorOTPIcon2(), WarriorOTPIcon3()]}
            onUpgrade={onUpgrade}
            onLevelUp={onLevelup}
          />
          <HeroCard
            config={UPGRADE_CONFIG.healer}
            touchedHero={touchedHero}
            OTPIcons={[HealerOTPIcon1(), HealerOTPIcon2(), HealerOTPIcon3()]}
            onUpgrade={onUpgrade}
            onLevelUp={onLevelup}
          />
          <HeroCard
            config={UPGRADE_CONFIG.mage}
            touchedHero={touchedHero}
            OTPIcons={[MageOTPIcon1(), MageOTPIcon2(), MageOTPIcon3()]}
            onUpgrade={onUpgrade}
            onLevelUp={onLevelup}
          />
          {/* Vertical mask to go with the horizonal mask in panelIndex on large screens*/}
          <div
            className={clsx(
              "left-[calc(50%-0.125rem)] z-10 hidden h-full w-1 bg-[#723209] md:block",
              (oneLineMaskVisible && !hasPrestiged) || (hasPrestiged && isWarriorVisible) ? "md:absolute" : "md:hidden",
              isHealerVisible && "md:absolute",
            )}
          />
        </div>
        <DamageTotals />
      </div>
    </div>
  )
}

// const adventurerHeroCard = useMemo(() => {
//   return (
//     <HeroCard
//       config={UPGRADE_CONFIG.adventurer}
//       touchedHero={touchedHero}
//       OTPIcons={[ClickOTPIcon1(), ClickOTPIcon2(), ClickOTPIcon3()]}
//       onUpgrade={onUpgrade}
//       onLevelUp={onLevelup}
//     />
//   )
// }, [touchedHero])
// const warriorHeroCard = useMemo(() => {
//   return (
//     <HeroCard
//       config={UPGRADE_CONFIG.warrior}
//       touchedHero={touchedHero}
//       OTPIcons={[WarriorOTPIcon1(), WarriorOTPIcon2(), WarriorOTPIcon3()]}
//       onUpgrade={onUpgrade}
//       onLevelUp={onLevelup}
//     />
//   )
// }, [touchedHero])
// const healerHeroCard = useMemo(() => {
//   return (
//     <HeroCard
//       config={UPGRADE_CONFIG.healer}
//       touchedHero={touchedHero}
//       OTPIcons={[HealerOTPIcon1(), HealerOTPIcon2(), HealerOTPIcon3()]}
//       onUpgrade={onUpgrade}
//       onLevelUp={onLevelup}
//     />
//   )
// }, [touchedHero])
// const mageHeroCard = useMemo(() => {
//   return (
//     <HeroCard
//       config={UPGRADE_CONFIG.mage}
//       touchedHero={touchedHero}
//       OTPIcons={[MageOTPIcon1(), MageOTPIcon2(), MageOTPIcon3()]}
//       onUpgrade={onUpgrade}
//       onLevelUp={onLevelup}
//     />
//   )
// }, [touchedHero])
