import { createSelector, createSlice, isAllOf } from "@reduxjs/toolkit"
import type { PayloadAction } from "@reduxjs/toolkit"
import { type RootState } from "./store"
import { getMonster } from "../gameconfig/monster"
import { EnemyState } from "../models/monsters"
import { monsterClicked, increaseTotalDotDamageDealt, monsterBeaten } from "./statsSlice"
import { prestigeReset } from "./shared/actions"
import { setRespawnTime } from "./playerSlice"

const initialState = { ...getMonster("Slime"), alive: true } as EnemyState

export const monsterSlice = createSlice({
  name: "monster",
  initialState,
  reducers: {
    spawnMonster(state, action: PayloadAction<EnemyState>) {
      return { ...action.payload, alive: true }
    },
    monsterDied: (state) => {
      state.alive = false
    },
  },
  extraReducers(builder) {
    builder.addCase(prestigeReset, () => {
      return initialState
    })
    builder.addCase(monsterClicked, (state, action) => {
      const newHealth = state.health - action.payload.damage
      state.health = newHealth
      state.alive = newHealth >= 1
    })
    builder.addCase(increaseTotalDotDamageDealt, (state, action) => {
      const newHealth = state.health - action.payload
      state.health = newHealth
      state.alive = newHealth >= 1
    })
    builder.addCase(monsterBeaten, (state, action) => {
      const newHealth = state.health - action.payload
      state.health = newHealth
      state.alive = newHealth >= 1
    })
    builder.addCase(setRespawnTime, (state, action) => {
      if (action.payload === 0) {
        state.health = state.maxHealth
        state.alive = true
      }
    })
  },
})

export const { spawnMonster, monsterDied } = monsterSlice.actions

export const selectMonsterState = createSelector(
  [(state: RootState) => state.monster],
  (monster) =>
    ({
      name: monster.name,
      level: monster.level,
      damage: monster.damage,
      attackRate: monster.attackRate,
      alive: monster.alive,
      goldValue: monster.goldValue,
      plasmaValue: monster.plasmaValue,
      image: monster.image,
    }) as Partial<EnemyState>,
)

export const selectMonsterHealth = (state: RootState) => state.monster.health
export const selectMonsterMaxHealth = (state: RootState) => state.monster.maxHealth
export const selectMonsterKind = (state: RootState) => state.monster.kind

export default monsterSlice.reducer
