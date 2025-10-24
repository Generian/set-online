"use client"

import styles from "@/styles/StartGameButton.module.css"
import { SocketContext } from "@/app/SocketConnection"
import { useRouter, usePathname } from "next/navigation"
import { useContext, useState, useEffect } from "react"
import { GameType } from "@/helpers/gameHandling"
import { CircularProgress } from "@mui/material"

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
  const [isLoading, setIsLoading] = useState(false)
  const [showsLoadingCircle, setShowsLoadingCircle] = useState(false)
  let { submitAction, userData } = useContext(SocketContext)

  const isOnline = Object.values(userData).length

  const router = useRouter()
  const pathname = usePathname()

  // Reset loading state when navigation completes
  useEffect(() => {
    if (isLoading && pathname && pathname.startsWith("/game")) {
      setIsLoading(false)
      setShowsLoadingCircle(false)
    }
  }, [pathname, isLoading])

  const navigateToGamePage = (obj: any) => {
    router.push(`/game?lobbyId=${obj.lobbyId}`, undefined)
    // Don't set isLoading to false here - let the useEffect handle it
  }

  const handleClick = () => {
    setIsLoading(true)
    setTimeout(() => {
      setShowsLoadingCircle(true)
    }, 500)
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
      } ${disabled ? styles.disabled : ""} ${isLoading ? styles.loading : ""}`}
      onClick={() => {
        !disabled && !isLoading && handleClick()
      }}
    >
      {showsLoadingCircle && <CircularProgress size={24} />}
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
