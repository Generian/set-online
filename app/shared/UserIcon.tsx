"use client"

import { getPublicUuid } from "@/helpers/uuidHandler"
import styles from "@/styles/UserIcon.module.css"
import Link from "next/link"
import { useContext } from "react"
import { SocketContext } from "../SocketConnection"
import { UserPreferencesContext } from "../UserPreferences"

const UserIcon = ({
  publicUuid,
  variant,
  size,
  showOnlineStatus,
}: {
  publicUuid?: string
  variant?: "full" | "avatar"
  size?: "small" | "medium" | "large"
  showOnlineStatus?: boolean
}) => {
  let usernameString
  let avatar

  const localPublicUuid = getPublicUuid()
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
        <div className={styles.avatar}>{initials}</div>
      </Link>
    )
  } else {
    return (
      <div className={`${styles.avatar} ${size ? styles[size] : ""}`}>
        <span title={usernameString}>{initials}</span>
        {showOnlineStatus && (
          <div
            className={`${styles.onlineStatus} ${
              user?.online ? "" : styles.offline
            }`}
          ></div>
        )}
      </div>
    )
  }
}

export default UserIcon
