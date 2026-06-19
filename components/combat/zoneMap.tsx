import clsx from "clsx/lite"
import { useAppSelector } from "../../redux/hooks"
import { selectZoneState } from "../../redux/zoneSlice"
import { BossIcon, CookieEnjoyerIcon, ErrantPlasmaIcon, GemCrabIcon, MoneybagIcon } from "../svgIcons/stageIcons"
import { Stage } from "../../models/zones"
import { JSX } from "react"
import { SnakeBorder } from "../miscellanious/SnakeBorder"

export default function ZoneMap() {
  const {
    currentZoneLength,
    zoneMonsters,
    stageNumber,
    farmZoneMonsters,
    farmZoneNumber,
    farmZoneLength,
    farmStageNumber,
    zoneInView,
  } = useAppSelector(selectZoneState)

  const isFarmZone = zoneInView === farmZoneNumber
  const zoneLength = isFarmZone ? farmZoneLength : currentZoneLength
  const currentStage = isFarmZone && farmZoneMonsters ? farmStageNumber : stageNumber
  const monsters = isFarmZone && farmZoneMonsters ? farmZoneMonsters : zoneMonsters

  if (!monsters) throw new Error("Failed to retrieve monsters for zone")

  const getIcon = (stageIndex: number): JSX.Element | undefined => {
    const monster = monsters[stageIndex]
    switch (monster.kind) {
      case "special":
        if (monster.name === "Errant Plasma") return ErrantPlasmaIcon()
        break
      case "rare":
        if (monster.name === "Gem Crab") return GemCrabIcon()
        break
      case "boss":
        return BossIcon()
      default:
        return undefined
    }
  }

  const stages: Stage[] = Array.from({ length: zoneLength }, (_, i): Stage => {
    const thisStageNumber = i + 1
    const isSpecial = !isFarmZone && monsters[i].kind === "special"
    const delta = thisStageNumber - currentStage
    const iconVisible = !isSpecial || delta < 3

    return {
      thisStageNumber,
      isCurrentStage: currentStage === thisStageNumber,
      isCompleted: thisStageNumber < currentStage,
      isSpecial,
      iconVisible,
    }
  })

  return (
    <div className="flex items-end opacity-100 z-10">
      <div className="z-10 mb-2 box-content flex w-[20rem] flex-wrap-reverse content-start border-2 border-gray-300 md:w-[32rem] md:border-0 lg:w-[20rem] lg:border-2 xl:w-[32rem] xl:border-0 2xl:w-[40rem] 2xl:border-2">
        {stages.map((stage) => {
          const { thisStageNumber, isCurrentStage, isCompleted, isSpecial, iconVisible } = stage

          const cell = (
            <div
              key={thisStageNumber}
              className={clsx(
                "relative flex h-8 w-16 items-center justify-center border-2 border-gray-300",
                isCompleted && "bg-islam",
                isCurrentStage && thisStageNumber !== zoneLength && "bg-yellow-500",

                thisStageNumber > currentStage && thisStageNumber !== zoneLength && "bg-gray-800",
                !isFarmZone && thisStageNumber === zoneLength && thisStageNumber !== currentStage && "bg-red-600",
                !isFarmZone && thisStageNumber === zoneLength && isCurrentStage && "bg-orange-400",
                isFarmZone && farmZoneMonsters && thisStageNumber === zoneLength && "bg-gray-800",
                isFarmZone && farmZoneMonsters && isCurrentStage && thisStageNumber === zoneLength && "bg-yellow-500",
              )}>
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-tr from-white/30 to-blue-700/20">
                <div className={clsx("h-7 w-8", isSpecial && !iconVisible && "hidden")}>
                  {getIcon(thisStageNumber - 1)}
                </div>
              </div>
            </div>
 
          )

          return isCurrentStage ? <SnakeBorder config={{ color: [0, 144, 0], padding: 5, cornerRadius: 0 }} className="z-10"
>{cell}</SnakeBorder> : cell
          
        })}
      </div>{" "}
    </div>
   
  )
}
