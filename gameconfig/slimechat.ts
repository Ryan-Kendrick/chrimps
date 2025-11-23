import { HubConnection, HubConnectionBuilder, LogLevel } from "@microsoft/signalr"
import {
  ChatUser,
  ConfirmedMessage,
  DisplayedMessages,
  MessageQueue,
  SystemMessage,
  UserMessage,
} from "../models/slimechat"
import { METADATA_CONFIG } from "./meta"
import { getRandomColor } from "./utils"
import React from "react"

type MessageSetter = React.Dispatch<React.SetStateAction<DisplayedMessages>>
type ChatUserSetter = React.Dispatch<React.SetStateAction<ChatUser | null>>
type ActiveUsersSetter = React.Dispatch<React.SetStateAction<ChatUser[]>>

type GetActiveUsersSetter = React.Dispatch<React.SetStateAction<ChatUser[]>>

export type EventHandlers = {
  getActiveUsers: GetActiveUsersSetter
  getMessageHistory: MessageSetter
  userJoined: [MessageSetter, ActiveUsersSetter]
  userLeft: MessageSetter
  messageReceived: MessageSetter
  serverMessage: MessageSetter
}

class ChatConnection {
  private _connection: HubConnection
  private _messageRetryTime = 60000
  private _optimismTime = 6000
  private static _slowConnectTimer?: NodeJS.Timeout | null
  private static _reconnectTimer?: NodeJS.Timeout | null
  private _messageQueue: MessageQueue = []
  private _eventMap: { [key: string]: string } = {
    getActiveUsers: "GetActiveUsers",
    getMessageHistory: "GetMessageHistory",
    userJoined: "UserJoined",
    userLeft: "UserLeft",
    messageReceived: "MessageReceived",
    serverMessage: "ServerMessage",
  }
  public user: ChatUser
  static ChatInstance: ChatConnection

  constructor(
    isConnectedSetterFn: (isConnected: boolean) => void,
    userInfoSetterFn: ChatUserSetter,
    eventHandlers: EventHandlers,
  ) {
    this._connection = new HubConnectionBuilder()
      .withUrl(METADATA_CONFIG.chatServerUrl)
      .configureLogging(LogLevel.Information)
      .withAutomaticReconnect()
      .build()
    this.user = this.createDefaultUser()
    userInfoSetterFn(this.user)

    const { getActiveUsers, getMessageHistory, userLeft, messageReceived, serverMessage, userJoined } = eventHandlers

    this._connection.on("GetActiveUsers", (activeUsers: ChatUser[]) => getActiveUsers(activeUsers))
    this._connection.on("GetMessageHistory", (messageHistory: ConfirmedMessage[]) => getMessageHistory(messageHistory))
    this._connection.on("UserJoined", (joinedUser: ChatUser) => {
      const [messageSetter, userSetter] = userJoined
      const userJoinedMessage = { content: `${joinedUser.name} has joined the chat.`, type: "system" } as SystemMessage

      messageSetter((prev) => [...prev, userJoinedMessage])
      userSetter((users) => [...users, joinedUser])
      // Server will now invoke GetActiveUsers
    })

    this._connection.on("UserLeft", (disconnectedUser: ChatUser) => {
      const userLeftMessage = { content: `${disconnectedUser.name} left the chat.`, type: "system" } as SystemMessage
      userLeft((messageHistory) => [...messageHistory, userLeftMessage])
    })

    this._connection.on("MessageReceived", (incomingMessage: ConfirmedMessage) => {
      messageReceived((prevMessages) => {
        for (let i = prevMessages.length - 1; i >= 0; i--) {
          const msg = prevMessages[i]
          if (msg.type !== "user") continue

          // Loop through messages in reverse to find the uncomfirmed message
          if (incomingMessage.unixTime === msg.unixTime && incomingMessage.name === msg.name) {
            const updatedMessages = [...prevMessages]
            // Replace unconfirmed message with confirmed one
            updatedMessages[i] = { ...incomingMessage }
            return updatedMessages
          }
        }
        return [...prevMessages, incomingMessage]
      })
    })

    this._connection.on("ServerMessage", (incomingMessage: ConfirmedMessage) => {
      serverMessage((messageHistory) => [...messageHistory, incomingMessage])
    })

    this.connect(isConnectedSetterFn)
  }

  private createDefaultUser(): ChatUser {
    const name = `Slime-${Math.floor(Math.random() * 1000)}`
    const color = getRandomColor()
    const id = `${name}.${Date.now()}`

    this.user = {
      id,
      name,
      color,
    } as ChatUser

    return this.user
  }

  private async connect(isConnectedSetterFn: (isConnected: boolean) => void): Promise<void> {
    if (this._connection.state !== "Disconnected") {
      console.error("Connect chat called but the chat state is not currently 'Disconnected'")
      return
    }

    if (ChatConnection._slowConnectTimer) {
      clearTimeout(ChatConnection._slowConnectTimer)
      ChatConnection._slowConnectTimer = undefined
    }
    if (ChatConnection._reconnectTimer) {
      clearTimeout(ChatConnection._reconnectTimer)
      ChatConnection._reconnectTimer = undefined
    }

    try {
      console.log("Connecting to chat...")

      ChatConnection._slowConnectTimer = setTimeout(() => {
        console.warn(
          "Server response taking longer than expected, might be a cold start. Displaying reconnecting message",
        )
        isConnectedSetterFn(false)
      }, this._optimismTime)

      await this._connection.start()

      if (ChatConnection._slowConnectTimer) {
        clearTimeout(ChatConnection._slowConnectTimer)
        ChatConnection._slowConnectTimer = null
      }

      isConnectedSetterFn(true)
      this._connection.invoke("JoinChat", this.user).catch((err) => {
        console.error("Error notifying server of user joined chat:", err)
      })
      this.onConnectTasks()
    } catch (err: any) {
      console.error("Failed to connect to chat:", err)

      if (err.message && err.message.includes("stopped during negotiation")) {
        return
      }

      isConnectedSetterFn(false)

      if (ChatConnection._slowConnectTimer) {
        clearTimeout(ChatConnection._slowConnectTimer)
        ChatConnection._slowConnectTimer = undefined
      }

      ChatConnection._reconnectTimer = setTimeout(() => {
        this.connect(isConnectedSetterFn)
      }, 5000)
    }
  }

  private onConnectTasks() {
    this.flushMessageQueue()
  }

  private flushMessageQueue() {
    const now = Date.now()
    const messagesToSend = this._messageQueue.filter((item) => now - item.createdAt <= this._messageRetryTime)

    messagesToSend.forEach((item) => {
      this._connection.invoke("BroadcastMessage", item.message).catch((error) => {
        console.error("Error sending queued message:", error)
      })
    })

    this._messageQueue = []
  }

  public sendMessage(newMessage: string, messageSetterFn: MessageSetter) {
    const messageData = {
      name: this.user.name,
      content: newMessage,
      type: "user",
      unixTime: Date.now(),
      color: this.user.color,
    } as UserMessage

    messageSetterFn((prevMessages) => [...prevMessages, messageData])

    // Send the message if connected to chat, otherwise add to message queue
    if (this._connection.state === "Connected") {
      this._connection.invoke("BroadcastMessage", messageData).catch((error) => {
        console.error("Error sending message:", error)
      })
    } else {
      this._messageQueue.push({ message: messageData, createdAt: Date.now() })
    }
  }

  public static cleanupInstance() {
    if (!this.ChatInstance) {
      console.warn("No ChatInstance to clean up.")
      return
    }

    // Remove all event handlers - inefficient for a singleton?
    // const eventNames = Object.values(this.ChatInstance._eventMap)
    // for (const eventName of eventNames) {
    //   this.ChatInstance._connection.off(eventName)
    // }

    this.ChatInstance._connection.stop().catch((err) => console.error(err))
    this.ChatInstance = null as unknown as ChatConnection
  }

  public static getInstance(
    isConnectedSetterFn: (isConnected: boolean) => void,
    userInfoSetterFn: ChatUserSetter,
    eventHandlers: EventHandlers,
  ): ChatConnection {
    if (!ChatConnection.ChatInstance)
      ChatConnection.ChatInstance = new ChatConnection(isConnectedSetterFn, userInfoSetterFn, eventHandlers)

    return ChatConnection.ChatInstance
  }
}

export { ChatConnection }
export default ChatConnection.getInstance
