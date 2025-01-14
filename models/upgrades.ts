export type UpgradeId = "adventurer-otp" | "warrior-otp" | "healer-otp" | "mage-otp"
export type UpgradeIdWithLevel =
  | "adventurer-otp.1"
  | "adventurer-otp.2"
  | "adventurer-otp.3"
  | "warrior-otp.1"
  | "warrior-otp.2"
  | "warrior-otp.3"
export type CostKey = "clickOTPCosts" | "dotOTPCosts"

export interface UpgradeElement {
  upgradeId: UpgradeId
  purchasedUpgradeLevel: string
}

export type PrestigeUpgradeName = "damage" | "health"

export interface PrestigeUpgradeConfig {
  id: PrestigeUpgradeName
  title: string
  description: string
  basePrice: number
  additiveInc: number
  modifier: number
  unlocked: boolean
  tooltip: string
}

export interface PrestigeState {
  cost: number
  purchaseCount: number
}

export interface OTPConfig {
  OTPCosts: number[]
  OTPModifiers: number[]
  OTPDescriptions: string[]
}
export interface Upgrade {
  visibleAtZone: number
  elementId: UpgradeId
  displayName: string
  displayStat: string
  baseDamage: number
  levelUpMod: number
  OneTimePurchases: OTPConfig
  levelUpCost: (currentLevel: number) => number
}
export interface UpgradeConfig {
  adventurer: Upgrade
  warrior: Upgrade
  healer: Upgrade
  mage: Upgrade
  prestige: PrestigeUpgradeConfig[]
  calcOTPCost: (upgradeName: UpgradeId, upgradeCount: number) => number
  calcAdditiveCost: (atLevel: number, prestigeUpgrade: PrestigeUpgradeConfig) => number
}

export interface PlayerCalc {
  clickDamage: (clickLevel: number, clickMulti: number, pDamage: number, achievementModifier: number) => number
  heroDamage: (
    heroName: HeroName | HeroName[],
    heroStats: HeroStats | HeroStats[],
    pDamage?: number,
    achievementModifier?: number,
  ) => number
}

export type HeroName = "adventurer" | "warrior" | "healer" | "mage"

export type HeroStats = { level: number; upgradeCount: number }

export type UpgradeProps = {
  [key in HeroName]: {
    level: number
    upgradeCount: number
    damage: number
    levelUpCost: number
  }
}
