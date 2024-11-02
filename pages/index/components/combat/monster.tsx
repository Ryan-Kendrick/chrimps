import React, { PropsWithChildren, useEffect, useState } from "react"
import { useAppDispatch, useAppSelector } from "../../../../redux/hooks"
import { increaseGold, selectClickBaseDamage, selectClickMulti } from "../../../../redux/playerSlice"
import { playerCalc } from "../../../../gameconfig/upgrades"
import {
  selectMonsterAlive,
  selectMonsterGoldValue,
  selectMonsterImage,
  selectMonsterName,
  spawnMonster,
  takeClickDamage,
} from "../../../../redux/monsterSlice"
import {
  increaseTotalClickDamageDealt,
  incrementClickCount,
  incrementHighestZoneEver,
  incrementKillCount,
  incrementTotalZonesCompleted,
  selectHighestZoneEver,
} from "../../../../redux/statsSlice"
import { incrementZoneNumber, selectZoneNumber } from "../../../../redux/zoneSlice"
import { Enemy } from "../../../../models/monsters"
import { getRandomMonster } from "../../../../gameconfig/monster"

export default function Monster({ children }: PropsWithChildren) {
  const dispatch = useAppDispatch()

  const clickBaseDamage = useAppSelector(selectClickBaseDamage)
  const clickMulti = useAppSelector(selectClickMulti)
  const clickDamage = playerCalc.clickDamage(clickBaseDamage, clickMulti)

  let zone = useAppSelector(selectZoneNumber)
  const highestZoneEver = useAppSelector(selectHighestZoneEver)

  const monsterName = useAppSelector(selectMonsterName)
  const monsterImage = useAppSelector(selectMonsterImage)
  const monsterValue = useAppSelector(selectMonsterGoldValue)
  const monsterAlive = useAppSelector(selectMonsterAlive)

  function clickHandler() {
    dispatch(incrementClickCount())
    dispatch(increaseTotalClickDamageDealt(clickDamage))
    dispatch(takeClickDamage(clickDamage))
    // Goto useEffect if monster died
  }

  useEffect(() => {
    if (!monsterAlive) {
      dispatch(incrementKillCount())
      dispatch(increaseGold(monsterValue))
      dispatch(incrementTotalZonesCompleted())
      dispatch(incrementZoneNumber()) // Zone variable does not update immediately; stale closure
      zone++
      zone > highestZoneEver && dispatch(incrementHighestZoneEver())
      const newMonster = getRandomMonster({ zoneNumber: zone }) as Enemy
      dispatch(spawnMonster({ ...newMonster, alive: true }))
    }
  }, [monsterAlive])

  return (
    <>
      <div className="absolute top-[-4%]">
        Debug: monsterValue: {monsterValue} Zone: {zone}, clickDamage: {clickDamage}
      </div>
      <div className="absolute top-1 left-1/2 transform -translate-x-1/2">
        <div className="">{monsterName}</div>
        <div className="text-center">{children}</div>
      </div>
      <div
        className="absolute h-[80%] w-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
        onClick={clickHandler}>
        <img className="h-full w-full object-contain" src={monsterImage} />
      </div>
    </>
  )
}