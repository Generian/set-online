"use client"

import styles from "@/styles/StartGameButton.module.css"
import { SocketContext } from "@/app/SocketConnection"
import { useRouter } from "next/navigation"
import { useContext } from "react"
import { GameType } from "@/helpers/gameHandling"

interface StartGameButtonProps {
  gameType: GameType
  size?: "small" | null
  label?: string
}

export const StartGameButton = ({
  gameType,
  size,
  label,
}: StartGameButtonProps) => {
  let { submitAction, userData } = useContext(SocketContext)

  const isOnline = Object.values(userData).length

  const router = useRouter()

  const navigateToGamePage = (obj: any) => {
    router.push(`/game?lobbyId=${obj.lobbyId}`, undefined)
  }

  const handleClick = () => {
    submitAction(
      {
        type: "INITIALISE_GAME",
        gameType,
      },
      navigateToGamePage
    )
  }

  const disabled = !isOnline || gameType == "MULTIPLAYER"

  return (
    <div
      className={`${styles.container} ${
        size == "small" ? styles.smallContainer : ""
      } ${disabled ? styles.disabled : ""}`}
      onClick={() => {
        !disabled && handleClick()
      }}
    >
      <h2>
        {label
          ? label
          : gameType == "TIME_ATTACK"
          ? "Time attack!"
          : "Multiplayer"}
      </h2>
    </div>
  )
}

export const TutorialButton = () => {
  const router = useRouter()

  return (
    <div
      className={styles.container}
      onClick={() => {
        router.push("/tutorial")
      }}
    >
      <h2>{"Tutorial"}</h2>
    </div>
  )
}
