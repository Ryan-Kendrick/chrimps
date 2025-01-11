import { HeroName } from "./upgrades"

export type Tab = "upgrade" | "prestige"

export interface TabData {
  id: Tab
  title: string
  component: JSX.Element
}

export interface PlayerState {
  adventurerLevel: number
  adventurerMultiUpgradeCount: number
  warriorLevel: number
  warriorMultiUpgradeCount: number
  gold: number
  plasma: number
  plasmaReserved: number
  achievementModifier: number

  activeHeroes: HeroName[]
  hasInitClickMulti1: boolean
  hasInitClickMulti2: boolean
  hasInitClickMulti3: boolean
  hasInitDotPane: boolean
  hasInitDotMulti1: boolean
  hasInitDotMulti2: boolean
  hasInitDotMulti3: boolean

  tabInView: Tab

  plasmaSpent: number
  startDate: number
  pDamageUpgradeCount: number
  // pHealthUpgradeCount: number
}
