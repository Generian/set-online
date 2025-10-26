"use client"

import styles from "@/styles/GameChat.module.css"
import { useContext, useEffect, useState, useRef } from "react"
import { SocketContext } from "../SocketConnection"
import UserIcon from "./UserIcon"
import { getPublicUuid } from "@/helpers/uuidHandler"
import { ChatAction } from "@/helpers/gameHandling"
import SendIcon from "@mui/icons-material/Send"
import EmailIcon from "@mui/icons-material/Email"
import { IconButton, Switch } from "@mui/material"
import ActiveUserCount from "./ActiveUsersCount"
import useViewportDimensions from "@/helpers/useViewportDimensions"
import CloseIcon from "@mui/icons-material/Close"
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp"
import { convertTimestampToHHMM } from "@/helpers/utils"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { getCookie, setCookie } from "@/helpers/cookies"

export interface ChatMessage {
  publicUuid: string
  lobbyId?: string
  message: string
  time: number
  messageUuid: string
  addGameLink?: boolean
}

interface ChatComponentProps {
  activePlayerMode?: boolean
}

export default function ChatComponent({
  activePlayerMode,
}: ChatComponentProps) {
  const [newMessage, setNewMessage] = useState("")
  const [isCollapsed, setIsCollapsed] = useState(true)
  const [onlyLobbyChat, setOnlyLobbyChat] = useState<boolean | null>(null)
  const [newUnreadMessages, setNewUnreadMessages] = useState<number>(0)
  const [latestReadMessageTime, setLatestReadMessageTime] = useState<
    number | undefined
  >(undefined)

  const { chatData, submitAction } = useContext(SocketContext)

  const { isMobile } = useViewportDimensions()

  const publicUuid = getPublicUuid()
  const lobbyId = useSearchParams()?.get("lobbyId")
  const chatContainerRef = useRef<HTMLDivElement>(null)

  // Initialize latestReadMessageTime from cookie on mount
  useEffect(() => {
    const savedLatestReadMessageTime = getCookie("latestReadMessageTime")
    if (
      savedLatestReadMessageTime !== null &&
      savedLatestReadMessageTime !== undefined
    ) {
      setLatestReadMessageTime(parseInt(savedLatestReadMessageTime))
    }
  }, [])

  // Update newUnreadMessages when chatData changes
  useEffect(() => {
    // Find the latest message that the user has read which is not sent or triggered by themselves
    const latestUnreadMessagesByOthers = chatData.filter(
      (message) =>
        message.publicUuid !== publicUuid &&
        message.time > (latestReadMessageTime ? latestReadMessageTime : 0) &&
        message.lobbyId === (!!onlyLobbyChat ? lobbyId : message.lobbyId)
    )

    setNewUnreadMessages(latestUnreadMessagesByOthers.length)
  }, [chatData, onlyLobbyChat, isCollapsed])

  // Update latestReadMessageTime when chatData changes
  useEffect(() => {
    if (!isCollapsed) {
      const newLatestUnreadMessageTime = Math.max(
        ...chatData
          .filter(
            (message) =>
              message.lobbyId === (!!onlyLobbyChat ? lobbyId : message.lobbyId)
          )
          .map((message) => message.time)
      )
      setLatestReadMessageTime(newLatestUnreadMessageTime)
      setCookie("latestReadMessageTime", newLatestUnreadMessageTime.toString())
    }
  }, [chatData, isCollapsed, onlyLobbyChat])

  // Set onlyLobbyChat to true if lobbyId is present, false if not
  useEffect(() => {
    if (lobbyId && onlyLobbyChat === null) {
      setOnlyLobbyChat(true)
    } else if (!lobbyId) {
      setOnlyLobbyChat(false)
    }
  }, [lobbyId])

  // Scroll to bottom when chat is uncollapsed or when new message is sent or arrives
  useEffect(() => {
    if (!isCollapsed && chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [isCollapsed, chatData])

  // ------------------------------------------------------------
  // Event handlers
  // ------------------------------------------------------------

  const handleSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      submitMessage()
    }
  }

  const submitMessage = () => {
    if (!newMessage) return

    // Limit message length to 500 characters
    if (newMessage.length > 500) {
      return // Don't send message if too long
    }

    let chatAction: ChatAction
    chatAction = {
      type: "NEW_CHAT_MESSAGE",
      message: newMessage,
    }
    submitAction(chatAction)
    setNewMessage("")
  }

  const toggleOnlyLobbyChat = () => {
    setOnlyLobbyChat((onlyLobbyChat) => !onlyLobbyChat)
  }

  return (
    <div
      className={`${styles.container} ${
        isMobile && isCollapsed ? styles.collapsed : ""
      } ${activePlayerMode ? styles.activePlayerMode : ""} ${
        !newUnreadMessages && isCollapsed && activePlayerMode
          ? styles.fullyCollapsed
          : ""
      }`}
    >
      <div
        className={`${styles.headerContainer}`}
        onClick={() =>
          isCollapsed && isMobile && setIsCollapsed((collapsed) => !collapsed)
        }
      >
        {!(activePlayerMode && isCollapsed) && <ActiveUserCount />}
        {!!newUnreadMessages &&
          isCollapsed &&
          !activePlayerMode &&
          isMobile && (
            <div className={styles.additionalChatInfo}>
              <div className={styles.additionalChatInfoInsideContainer}>
                <span>{`${newUnreadMessages} unread message${
                  newUnreadMessages > 1 ? "s" : ""
                }`}</span>
                <div className={styles.newMessageIndicator}></div>
              </div>
            </div>
          )}
        {lobbyId && !isCollapsed && (
          <div className={styles.additionalChatInfo}>
            <span>Only lobby chat</span>
            <Switch
              size="small"
              checked={!!onlyLobbyChat}
              onChange={toggleOnlyLobbyChat}
              inputProps={{ "aria-label": "Only lobby chat toggle" }}
            />
          </div>
        )}
        {isMobile && (
          <IconButton
            size="small"
            onClick={() =>
              !isCollapsed && setIsCollapsed((collapsed) => !collapsed)
            }
          >
            {!isCollapsed && <CloseIcon fontSize="inherit" />}
            {isCollapsed && !activePlayerMode && (
              <KeyboardArrowUpIcon fontSize="inherit" />
            )}
            {isCollapsed && activePlayerMode && (
              <div className={styles.letterIconContainer}>
                <EmailIcon fontSize="inherit" />
                <div className={styles.newMessageIndicator}></div>
              </div>
            )}
          </IconButton>
        )}
      </div>
      <div className={styles.chatContainer} ref={chatContainerRef}>
        {chatData
          .filter((message) => {
            let shouldShowMessage = true
            if (onlyLobbyChat) {
              shouldShowMessage = message.lobbyId === lobbyId
            }
            if (message.addGameLink && message.publicUuid === publicUuid) {
              shouldShowMessage = false
            }
            return shouldShowMessage
          })
          .map((message) => (
            <ChatMessage
              key={message.messageUuid}
              chatMessage={message}
              ownMessage={publicUuid == message.publicUuid}
            />
          ))}
      </div>
      <div className={styles.inputContainer}>
        <input
          type="text"
          className={styles.input}
          value={newMessage}
          onChange={(event) => setNewMessage(event.target.value)}
          onKeyDown={(e) => handleSubmit(e)}
          maxLength={500}
        />
        <IconButton aria-label="send" size="small" onClick={submitMessage}>
          <SendIcon fontSize="small" />
        </IconButton>
      </div>
    </div>
  )
}

const ChatMessage = ({
  chatMessage,
  ownMessage,
}: {
  chatMessage: ChatMessage
  ownMessage: boolean
}) => {
  const { publicUuid, message, time, addGameLink, lobbyId } = chatMessage
  return (
    <div
      className={`${styles.messageContainer} ${
        ownMessage ? styles.ownMessage : ""
      }`}
    >
      <UserIcon variant="avatar" size={"small"} publicUuid={publicUuid} />
      <div className={styles.textBox}>
        <span
          className={`${styles.text} ${
            addGameLink ? styles.systemMessage : ""
          }`}
        >
          {message}
          {addGameLink && (
            <>
              <span> </span>
              <Link href={`/game?lobbyId=${lobbyId}`}>{`Watch here`}</Link>
            </>
          )}
        </span>
      </div>
      <div className={styles.time}>
        <span className={styles.timeText}>{convertTimestampToHHMM(time)}</span>
      </div>
    </div>
  )
}
