"use client"

import { getPublicUuid } from "@/helpers/uuidHandler"
import styles from "@/styles/UserIcon.module.css"
import Link from "next/link"
import { useContext } from "react"
import { SocketContext } from "../SocketConnection"
import { UserPreferencesContext } from "../UserPreferences"
import { Tooltip } from "@mui/material"

const UserIcon = ({
  publicUuid,
  variant,
  size,
  showOnlineStatus,
  isBlocked = false,
}: {
  publicUuid?: string
  variant?: "full" | "avatar"
  size?: "small" | "medium" | "large"
  showOnlineStatus?: boolean
  isBlocked?: boolean
}) => {
  let usernameString

  const localPublicUuid = getPublicUuid()
  const isOtherPlayer = publicUuid && localPublicUuid != publicUuid
  const { userData } = useContext(SocketContext)

  const user = publicUuid ? userData[publicUuid] : undefined

  if (!publicUuid || localPublicUuid == publicUuid) {
    const { globalUsername } = userData[localPublicUuid] || {}
    const { username } = useContext(UserPreferencesContext)

    usernameString = globalUsername
      ? globalUsername
      : username
      ? username
      : "Unknown Player"
  } else if (user) {
    const { globalUsername } = user

    usernameString = globalUsername ? globalUsername : "Unknown Player"
  } else {
    console.error("No user found based on user id provided:", publicUuid)
  }

  const initials = usernameString ? usernameString.slice(0, 2) : "UP"

  if (variant == "full" || !variant) {
    return (
      <Link href={"/settings"} className={styles.userContainer}>
        <div className={styles.username}>{usernameString}</div>
        <div
          className={`${styles.avatar} ${
            isOtherPlayer ? styles.otherPlayerAvatar : ""
          }`}
        >
          {initials}
        </div>
      </Link>
    )
  } else {
    return (
      <Tooltip
        title={usernameString}
        arrow
        slotProps={{
          popper: {
            modifiers: [
              {
                name: "offset",
                options: {
                  offset: [0, -14],
                },
              },
            ],
          },
        }}
      >
        <div
          className={`${styles.avatar} ${size ? styles[size] : ""} ${
            isOtherPlayer ? styles.otherPlayerAvatar : ""
          } ${isBlocked ? styles.blockedAvatar : ""}`}
        >
          <span title={usernameString}>{initials}</span>
          {showOnlineStatus && (
            <div
              className={`${styles.onlineStatus} ${
                user?.online ? "" : styles.offline
              }`}
            ></div>
          )}
        </div>
      </Tooltip>
    )
  }
}

export default UserIcon
