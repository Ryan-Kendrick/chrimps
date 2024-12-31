import { ACHIEVEMENT_CONFIG } from "../../gameconfig/achievements"
import { useAppSelector } from "../../redux/hooks"
import { selectUnlockedAchievements } from "../../redux/statsSlice"

export default function Achievements() {
  const unlockedAchievements = useAppSelector(selectUnlockedAchievements)

  const isAchievementUnlocked = (id: string) => unlockedAchievements.includes(id)
  const formatFeature = (word: string) => word.charAt(0).toUpperCase() + word.slice(1)
  const formatCategory = (id: string) => id.charAt(0).toUpperCase() + id.slice(1)

  function onViewAchievement(
    id: string,
    title: string,
    description: string,
    condition: number,
    difficulty: string,
    modifier: number,
  ) {
    console.log(id, title, description, condition, difficulty, modifier)
  }

  return (
    <div className="flex flex-col h-full text-lg">
      {unlockedAchievements.length > 0 && (
        <div className="self-center my-2 text-xl">
          {" "}
          Your <span className="font-bold text-gold">{unlockedAchievements.length}</span> Achievements increase your
          damage dealt by <span className="font-bold text-green-500">??</span>
        </div>
      )}
      <div className="flex flex-col h-full w-full">
        <div className="flex flex-col gap-1">
          {Object.entries(ACHIEVEMENT_CONFIG).map(([feature, categories]) => (
            <div key={`${feature}-container`} className="flex flex-col gap-2 pb-4">
              <div className="grid grid-cols-[200px_1fr] gap-4 border-b border-lightgold">
                <h2 className="place-self-center font-bold text-2xl">{formatFeature(feature)}</h2>
                <div className="flex flex-col gap-2 mb-2">
                  {Object.entries(categories).map(([category, achievements]) => (
                    <div key={`${feature}-${category}`} className="grid grid-cols-[200px_1fr] gap-4">
                      <h3 className="font-bold">{formatCategory(category)}</h3>
                      <div className="flex flex-wrap gap-2">
                        {achievements.map((achievement) => (
                          // const unlocked = isAchievementUnlocked(achievement.id)

                          <div
                            key={achievement.id}
                            className="h-8 w-14 border-2"
                            onPointerOver={() =>
                              onViewAchievement(
                                achievement.id,
                                achievement.title,
                                achievement.description,
                                achievement.condition,
                                achievement.difficulty,
                                achievement.modifier,
                              )
                            }></div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}