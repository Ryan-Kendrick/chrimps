import { PlayerCalc, UpgradeConfig } from "../models/upgrades"

export const UPGRADE_CONFIG: UpgradeConfig = {
  adventurer: {
    visibleAtZone: 1,
    elementId: "adventurer-otp",
    displayName: "Adventurer",
    displayStat: "Click Damage",
    OneTimePurchases: {
      OTPCosts: [100, 400, 1000],
      OTPModifiers: [2, 2, 2],
      OTPDescriptions: [
        "Increase Damage Over Time by 100%",
        "Increase Damage Over Time by 100%",
        "Increase Damage Over Time by 100%",
      ],
    },
    levelUpCost: (currentLevel) => {
      const base = 10
      const growthRate = 1.1

      return Math.floor(base * (1 + Math.log10(currentLevel)) * Math.pow(growthRate, currentLevel) - 1)
    },
  },
  warrior: {
    visibleAtZone: 3,
    elementId: "warrior-otp",
    displayName: "Warrior",
    displayStat: "Damage Over Time",
    OneTimePurchases: {
      OTPCosts: [5000, 10000, 25000],
      OTPModifiers: [2, 2, 2],
      OTPDescriptions: [
        "Increase Damage Over Time by 100%",
        "Increase Damage Over Time by 100%",
        "Increase Damage Over Time by 100%",
      ],
    },
    levelUpCost: (currentLevel) => {
      const base = 500
      const growthRate = 1.1

      return Math.floor(base * (1 + Math.log10(currentLevel + 1)) * Math.pow(growthRate, currentLevel))
    },
  },
  healer: {
    visibleAtZone: 12,
    elementId: "mage-otp",
    displayName: "Mage",
    displayStat: "Damage Over Time",
    OneTimePurchases: {
      OTPCosts: [40000, 100000, 250000],
      OTPModifiers: [2, 2, 2],
      OTPDescriptions: [
        "Increase Damage Over Time by 100%",
        "Increase Damage Over Time by 100%",
        "Increase Damage Over Time by 100%",
      ],
    },
    levelUpCost: (currentLevel) => {
      const base = 5000
      const growthRate = 1.1

      return Math.floor(base * (1 + Math.log10(currentLevel + 1)) * Math.pow(growthRate, currentLevel))
    },
  },
  mage: {
    visibleAtZone: 22,
    elementId: "warrior-otp",
    displayName: "Warrior",
    displayStat: "Damage Over Time",
    OneTimePurchases: {
      OTPCosts: [500000, 1000000, 2500000],
      OTPModifiers: [2, 2, 2],
      OTPDescriptions: [
        "Increase Damage Over Time by 100%",
        "Increase Damage Over Time by 100%",
        "Increase Damage Over Time by 100%",
      ],
    },
    levelUpCost: (currentLevel) => {
      const base = 20000
      const growthRate = 1.1

      return Math.floor(base * (1 + Math.log10(currentLevel + 1)) * Math.pow(growthRate, currentLevel))
    },
  },
  calcMultiCost: function (upgradeName, upgradeCount) {
    const costs = {
      "adventurer-otp": this.adventurer.OneTimePurchases.OTPCosts,
      "warrior-otp": this.warrior.OneTimePurchases.OTPCosts,
      "healer-otp": this.healer.OneTimePurchases.OTPCosts,
      "mage-otp": this.mage.OneTimePurchases.OTPCosts,
    }
    return costs[upgradeName][upgradeCount]
  },
  prestige: [
    {
      id: "damage",
      title: "Damage",
      description: "Increased by",
      basePrice: 2,
      additiveInc: 1,
      modifier: 0.05,
      unlocked: true,
      tooltip: "Increase damage by 5%",
    },
    // { id: "health", title: "Health", basePrice: 2, additiveInc: 1, modifier: 0.05, unlocked: true, tooltip: "" },
  ],
  calcAdditiveCost(atLevel, prestigeUpgrade) {
    return (((atLevel - 1) * atLevel) / 2) * prestigeUpgrade.additiveInc + prestigeUpgrade.basePrice * atLevel
  },
} as const

export const playerCalc: PlayerCalc = {
  clickDamage: (clickLevel, clickMultiUpgradeCount, pDamage, achievementModifier) =>
    clickLevel * Math.pow(2, clickMultiUpgradeCount) * pDamage * achievementModifier,
  dotDamage: (dotLevel, dotMultiUpgradeCount, pDamage, achievementModifier) =>
    dotLevel * 2 * Math.pow(2, dotMultiUpgradeCount) * pDamage * achievementModifier,
}
