import React from "react"
import clsx from "clsx/lite"
import { useAppDispatch, useAppSelector } from "../../redux/hooks"
import { selectZoneNumber, setFarmZone } from "../../redux/zoneSlice"

export default function ZoneSelector() {
  const dispatch = useAppDispatch()
  const currentZone = useAppSelector(selectZoneNumber)
  const selectedZones = Array.from({ length: 5 }, (cur, acc) => acc + 1)

  function handleZoneChange(e: React.MouseEvent<HTMLDivElement>) {
    const [elementName, deltaSuffix] = e.currentTarget.id.split(".")
    const delta = Number(deltaSuffix) - 1
    console.log(delta)
    if (delta) {
      dispatch(setFarmZone(delta))
    }
  }

  // Todo: Vary size
  // Todo: Vary opacity
  // Todo: Opacity gradient
  return (
    <div className="flex flex-row-reverse w-full gap-3 py-2 px-4">
      {selectedZones.map((zoneIndex) => (
        <div
          key={zoneIndex}
          id={`zone-delta.${zoneIndex}`}
          className="flex justify-center h-14 w-full text-black bg-white border border-black"
          onClick={handleZoneChange}>
          {`Zone ${currentZone - zoneIndex + 1}`}
        </div>
      ))}
    </div>
  )
}