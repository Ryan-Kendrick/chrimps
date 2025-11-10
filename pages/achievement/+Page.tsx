import clsx from "clsx/lite"
import { Achievement, ACHIEVEMENT_CONFIG, AchievementCategory } from "../../gameconfig/achievements"
import { useAppSelector } from "../../redux/hooks"
import { selectUnlockedAchievements } from "../../redux/statsSlice"
import { useEffect, useRef, useState } from "react"
import { achievementSelectorMap } from "../../redux/shared/maps"
import { recalculateAchievementMod } from "../../redux/playerSlice"
import { selectAchievementModifier } from "../../redux/shared/heroSelectors"
import { useConfetti, useKeypressEasterEgg } from "../../gameconfig/customHooks"

export default function Achievements() {
  const unlockedAchievements = useAppSelector(selectUnlockedAchievements)
  const achievementModifier = useAppSelector(selectAchievementModifier)
  const easterEggTimer = useRef<number | null>(null)

  const shouldDisplaySpecial = unlockedAchievements.some((achievement) => achievement.startsWith("special"))

  const [selectedAchievement, setSelectedAchievement] = useState<false | Achievement>(false)

  const onViewAchievement = (Achievement: Achievement) => {
    setSelectedAchievement(Achievement)
  }

  const achievementProgress = useAppSelector((state) => {
    if (!selectedAchievement) return 0
    return achievementSelectorMap[selectedAchievement.id.split(".")[0]](state)
  })

  const { triggerConfetti, hasTriggeredConfetti } = useConfetti()
  const shouldTrigger = useKeypressEasterEgg()

  useEffect(() => {
    if (shouldTrigger) {
      triggerConfetti()
    }
    return () => {
      if (easterEggTimer.current) clearInterval(easterEggTimer.current)
    }
  }, [shouldTrigger, triggerConfetti])

  const renderEasterEgg = () => (
    <div id="achievement-cont" key={`mum-container`} className="flex flex-col pb-2">
      <div className="grid grid-cols-[120px_1fr] gap-4 border-b border-lightgold font-paytone text-violet-200 md:grid-cols-[160px_1fr] xl:grid-cols-[200px_1fr]">
        <h2 className="place-self-center text-center text-2xl font-bold md:text-4xl">Mum</h2>
        <div id="category-achievement-cont" className="mb-2 ml-2 flex flex-col gap-2">
          <div
            key={`mum-being`}
            className="grid-row grid gap-4 md:grid-cols-[120px_1fr] lg:grid-cols-[150px_1fr] xl:grid-cols-[200px_1fr]">
            <h3 className="text-center md:text-left">Is mum</h3>
            <div id="achievements-for-category" className="flex flex-wrap gap-2">
              {" "}
              <div
                key="being-1"
                className={clsx(
                  "h-[72px] w-32 rounded-sm border-2 border-violet-300 bg-[linear-gradient(117deg,_rgba(191,149,63,1)_0%,_rgba(170,119,28,1)_18%,_rgba(227,168,18,1)_64%,_rgba(252,246,186,1)_100%)] text-[2px] transition-[scale] duration-300",
                )}
                style={{ scale: "1.0" }}
                onPointerEnter={(e) => {
                  const el = e.currentTarget
                  easterEggTimer.current = window.setInterval(() => {
                    el.style.scale = (Number(el.style.scale) * 1.05).toString()
                  }, 200)
                }}
                onPointerLeave={(e) => {
                  e.currentTarget.style.scale = "1.0"
                  if (easterEggTimer.current) clearInterval(easterEggTimer.current)
                }}>
                <div className="absolute right-14 top-4">🥳</div>
              </div>
            </div>{" "}
          </div>
        </div>
      </div>
    </div>
  )

  const isAchievementUnlocked = (id: string) => unlockedAchievements.includes(id)

  return (
    <div className="relative flex h-full flex-col text-lg">
      {unlockedAchievements.length > 0 && (
        <div className="mb-6 w-full flex-none text-center text-xl text-white">
          {" "}
          Your <span className="font-bold text-gold">{unlockedAchievements.length}</span> Achievements increase your
          damage dealt by <span className="font-bold text-green-500">{Math.round(achievementModifier * 100)}%</span>
        </div>
      )}

      <div id="achievements-cont" className="min-h-0 flex-1 overflow-y-auto border-t border-lightgold pt-2">
        {Object.entries(ACHIEVEMENT_CONFIG).map(([feature, featureData]) => {
          if (feature === "special" && !shouldDisplaySpecial) return null
          // Achievement pane

          return (
            <div id="achievement-cont" key={`${feature}-container`} className="flex flex-col pb-2">
              <div className="grid grid-cols-[120px_1fr] gap-4 border-b border-lightgold font-paytone text-white md:grid-cols-[160px_1fr] xl:grid-cols-[200px_1fr]">
                <h2 className="place-self-center text-center text-2xl font-bold md:text-4xl">
                  {featureData.displayName}
                </h2>
                <div id="category-achievement-cont" className="mb-2 ml-2 flex flex-col gap-2">
                  {Object.entries(featureData).map(([categoryKey, categoryData]) => {
                    if (categoryKey === "displayName") return null
                    categoryData = categoryData as AchievementCategory
                    // Category title: Achievement grid
                    return (
                      <div
                        key={`${feature}-${categoryKey}`}
                        className="grid-row grid gap-4 md:grid-cols-[120px_1fr] lg:grid-cols-[150px_1fr] xl:grid-cols-[200px_1fr]">
                        <h3 className="text-center md:text-left">{categoryData.displayName}</h3>
                        <div id="achievements-for-category" className="flex flex-wrap gap-2">
                          {categoryData.achievements.map((achievement) => {
                            // Grid items

                            const unlocked = isAchievementUnlocked(achievement.id)
                            const special = achievement.id.startsWith("special")

                            if (special && !unlocked) return null

                            // Hidden achievement modifier recalculator
                            const onClick =
                              achievement.id === "prestige.count.2" ? () => recalculateAchievementMod() : null

                            return (
                              <div
                                key={achievement.id}
                                className={clsx(
                                  "h-9 w-16",
                                  unlocked
                                    ? special
                                      ? "bg-specialGold box-shadow-electricBlue rounded-sm"
                                      : "border-gold bg-[linear-gradient(117deg,_rgba(191,149,63,1)_0%,_rgba(170,119,28,1)_18%,_rgba(227,168,18,1)_64%,_rgba(252,246,186,1)_100%)]"
                                    : "border-2 border-white/60 bg-black/60",
                                )}
                                onPointerOver={() => onViewAchievement(achievement)}
                                onMouseLeave={() => setSelectedAchievement(false)}
                                onClick={() => onClick}
                              />
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )
        })}
        {hasTriggeredConfetti && renderEasterEgg()}
      </div>
      {selectedAchievement && ( // Achievement details overlay
        <div
          id="achievement-tooltip-overlay"
          className={clsx(
            "pointer-events-none absolute bottom-0 left-0 right-0 -m-5 min-h-[25%] rounded-b-[8px] border-t-4 border-darkgold bg-[radial-gradient(circle,_rgba(189,189,189,1)_0%,_rgba(179,179,179,1)_81%,_rgba(219,217,217,1)_100%)] md:h-[15%]",
          )}>
          <div className="relative flex items-center justify-center">
            <h2 className="px-2 font-passion text-3xl">{selectedAchievement.title}</h2>
            {isAchievementUnlocked(selectedAchievement.id) && ( // Unlocked text top-right if desktop
              <p className="absolute right-2 inline-block hidden bg-gradient-to-r from-yellow-600 via-amber-500 to-yellow-600 bg-clip-text text-xl font-extrabold text-transparent md:block">
                UNLOCKED
              </p>
            )}
          </div>

          {/* Description & current progress */}
          <div className="mx-2 mt-1 flex flex-col gap-2">
            <div className="relative flex justify-between">
              <p className="text-center font-passion text-2xl">{selectedAchievement.description}</p>
              <p className="font-paytone text-lg">
                <span className={clsx(isAchievementUnlocked(selectedAchievement.id) && "text-islam")}>
                  {!selectedAchievement.id.startsWith("special") &&
                    achievementProgress.toLocaleString() + "/" + selectedAchievement.condition.toLocaleString()}
                  {/* {achievementProgress.toLocaleString()}/{selectedAchievement.condition.toLocaleString()} */}
                </span>
              </p>
            </div>

            {/* Reward & UNLOCKED text if mobile */}
            <div className="relative flex items-center justify-between">
              <div>
                {isAchievementUnlocked(selectedAchievement.id) && (
                  <p className="block inline-block bg-gradient-to-r from-yellow-600 via-amber-500 to-yellow-600 bg-clip-text text-xl font-extrabold text-transparent md:hidden">
                    UNLOCKED
                  </p>
                )}
              </div>
              <div>
                <p className="text-right text-lg text-islam">
                  {!selectedAchievement.id.startsWith("special") && "+" + selectedAchievement.modifier * 100 + "%"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
