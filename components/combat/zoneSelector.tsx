import clsx from "clsx/lite"
import { useAppDispatch, useAppSelector } from "../../redux/hooks"
import { selectZoneState, zoneSelected } from "../../redux/zoneSlice"
import { useState } from "react"

export default function ZoneSelector() {
  const dispatch = useAppDispatch()
  const { currentZoneNumber, zoneInView, farmZoneNumber } = useAppSelector(selectZoneState)
  const [prevZone, setPrevZone] = useState(zoneInView === farmZoneNumber ? farmZoneNumber : currentZoneNumber)

  const selectedZones = Array.from({ length: 5 }, (cur, acc) => acc + 1)

  function handleZoneChange(e: React.MouseEvent<HTMLButtonElement>) {
    const [elementName, deltaSuffix] = e.currentTarget.id.split(".")
    const zoneDelta = Number(deltaSuffix) - 1
    const nextZone = currentZoneNumber - zoneDelta

    // prevZone used by spawn middleware to be determine if zone transition is needed
    dispatch(zoneSelected({ nextZone, prevZone: prevZone }))
    setPrevZone(nextZone)
  }

  const opacitySteps = ["opacity-100", "opacity-90", "opacity-80", "opacity-70", "opacity-60"]
  const scaleSteps = ["scale-100", "scale-95", "scale-90", "scale-85", "scale-80"]

  return (
    <div className="mt-6 flex h-20 w-full flex-row-reverse justify-around gap-1.5 rounded-xl border-2 border-white bg-black bg-opacity-30 p-1.5 lg:mb-2">
      {selectedZones.map((zoneIndex) => {
        const thisZoneNumber = currentZoneNumber - zoneIndex + 1

        return (
          <button
            key={`outer.${zoneIndex}`}
            id={`zone-delta.${zoneIndex}`}
            className={clsx(
              "flex h-16 w-[7.111rem] border-4",
              scaleSteps[zoneIndex - 1],
              zoneInView === thisZoneNumber ? "cursor-inactive border-yellow-500" : "cursor-active border-gray-800",
            )}
            onClick={handleZoneChange}>
            <div
              key={`inner.${zoneIndex}`}
              className={clsx(
                "flex h-full w-full justify-center bg-meadow bg-cover bg-no-repeat text-xl text-black",
                opacitySteps[zoneIndex - 1],
              )}>
              {`${thisZoneNumber}`}
            </div>
          </button>
        )
      })}
    </div>
  )
}
