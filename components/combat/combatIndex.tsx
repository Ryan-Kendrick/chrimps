import Healthbar from "./healthbar"
import Monster from "./monster"
import ZoneVisualiser from "./zoneVisualiser"

export default function Combat() {
  return (
    <div className="flex relative justify-center min-h-[80svh] text-white basis-2/5 bg-gradient-to-b from-purple-800 via-purple-900 to-violet-950">
      <Monster>
        <Healthbar />
      </Monster>
      <ZoneVisualiser />
    </div>
  )
}