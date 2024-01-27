"use client"

import styles from "@/styles/GameChat.module.css"
import { useContext, useState } from "react"
import { SocketContext } from "../SocketConnection"
import UserIcon from "./UserIcon"
import { getPublicUuid } from "@/helpers/uuidHandler"
import { ChatAction } from "@/helpers/gameHandling"
import SendIcon from "@mui/icons-material/Send"
import { IconButton } from "@mui/material"
import ActiveUserCount from "./ActiveUsersCount"
import useViewportDimensions from "@/helpers/useViewportDimensions"
import CloseIcon from "@mui/icons-material/Close"
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp"

export interface ChatMessage {
  publicUuid: string
  lobbyId?: string
  message: string
  time: number
  messageUuid: string
}

export default function GameChat() {
  const [newMessage, setNewMessage] = useState("")
  const [isCollapsed, setIsCollapsed] = useState(true)
  const { chatData, submitAction } = useContext(SocketContext)

  const { isMobile } = useViewportDimensions()

  const publicUuid = getPublicUuid()

  const handleSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      submitMessage()
    }
  }

  const submitMessage = () => {
    if (!newMessage) return
    let chatAction: ChatAction
    chatAction = {
      type: "NEW_CHAT_MESSAGE",
      message: newMessage,
    }
    submitAction(chatAction)
    setNewMessage("")
  }

  return (
    <div
      className={`${styles.container} ${
        isMobile && isCollapsed ? styles.collapsed : ""
      }`}
    >
      <div className={styles.headerContainer}>
        <ActiveUserCount />
        {isMobile && (
          <IconButton
            aria-label="delete"
            size="small"
            onClick={() => setIsCollapsed((collapsed) => !collapsed)}
          >
            {!isCollapsed && <CloseIcon fontSize="inherit" />}
            {isCollapsed && <KeyboardArrowUpIcon fontSize="inherit" />}
          </IconButton>
        )}
      </div>
      <div className={styles.chatContainer}>
        {chatData.map((message) => (
          <ChatMessage
            key={message.messageUuid}
            publicUuid={message.publicUuid}
            content={message.message}
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
        />
        <IconButton aria-label="send" size="small" onClick={submitMessage}>
          <SendIcon fontSize="small" />
        </IconButton>
      </div>
    </div>
  )
}

const ChatMessage = ({
  publicUuid,
  content,
  ownMessage,
}: {
  publicUuid: string
  content: string
  ownMessage: boolean
}) => {
  return (
    <div
      className={`${styles.messageContainer} ${
        ownMessage ? styles.ownMessage : ""
      }`}
    >
      <UserIcon variant="avatar" size={"small"} publicUuid={publicUuid} />
      <div className={styles.textBox}>
        <span className={styles.text}>{content}</span>
      </div>
    </div>
  )
}
