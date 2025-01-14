import { HeroName } from "./upgrades"

export type Tab = "upgrade" | "prestige"

export interface TabData {
  id: Tab
  title: string
  component: JSX.Element
}

export interface PlayerState {
  adventurerLevel: number
  adventurerOTPUpgradeCount: number
  warriorLevel: number
  warriorOTPUpgradeCount: number
  gold: number
  plasma: number
  plasmaReserved: number
  achievementModifier: number

  activeHeroes: HeroName[]
  hasInitAdventurerOTP: number
  hasInitWarriorPane: boolean
  hasInitWarriorOTP: number

  tabInView: Tab

  plasmaSpent: number
  startDate: number
  pDamageUpgradeCount: number
  // pHealthUpgradeCount: number
}
