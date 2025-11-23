import { memo, useEffect, useState } from "react"
import ReactModal from "react-modal"
import { Styles as ModalStylesheet } from "react-modal"
import { CancelIcon } from "../svgIcons/metaIcons"
import Achievements from "./achievements"
import handURL from "/assets/icons/hand-dark.webp"
import { METADATA_CONFIG } from "../../gameconfig/meta"
import { useAppDispatch, useAppSelector } from "../../redux/hooks"
import { selectAnimationPref, toggleAnimationPref } from "../../redux/metaSlice"
import Chat from "./chat"
import { usePageContext } from "vike-react/usePageContext"
import { navigate } from "vike/client/router"
import { useParams } from "../../gameconfig/customHooks"

export const Navigation = memo(function Navigation() {
  // const context = usePageContext()
  // const params = useParams(context)

  // const achievementParamUsed = params?.view === "achievements"
  // const chatParamUsed = params?.view === "chat"

  // const handleOpenAchievements = () => {
  //   if (!achievementParamUsed) navigate("/?view=achievements", { keepScrollPosition: true })
  // }

  // const handleOpenChat = () => {
  //   if (!chatParamUsed) navigate("/?view=chat", { keepScrollPosition: true })
  // }

  // const handleCloseAchievements = () => {
  //   navigate("/", { keepScrollPosition: true })
  // }

  // const handleCloseChat = () => {
  //   navigate("/", { keepScrollPosition: true })
  // }

  const [openChat, setOpenChat] = useState(false)
  const [openAchievements, setOpenAchievements] = useState(false)

  const handleOpenChat = () => {
    setOpenChat(true)
  }
  const handleCloseChat = () => {
    setOpenChat(false)
  }

  const handleOpenAchievements = () => {
    setOpenAchievements(true)
  }
  const handleCloseAchievements = () => {
    setOpenAchievements(false)
  }

  return (
    <div className="relative flex h-full flex-wrap items-center justify-between px-3 py-2 text-white md:pb-0 lg:pb-2">
      <NavigationLinkButton text="Achievements" onClick={handleOpenAchievements} />
      <NavigationLinkButton text="Chat" onClick={handleOpenChat} />

      <ReactModal
        isOpen={openAchievements}
        onRequestClose={handleCloseAchievements}
        contentLabel="Achievement list"
        style={achievementsStyle}
        overlayClassName="modal-overlay-mount overlay-white"
        className="modal-content-mount"
        closeTimeoutMS={200}>
        <Achievements />
        <button
          className="absolute -right-3 -top-3 z-[1000000] h-9 w-9 cursor-active rounded-full bg-white stroke-white shadow-[0_3px_5px_-2px_rgb(0_0_0_/_0.8),_0_3px_5px_-2px_rgb(0_0_0_/_0.6)] ring-2 ring-inset ring-amber-800"
          onClick={handleCloseAchievements}>
          {CancelIcon()}
        </button>
      </ReactModal>
      <ReactModal
        isOpen={openChat}
        onRequestClose={handleCloseChat}
        contentLabel="Chat"
        style={chatStyle}
        overlayClassName="modal-overlay-mount overlay-white"
        className="modal-content-mount"
        closeTimeoutMS={200}>
        <Chat />
        <button
          className="absolute -right-3 -top-3 z-[1000000] h-9 w-9 cursor-active rounded-full bg-white stroke-white shadow-[0_3px_5px_-2px_rgb(0_0_0_/_0.8),_0_3px_5px_-2px_rgb(0_0_0_/_0.6)] ring-2 ring-inset ring-amber-800"
          onClick={handleCloseChat}>
          {CancelIcon()}
        </button>
      </ReactModal>
      <div className="flex flex-col">
        <AnimationQualityButton />
        <div className="self-start text-sm opacity-50 lg:self-end">{METADATA_CONFIG.version}</div>
      </div>
    </div>
  )
})

type NavigationLinkButtonProps = {
  text: string
  onClick: () => void
}

export function AnimationQualityButton() {
  const dispatch = useAppDispatch()
  const animationPref = useAppSelector(selectAnimationPref)

  const animationPrefMap = {
    0: "Low",
    1: "Medium",
    2: "High",
  }
  const animationQuality = animationPrefMap[animationPref as keyof typeof animationPrefMap]

  return (
    <button
      className="-mt-0.5 cursor-active rounded border border-yellow-300 bg-blue-600 p-0.5"
      onClick={() => dispatch(toggleAnimationPref())}>
      Quality: {animationQuality}
    </button>
  )
}

export function NavigationLinkButton({ text, onClick }: NavigationLinkButtonProps) {
  return (
    <button
      onClick={onClick}
      style={{
        WebkitTextStrokeColor: "black",
        WebkitTextFillColor: "white",
        WebkitTextStrokeWidth: "1px",
      }}
      className="hover:bg-right-center block cursor-active select-none rounded-lg border-0 bg-gradient-to-tr from-red-500 via-orange-400 to-amber-500 px-6 py-3 text-center uppercase tracking-wider text-white shadow-lg transition duration-200 hover:scale-105 active:scale-95 active:transform"
      role="dialog">
      {text}
    </button>
  )
}

const achievementsStyle: ModalStylesheet = {
  content: {
    position: "absolute",
    top: "5%",
    right: "5%",
    bottom: "5%",
    left: "5%",
    border: "2px solid #ffcf40",
    background: "radial-gradient(circle, rgba(163,72,16,1) 0%, rgba(146,64,14,1) 35%, rgba(125,54,11,1) 100%)",
    boxShadow: "rgba(0, 0, 0, 0.25) 0px 14px 28px, rgba(0, 0, 0, 0.22) 0px 10px 10px",
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

const chatStyle: ModalStylesheet = {
  content: {
    position: "absolute",
    top: "5%",
    right: "5%",
    bottom: "5%",
    left: "5%",
    border: "2px solid #ffcf40",
    background: "#FFF",
    boxShadow: "rgba(0, 0, 0, 0.25) 0px 14px 28px, rgba(0, 0, 0, 0.22) 0px 10px 10px",
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

export default Navigation
