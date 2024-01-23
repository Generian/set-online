"use client"

import styles from "@/styles/Header.module.css"
import { SocketContext } from "./SocketConnection"
import { useContext } from "react"
import { getPublicUuid } from "@/helpers/uuidHandler"
import Image from "next/image"
import logo from "public/set-logo.jpg"
import useUserPreferences from "@/helpers/useUserPreferences"
import Link from "next/link"

const Header = () => {
  return (
    <div className={styles.container}>
      <Link href={"/"}>
        <div className={styles.logoContainer}>
          <Image
            src={logo}
            alt="logo"
            priority={true}
            className={styles.logo}
          />
        </div>
      </Link>
      <div className={styles.user}>
        <User />
      </div>
    </div>
  )
}

const User = () => {
  const { userData } = useContext(SocketContext)
  const user = userData[getPublicUuid()]
  const { username } = useUserPreferences()

  const usernameString = user?.globalUsername
    ? user.globalUsername
    : username
    ? username
    : "Unknown Player"

  return (
    <Link href={"/settings"} className={styles.userContainer}>
      <div className={styles.username}>{usernameString}</div>
      <div className={styles.avatar}>
        {usernameString ? usernameString.slice(0, 2) : "UP"}
      </div>
    </Link>
  )
}

export default Header
