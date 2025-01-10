export type UpgradeId = "adventurer-otp" | "warrior-otp" | "healer-otp" | "mage-otp"
export type UpgradeIdWithLevel =
  | "click-multi.1"
  | "click-multi.2"
  | "click-multi.3"
  | "dot-multi.1"
  | "dot-multi.2"
  | "dot-multi.3"
export type CostKey = "clickMultiCosts" | "dotMultiCosts"

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
  OneTimePurchases: OTPConfig
  levelUpCost: (currentLevel: number) => number
}
export interface UpgradeConfig {
  adventurer: Upgrade
  warrior: Upgrade
  healer: Upgrade
  mage: Upgrade
  prestige: PrestigeUpgradeConfig[]
  calcMultiCost: (upgradeName: UpgradeId, upgradeCount: number) => number
  calcAdditiveCost: (atLevel: number, prestigeUpgrade: PrestigeUpgradeConfig) => number
}

export interface PlayerCalc {
  clickDamage: (clickLevel: number, clickMulti: number, pDamage: number, achievementModifier: number) => number
  dotDamage: (dotLevel: number, dotMulti: number, pDamage: number, achievementModifier: number) => number
}

export type UpgradeKey = "adventurer" | "warrior" | "healer" | "mage"

export type UpgradeProps = {
  [key in UpgradeKey]: {
    level: number
    upgradeCount: number
    levelUpCost: number
  }
}
