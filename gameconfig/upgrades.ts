import { HeroName, PlayerCalc, UpgradeConfig } from "../models/upgrades"

export const UPGRADE_CONFIG: UpgradeConfig = {
  adventurer: {
    visibleAtZone: 1,
    elementId: "adventurer-otp",
    displayName: "Adventurer",
    displayStat: "Click Damage",
    baseDamage: 1,
    levelUpMod: 1,
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
    baseDamage: 3,
    levelUpMod: 2,
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
    baseDamage: 50,
    levelUpMod: 30,
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
    baseDamage: 800,
    levelUpMod: 500,
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
  calcAdditiveCost(atLevel, prestigeUpgrade): number {
    return (((atLevel - 1) * atLevel) / 2) * prestigeUpgrade.additiveInc + prestigeUpgrade.basePrice * atLevel
  },
} as const

export const playerCalc: PlayerCalc = {
  clickDamage: (clickLevel, clickMultiUpgradeCount, pDamage, achievementModifier): number =>
    clickLevel * Math.pow(2, clickMultiUpgradeCount) * pDamage * achievementModifier,
  heroDamage: (heroName, heroStats, pDamage, achievementModifier): number => {
    // heroLevel * 2 * Math.pow(2, heroUpgradeMultiCount) * pDamage * achievementModifier,

    if (Array.isArray(heroName) && Array.isArray(heroStats)) {
      let damage = 0

      for (let i = 0; i < heroName.length; i++) {
        const {baseDamage, levelUpMod} = UPGRADE_CONFIG[heroName[i]]
        const {level, upgradeCount} = heroStats[i]
        damage += 
      }
    }
  },
} as const
