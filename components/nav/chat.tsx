import React, { useEffect, useRef, useState } from "react"
import { ChatUser, ConfirmedMessage, MessageQueue, SystemMessage, UserMessage } from "../../models/slimechat"
import getInstance, { ChatConnection, EventHandlers, loadingSlime } from "../../gameconfig/slimechat"
import { useAutoScroll } from "../../gameconfig/customHooks"
import clsx from "clsx/lite"
import { formatDate } from "../../gameconfig/utils"

export default function Chat() {
  const [activeUsers, setActiveUsers] = useState<ChatUser[]>([])
  const [displayedMessages, setDisplayedMessages] = useState<(UserMessage | ConfirmedMessage | SystemMessage)[]>([])
  const [ChatInputFocused, setChatInputFocused] = useState(false)
  const [chatConnected, setChatConnected] = useState(true)
  const chatInstanceRef = useRef<ChatConnection | null>(null)
  const [userInfo, setUserInfo] = useState<ChatUser | null>(null)
  const [fadeIn, setFadeIn] = useState(false)
  const chatHistoryRef = useRef<HTMLDivElement>(null)
  const chatInputRef = useRef<HTMLTextAreaElement>(null)
  const awaitingFirstConnection = activeUsers.length === 0 && displayedMessages.length === 1

  const chatEventHandlers = {
    getActiveUsers: setActiveUsers,
    getMessageHistory: setDisplayedMessages,
    userJoined: [setDisplayedMessages, setActiveUsers],
    userLeft: setDisplayedMessages,
    messageReceived: setDisplayedMessages,
    serverMessage: setDisplayedMessages,
    updateModifiedMessage: setDisplayedMessages,
    removeDeletedMessage: setDisplayedMessages,
  } as EventHandlers
  const formatMessage = chatInstanceRef.current?.formatMessage

  const trySend = () => {
    if (chatInputRef.current && chatConnected) {
      const newMessage = chatInputRef.current.value
      const hasContent = newMessage.trim() !== ""
      if (!hasContent) return

      chatInstanceRef.current?.sendMessage(newMessage, setDisplayedMessages)

      chatInputRef.current.value = ""
      chatInputRef.current.focus()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      trySend()
    }
  }

  useEffect(() => {
    if (chatInputRef.current) {
      chatInputRef.current.focus()
      chatInputRef.current?.setSelectionRange(0, 0)
    }
    const now = Date.now()
    setDisplayedMessages([
      {
        userId: "System-32." + 1763414400,
        name: "🖥️ System",
        content: "Welcome to Slime Chat!",
        type: "user",
        unixTime: now,
        id: "system." + now,
      } as ConfirmedMessage, // Server messages appear as special chat messages rather than notifications
    ])
  }, [])

  useEffect(() => {
    chatInstanceRef.current = getInstance(setChatConnected, setUserInfo, chatEventHandlers)
    const handleBeforeUnload = () => {
      ChatConnection.cleanupInstance()
      chatInstanceRef.current = null
    }
    const fadeTimeout = window.setTimeout(() => setFadeIn(true), 300)

    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
      if (chatInstanceRef.current) {
        ChatConnection.cleanupInstance()
        chatInstanceRef.current = null
      }
      window.clearTimeout(fadeTimeout)
    }
  }, [])

  useAutoScroll(chatHistoryRef as React.RefObject<HTMLDivElement>, [displayedMessages])

  return (
    <div className="flex h-full grow gap-0.5 overflow-clip">
      <div className="h-full w-1/3 rounded border-2 border-slate-500 bg-gradient-to-br from-neutral-200 via-neutral-300 to-neutral-400">
        <ul className="flex h-full flex-col overflow-auto">
          {chatConnected &&
            activeUsers.map((user) => {
              const isMe = userInfo?.name === user.name
              return (
                <li
                  key={user.name}
                  className={clsx(
                    "flex items-center gap-2 rounded border-2 border-white/20 px-2 py-1 shadow-md",
                    isMe && "font-bold",
                  )}>
                  {user.name} {isMe && "(You)"}
                </li>
              )
            })}
        </ul>
      </div>
      <div className="flex h-full w-full flex-col justify-around">
        <h2 className="w-full text-center font-sigmar text-4xl text-green-600">Slime Chat</h2>

        {/* Chat history */}
        <div
          ref={chatHistoryRef}
          className="relative flex h-full w-full flex-col items-start overflow-y-auto overflow-x-clip px-4">
          {/* Loading slime */}
          {awaitingFirstConnection && (
            <span
              className={clsx(
                "absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/3 whitespace-pre-wrap break-all font-mono text-[10px] leading-3 text-emerald-800 text-opacity-80 transition-opacity duration-700",
                fadeIn ? "opacity-100" : "opacity-0",
              )}>
              {loadingSlime}
            </span>
          )}
          {!awaitingFirstConnection &&
            displayedMessages.map((message, i) => (
              <div
                key={i}
                className="flex flex-col"
                // Transparency for unconfirmed user messages
                style={{
                  opacity: (message.type === "user" && "id" in message) || message.type === "system" ? 1 : 0.3,
                }}>
                <div className="flex items-center gap-1">
                  {message.type === "user" && (
                    <>
                      <p className="text-lg font-bold" style={{ color: message.color }}>
                        {message.name}
                      </p>
                      <p className="text-end text-sm text-gray-500">at {formatDate(new Date(message.unixTime))}</p>
                    </>
                  )}
                </div>
                <p
                  className={clsx(
                    "whitespace-pre-wrap break-all",
                    message.type === "system" ? "ml-2 text-sm text-slate-600" : "ml-4",
                    message.type === "system" && "text-center",
                    message.content.startsWith("/me") && "italic text-gray-500",
                    message.content.startsWith("/ascii") && "font-mono",
                  )}>
                  {formatMessage && formatMessage(message)}
                </p>
              </div>
            ))}
        </div>

        <div
          className={clsx(
            "relative flex h-24 w-full items-center border-2",
            ChatInputFocused ? "border-slate-400" : "border-slate-500",
          )}>
          {/* Error message */}
          {!chatConnected && (
            <div className="absolute -top-7 flex w-full items-center justify-center space-x-1">
              <p className="pr-2 text-red-500">Reconnecting to chat</p>
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-2 w-2 animate-pulse rounded-full bg-red-400"
                  style={{
                    animationDelay: `${i * 0.2}s`,
                    animationDuration: "1s",
                  }}
                />
              ))}
            </div>
          )}

          {/* Chat input */}
          <textarea
            ref={chatInputRef}
            maxLength={5000} // Limit from server appsettings.json
            placeholder="Message Slime Chat"
            onFocus={() => setChatInputFocused(true)}
            onBlur={() => setChatInputFocused(false)}
            name="chat"
            className="h-full w-full grow resize-none overflow-auto p-1 focus:outline-none"
            onKeyDown={handleKeyDown}
          />
          <button
            className={clsx(
              "font-ui m-2 mr-4 flex h-12 cursor-active items-center justify-center rounded border border-slate-600 bg-slate-200 px-6 py-4 text-center font-bold text-slate-600 shadow-md",
              chatConnected ? "hover:bg-green-300" : "hover:bg-red-300",
            )}
            onClick={trySend}>
            Send
          </button>
        </div>
      </div>
    </div>
  )
}
