"use client"

import styles from "@/styles/ActiveUserCount.module.css"
import { useContext } from "react"
import { SocketContext } from "../SocketConnection"

export default function ActiveUserCount() {
  const { userData } = useContext(SocketContext)

  const activeUsers = Object.values(userData).filter((u) => u.online).length

  return (
    <div className={styles.container}>
      <div
        className={`${styles.dot} ${
          activeUsers ? styles.greenDot : styles.redDot
        }`}
      ></div>
      {!!activeUsers && (
        <span className={styles.text}>{`${activeUsers} active user${
          activeUsers > 1 ? "s" : ""
        }`}</span>
      )}
      {!activeUsers && <span className={styles.text}>Offline</span>}
    </div>
  )
}
