import clsx from "clsx/lite"
import { JSX, MouseEvent, useEffect, useRef, useState } from "react"
import PrestigeButton from "./prestigeButton"
import { useAppDispatch, useAppSelector } from "../../../redux/hooks"
import { UPGRADE_CONFIG } from "../../../gameconfig/upgrades"
import Currency from "../currency"
import { PlasmaIcon } from "../../svgIcons/resourceIcons"
import {
  resetPlasmaReserved,
  selectPlasma,
  selectPlasmaReserved,
  reservePlasma,
  updatePrestige,
  setPrestigeUpgradesPending,
  selectPendingPPurchases,
} from "../../../redux/playerSlice"
import { PrestigeUpgradeId } from "../../../models/upgrades"
import ReactModal from "react-modal"
import { Styles as ModalStylesheet } from "react-modal"
import { CancelIcon } from "../../svgIcons/metaIcons"
import { selectHighestZone, selectHighestZoneEver } from "../../../redux/statsSlice"
import handURL from "/assets/icons/hand-dark.webp"
import { selectAnimationPref, setFading } from "../../../redux/metaSlice"
import { PERFORMANCE_CONFIG } from "../../../gameconfig/meta"
import Confirmation from "./confirmation"
import topologyURL from "../../../assets/icons/topologyBg.svg"
import PrestigeTooltip from "./prestigeTooltip"
import { useToolTip } from "../../../gameconfig/customHooks"

export default function Prestige({ PlayerHealthMemo }: { PlayerHealthMemo: JSX.Element }) {
  const dispatch = useAppDispatch()
  const plasmaSelector = selectPlasma
  const plasmaReserved = useAppSelector(selectPlasmaReserved)
  const pendingUpgrades = useAppSelector(selectPendingPPurchases)
  const highZoneEver = useAppSelector(selectHighestZoneEver)
  const highestZone = useAppSelector(selectHighestZone)
  const animationPref = useAppSelector(selectAnimationPref)
  const fullAnimations = animationPref > 1
  const zoneTenComplete = highestZone > 10

  const [prestigeDialogue, setPrestigeDialogue] = useState(false)
  const [prestigeIntent, setPrestigeIntent] = useState(false)
  const [toucherCounter, setTouchCounter] = useState(0)
  const [resetCounter, setResetCounter] = useState(0)
  const [animateMount, setAnimateMount] = useState(false)
  const [hoveredUpgrade, setHoveredUpdate] = useState<PrestigeUpgradeId | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)

  const { position, setIsVisible, isPositionReady } = useToolTip({
    containerRef,
    tooltipRef,
  })

  const showToolTip = (prestigeUpgrade: PrestigeUpgradeId | null, e?: MouseEvent<HTMLButtonElement>) => {
    if (hoveredUpgrade && prestigeUpgrade) setTouchCounter(0)

    setHoveredUpdate(prestigeUpgrade)
    //@ts-ignore - linter won't accept union between dom event and virtualdom event types :(
    setIsVisible(prestigeUpgrade, e)
  }

  useEffect(() => {
    // Require two touches on mobile
    if (toucherCounter > 0 && !isPositionReady) setTouchCounter(0)
  }, [isPositionReady, toucherCounter])

  useEffect(() => {
    const hasPendingUpgrades = Object.entries(pendingUpgrades).length === 1

    if (hasPendingUpgrades) {
      const img = new Image()
      img.src = topologyURL
    }
  }, [pendingUpgrades])

  useEffect(() => {
    setTimeout(() => setAnimateMount(true), 200)
  }, [])

  const onReset = () => {
    setResetCounter((prev) => prev + 1)
    dispatch(resetPlasmaReserved())
  }

  const initiatePrestige = () => {
    setPrestigeIntent(true)
    setTimeout(() => {
      dispatch(setFading(true))
      setTimeout(() => {
        dispatch(updatePrestige())
      }, PERFORMANCE_CONFIG.fadeoutDuration)
    }, 4000)
  }
  function updateCart(e: React.MouseEvent<HTMLButtonElement>, cost: number, purchaseCount: number) {
    const upgradeId = e.currentTarget.id as PrestigeUpgradeId

    dispatch(setPrestigeUpgradesPending({ upgradeId, cost, purchaseCount }))
    dispatch(reservePlasma())
  }

  return (
    <div ref={containerRef} className="p-2 md:p-4">
      <div
        className={clsx(
          "relative flex h-full min-h-[722px] flex-col rounded-lg bg-cyan-900/60 p-3 transition-all",

          // Border animation
          "before:pointer-events-none before:absolute before:rounded-lg before:transition-all before:duration-500 before:ease-out before:content-['']",
          "before:border-2 before:border-cyan-500/50 before:shadow-panel-prestige-inner",

          animateMount || animationPref < 1 ? "before:inset-0" : "before:-inset-2 md:before:-inset-4",
        )}>
        <div className="flex w-full flex-col-reverse flex-wrap md:h-auto md:flex-row md:flex-nowrap">
          <Currency
            key={resetCounter}
            image={PlasmaIcon()}
            fontStyle="text-cyan-300 font-paytone"
            currencySelector={plasmaSelector}
            suffix={plasmaReserved > 0 ? `  (-${plasmaReserved})` : undefined}
            animateOnMount={animateMount}
          />
          {PlayerHealthMemo}
        </div>
        <div className="mx-2 mt-2 flex flex-wrap items-start justify-center gap-2 font-sans">
          {Object.values(UPGRADE_CONFIG.prestigeUpgrades).map((prestigeUpgrade) => {
            if (prestigeUpgrade.visibleAtZone > highZoneEver) return null

            return (
              <PrestigeButton
                key={prestigeUpgrade.id + resetCounter}
                hidden={highZoneEver < prestigeUpgrade.visibleAtZone}
                config={prestigeUpgrade}
                updateCart={updateCart}
                showToolTip={showToolTip}
                touchState={{ counter: toucherCounter, setTouchCounter: setTouchCounter }}
              />
            )
          })}
        </div>

        <div className="relative flex h-full w-full grow items-end justify-center gap-4">
          <button
            onClick={() => setPrestigeDialogue(true)}
            disabled={!zoneTenComplete}
            className={clsx(
              "portal-btn cursor-active disabled:cursor-inactive",
              fullAnimations ? "portal-btn-animated" : "portal-btn-simple",
              prestigeIntent && "portal-btn-prestige z-10",
              !zoneTenComplete && "portal-btn-disabled",
            )}>
            <span className="portal-btn-text">Prestige</span>
            {fullAnimations && (
              <>
                <div className="portal-rings">
                  <div className="portal-ring portal-ring-1" />
                  <div className="portal-ring portal-ring-2" />
                  <div className="portal-ring portal-ring-3" />
                </div>
              </>
            )}
          </button>
          <button
            onClick={onReset}
            disabled={!plasmaReserved}
            className={clsx(
              "my-4 h-16 w-44 cursor-active rounded-md border-2 font-arial text-xl font-bold tracking-widest shadow-2xl transition-all duration-200",
              plasmaReserved
                ? "text-shadow-dark border-red-900 bg-gradient-to-b from-red-900 to-red-950 text-red-100 hover:border-red-800 hover:from-red-800 hover:to-red-900 hover:text-red-50 hover:shadow-red-900/50"
                : "cursor-inactive border-red-950 bg-gradient-to-b from-red-950 to-black text-red-200/50 opacity-60",
            )}>
            RESET
          </button>
        </div>
        <PrestigeModal
          prestigeDialogue={prestigeDialogue}
          prestigeIntent={prestigeIntent}
          setPrestigeDialogue={setPrestigeDialogue}
          initiatePrestige={initiatePrestige}
        />
        <PrestigeTooltip
          visible={!!hoveredUpgrade && isPositionReady}
          position={position}
          tooltipRef={tooltipRef}
          hoveredUpgrade={hoveredUpgrade}
        />
      </div>
    </div>
  )
}

interface ModalProps {
  prestigeDialogue: boolean
  prestigeIntent: boolean
  setPrestigeDialogue: (isOpen: boolean) => void
  initiatePrestige: () => void
}

function PrestigeModal({ prestigeDialogue, prestigeIntent, setPrestigeDialogue, initiatePrestige }: ModalProps) {
  return (
    <ReactModal
      isOpen={prestigeDialogue && !prestigeIntent}
      onRequestClose={() => setPrestigeDialogue(false)}
      contentLabel="Prestige confirmation prompt"
      style={confirmPrestigeStyle}
      overlayClassName="modal-overlay-mount"
      className="modal-content-mount"
      closeTimeoutMS={200}>
      <Confirmation initiatePrestige={initiatePrestige} />
      <button
        className="absolute -right-3 -top-3 z-[1000000] h-9 w-9 cursor-active rounded-full bg-white stroke-white shadow-[0_3px_5px_-2px_rgb(0_0_0_/_0.8),_0_3px_5px_-2px_rgb(0_0_0_/_0.6)] ring-2 ring-inset ring-amber-800 disabled:cursor-inactive"
        onClick={() => setPrestigeDialogue(false)}>
        {CancelIcon()}
      </button>
    </ReactModal>
  )
}

const confirmPrestigeStyle: ModalStylesheet = {
  content: {
    position: "absolute",
    top: "10%",
    right: "10%",
    bottom: "10%",
    left: "10%",
    boxShadow: "0px 0px 21px 12px rgba(0,0,0,0.46) inset",
    border: "2px solid #a5f3fc",
    background: "radial-gradient(circle,rgba(14, 116, 144, 1) 25%, rgba(21, 94, 117, 1) 75%)",
    overflow: "visible",
    WebkitOverflowScrolling: "touch",
    borderRadius: "12px",
    outline: "none",
    padding: "20px",
    cursor: `url(${handURL}) 0 0, pointer`,
    zIndex: 1000,
  },
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    cursor: `url(${handURL}) 0 0, pointer`,
    zIndex: 1000,
  },
}
