import { BaseEnemy, Enemy, MonsterType, BaseMonsterConfig, EnemyState } from "../models/monsters"
import { ZONE_CONFIG } from "./zone"
import caveTrollURL from "../assets/monsters/cave-troll.webp"
import dagonmireURL from "../assets/monsters/dagonmire.webp"
import errantPlasmaURL from "../assets/monsters/errnat-plasma.webp"
import forestGuardURL from "../assets/monsters/forest-guard.webp"
import gemCrabURL from "../assets/monsters/gem-crab.webp"
import ohcreJellyURL from "../assets/monsters/ochre-jelly.webp"
import pollenRuntURL from "../assets/monsters/pollen-runt.webp"
import wailShroomURL from "../assets/monsters/wail-shroom.webp"
import slimeURL from "../assets/monsters/slime.webp"
import jungleProwlerURL from "../assets/monsters/jungle-prowler.webp"
import toothURL from "../assets/monsters/boss-tooth.webp"
import dripShroomURL from "../assets/monsters/boss-drip-shroom.webp"
import everhaunchURL from "../assets/monsters/boss-everhaunch.webp"
import ribeyeURL from "../assets/monsters/boss-ribeye.webp"
import tankURL from "../assets/monsters/boss-tank.webp"
import unityOfTheShoreURL from "../assets/monsters/boss-unity-of-the-shore.webp"
import wardSquidURL from "../assets/monsters/boss-ward-squid.webp"

const MONSTER_CONFIG: BaseMonsterConfig = {
  health: {
    // Scaling parameters
    base: 5,
    zonePower: 1.8,
    zoneCoeff: 0.8,
    levelCoeff: 0.15,

    // Exponential scaling
    expoStart: 40,
    expoGrowthRate: 1.06,

    // Stage scaling within zones
    stageMin: 0.8,
    stageMax: 1,
  },
  attack: {
    baseDamage: 1,
    exp: 0.75,
    baseAttackRate: 2.4,
  },
  goldValue: {
    healthDivisor: 5,
    healthMultiBonus: 1.5,
  },
  boss: {
    extraLevels: 20,
    plasmaBase: 5,
    plasmaLinGrowth: 3,
    plasmaExpoGrowth: 1.05,
    plasmaValue: function (zoneNumber) {
      if (zoneNumber < 10) return 0

      const linear = this.plasmaBase + (zoneNumber - 10) * this.plasmaLinGrowth
      const expoMulti = Math.pow(this.plasmaExpoGrowth, zoneNumber - 1)
      return Math.round(linear * expoMulti)
    },
  },
  regularSpawnChance: 0.97,
  specialSpawnChance: 0.005,
}

const MONSTER_VARIATIONS: MonsterType[] = [
  // dps = damageMulti / (MONSTER_CONFIG.baseAttackRate * attackRateMulti)
  // difficulty = (dps * healthMulti)
  {
    name: "Cave Troll",
    kind: "regular",
    healthMulti: 2.3,
    damageMulti: 1.6,
    attackRateMulti: 1.2, // dps: 0.56; difficulty: 1.29
    imagePath: `${caveTrollURL}`,
  },
  {
    name: "Dagonmire Spawn",
    kind: "regular",
    healthMulti: 1.3,
    damageMulti: 0.8,
    attackRateMulti: 0.6, // dps: 0.56; difficulty: 0.73
    imagePath: `${dagonmireURL}`,
  },
  {
    name: "Forest Guard",
    kind: "regular",
    healthMulti: 1.75,
    damageMulti: 1.3,
    attackRateMulti: 1.15, // dps: 0.47; difficulty: 0.82
    imagePath: `${forestGuardURL}`,
  },
  {
    name: "Ochre Jelly",
    kind: "regular",
    healthMulti: 1.1,
    damageMulti: 1.2,
    attackRateMulti: 1, // dps: 0.50; difficulty: 0.55
    imagePath: `${ohcreJellyURL}`,
  },
  {
    name: "Pollen Runt",
    kind: "regular",
    healthMulti: 1.2,
    damageMulti: 1.2,
    attackRateMulti: 1, // dps: 0.50; difficulty: 0.60
    imagePath: `${pollenRuntURL}`,
  },
  {
    name: "Wail Shroom",
    kind: "regular",
    healthMulti: 1,
    damageMulti: 1.3,
    attackRateMulti: 1, // dps: 0.54; difficulty: 0.54
    imagePath: `${wailShroomURL}`,
  },
  {
    name: "Slime",
    kind: "regular",
    healthMulti: 1,
    damageMulti: 1.3,
    attackRateMulti: 1, // dps: 0.54; difficulty: 0.54
    imagePath: `${slimeURL}`,
  },
  {
    name: "Jungle Prowler",
    kind: "regular",
    healthMulti: 1.2,
    damageMulti: 1.4,
    attackRateMulti: 0.8, // dps: 0.73; difficulty: 0.88
    imagePath: `${jungleProwlerURL}`,
  },
]

const BOSS_VARIATIONS: MonsterType[] = [
  {
    name: "Tooth",
    kind: "boss",
    healthMulti: 2,
    damageMulti: 1.1,
    attackRateMulti: 1, // dps: 0.46; difficulty: 0.92
    imagePath: `${toothURL}`,
  },
  {
    name: "Drip Shroom",
    kind: "boss",
    healthMulti: 2,
    damageMulti: 1.1,
    attackRateMulti: 1, // dps: 0.46; difficulty: 0.92
    imagePath: `${dripShroomURL}`,
  },
  {
    name: "Everhaunch",
    kind: "boss",
    healthMulti: 2,
    damageMulti: 1.2,
    attackRateMulti: 1.2, // dps: 0.42; difficulty: 0.84
    imagePath: `${everhaunchURL}`,
  },
  {
    name: "Ribeye",
    kind: "boss",
    healthMulti: 1.7,
    damageMulti: 0.8,
    attackRateMulti: 0.5, // dps: 0.67; difficulty: 1.14
    imagePath: `${ribeyeURL}`,
  },
  {
    name: "Tank",
    kind: "boss",
    healthMulti: 2.8,
    damageMulti: 1.7,
    attackRateMulti: 1.4, // dps: 0.51; difficulty: 1.43
    imagePath: `${tankURL}`,
  },
  {
    name: "Unity of the Shore",
    kind: "boss",
    healthMulti: 2.5,
    damageMulti: 1.3,
    attackRateMulti: 1.1, // dps: 0.49; difficulty: 1.23
    imagePath: `${unityOfTheShoreURL}`,
  },
  {
    name: "Ward Squid",
    kind: "boss",
    healthMulti: 2.25,
    damageMulti: 1.15,
    attackRateMulti: 1, // dps: 0.48; difficulty: 1.08
    imagePath: `${wardSquidURL}`,
  },
]

const RARE_VARIATIONS: MonsterType[] = [
  {
    name: "Gem Crab",
    kind: "rare",
    healthMulti: 0.5,
    damageMulti: 0,
    attackRateMulti: 0,
    goldMulti: 20,
    imagePath: `${gemCrabURL}`,
  },
]
const SPECIAL_VARIATIONS: MonsterType[] = [
  {
    name: "Errant Plasma",
    kind: "special",
    healthMulti: 1,
    damageMulti: 0,
    attackRateMulti: 0,
    goldMulti: 0,
    imagePath: `${errantPlasmaURL}`,
  },
]

class BaseMonster implements BaseEnemy {
  level
  baseAttackRate = MONSTER_CONFIG.attack.baseAttackRate

  get baseHealth(): number {
    const {
      base,
      zonePower,
      zoneCoeff,
      levelCoeff,
      expoStart,
      expoGrowthRate: expoGrowth,
      stageMin,
      stageMax,
    } = MONSTER_CONFIG.health

    const zone = Math.floor((this.level - 1) / 30) + 1
    const stageInZone = ((this.level - 1) % 30) + 1
    const stageProgress = (stageInZone - 1) / 29

    const zoneScaling = zoneCoeff * Math.pow(zone, zonePower)
    const levelScaling = 1 + this.level * levelCoeff
    const lateGameBoost = zone > expoStart ? Math.pow(expoGrowth, zone - expoStart) : 1
    const stageMulti = stageMin + (stageMax - stageMin) * stageProgress
    const health = base * zoneScaling * levelScaling * lateGameBoost * stageMulti

    return Math.floor(health)
  }
  get baseDamage(): number {
    const { baseDamage, exp } = MONSTER_CONFIG.attack
    if (this.level < 30) {
      return Math.max(1, baseDamage)
    } else {
      return Math.max(1, baseDamage + Math.pow(this.level / 30, exp))
    }
  }

  constructor(zoneNumber: number, stageNumber: number, isBoss: boolean) {
    this.level = (zoneNumber - 1) * 30 + stageNumber
    if (isBoss) this.level += MONSTER_CONFIG.boss.extraLevels
  }
}

class Monster extends BaseMonster implements Enemy {
  name
  kind
  health
  maxHealth
  damage
  attackRate
  image
  goldValue
  plasmaValue

  constructor(config: MonsterType, zoneNumber: number, stageNumber: number, isBoss: boolean) {
    super(zoneNumber, stageNumber, isBoss)
    this.name = config.name
    this.kind = config.kind
    this.health = Math.floor(this.baseHealth * config.healthMulti)
    this.damage = Math.floor(this.baseDamage * config.damageMulti)
    this.attackRate = this.baseAttackRate * config.attackRateMulti
    this.maxHealth = this.health
    this.image = config.imagePath
    const goldMulti = config.goldMulti ?? 1
    const { healthDivisor, healthMultiBonus } = MONSTER_CONFIG.goldValue
    this.goldValue = Math.floor((this.baseHealth / healthDivisor) * (config.healthMulti * healthMultiBonus) * goldMulti)
    this.plasmaValue = isBoss ? MONSTER_CONFIG.boss.plasmaValue(zoneNumber) : 0
  }
}

export function getRandomMonster(
  zoneNumber = 1,
  stageNumber = 1,
  isBoss = false,
  isFarming = false,
  rareMonsterBonus = 0,
): EnemyState {
  let randomMonster: MonsterType
  if (isBoss) {
    randomMonster = BOSS_VARIATIONS[Math.floor(Math.random() * BOSS_VARIATIONS.length)]
  } else {
    const randomValue = Math.random()
    const regularSpawnChance = MONSTER_CONFIG.regularSpawnChance * Math.pow(0.99, rareMonsterBonus)
    const specialSpawnChance = MONSTER_CONFIG.specialSpawnChance

    if (specialSpawnChance > randomValue && zoneNumber > 10 && !isFarming) {
      randomMonster = SPECIAL_VARIATIONS[Math.floor(Math.random() * SPECIAL_VARIATIONS.length)]
    } else if (regularSpawnChance > randomValue) {
      randomMonster = MONSTER_VARIATIONS[Math.floor(Math.random() * MONSTER_VARIATIONS.length)]
    } else {
      randomMonster = RARE_VARIATIONS[Math.floor(Math.random() * RARE_VARIATIONS.length)]
    }
  }
  const newMonster = serializableMonster(new Monster(randomMonster, zoneNumber, stageNumber, isBoss))
  return newMonster
}

export function getMonster(monsterName: string, zoneNumber = 1, stageNumber = 1, isBoss = false): EnemyState {
  const allMonsters = MONSTER_VARIATIONS.concat(BOSS_VARIATIONS, RARE_VARIATIONS, SPECIAL_VARIATIONS)
  for (const monster of allMonsters) {
    if (monster.name === monsterName) return serializableMonster(new Monster(monster, zoneNumber, stageNumber, isBoss))
  }
  throw new Error(`Monster not found: ${monsterName}`)
}

function serializableMonster(monster: Monster): EnemyState {
  const serializable = {
    name: monster.name,
    kind: monster.kind,
    level: monster.level,
    health: monster.health,
    maxHealth: monster.maxHealth,
    alive: true,
    damage: monster.damage,
    attackRate: monster.attackRate,
    goldValue: monster.goldValue,
    image: monster.image,
    plasmaValue: monster.plasmaValue,
  }
  return serializable
}
