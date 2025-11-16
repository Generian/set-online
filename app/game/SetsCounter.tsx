"use client"

import styles from "@/styles/SetsCounter.module.css"
import { getPublicUuid } from "@/helpers/uuidHandler"
import { Game, MultiplayerGame, SetWon } from "@/helpers/types"
import { useContext, useEffect, useState } from "react"
import { SocketContext } from "../SocketConnection"
import useViewportDimensions from "@/helpers/useViewportDimensions"
import UserIcon from "../shared/UserIcon"
import { isPlayerInTimeout } from "@/helpers/gameHandling"

interface SetsCounterProps {
  game: Game
  gameOverMode?: boolean
}

const SetsCounter = ({ game, gameOverMode = false }: SetsCounterProps) => {
  const publicUuid = getPublicUuid()
  const { userData } = useContext(SocketContext)

  const { setsWon, players } = game

  const playerInGame = players.find((p) => p == publicUuid)

  let count

  if (players.find((p) => p == publicUuid)) {
    count = setsWon.filter((s) => s.publicUuid == publicUuid).length
  } else {
    count = setsWon.length
  }

  // Calculate set counts for each player
  const playerSetCounts = players
    .map((p) => ({
      publicUuid: p,
      count: setsWon.filter((s) => s.publicUuid == p).length,
    }))
    .sort((a, b) => b.count - a.count)

  // Find the maximum count
  const maxCount = Math.max(...playerSetCounts.map((p) => p.count), 0)

  // Find all players who have the maximum count (handles ties)
  const leadingPlayerPublicUuids = playerSetCounts
    .filter((p) => p.count === maxCount)
    .map((p) => p.publicUuid)

  const isLeadingPlayer = leadingPlayerPublicUuids.includes(publicUuid)

  return (
    <div
      className={`${styles.mainContainer} ${
        gameOverMode ? styles.gameOverMode : ""
      }`}
    >
      {(playerInGame || gameOverMode || game.gameType === "TIME_ATTACK") && (
        <div className={styles.container}>
          <span>
            {gameOverMode
              ? userData[playerSetCounts[0].publicUuid]?.globalUsername
                ? userData[playerSetCounts[0].publicUuid]?.globalUsername
                : "Unknown Player"
              : "Sets won:"}
          </span>
          <div
            className={`${styles.setsContainer} ${
              ((isLeadingPlayer && count > 0) || gameOverMode) &&
              game.gameType === "MULTIPLAYER"
                ? styles.leadingPlayerSetsContainer
                : ""
            }`}
          >
            {gameOverMode ? playerSetCounts[0].count : count}
          </div>
        </div>
      )}
      <div className={styles.otherPlayersContainerList}>
        {game.gameType === "MULTIPLAYER" &&
          (gameOverMode
            ? playerSetCounts.slice(1).map((p) => p.publicUuid)
            : players.filter((p) => p != publicUuid)
          ).map((p) => (
            <OtherPlayerSetsCounter
              key={p}
              gameOverMode={gameOverMode}
              publicUuid={p}
              setsWon={setsWon.filter((s) => s.publicUuid == p)}
              isLeadingPlayer={leadingPlayerPublicUuids.includes(p)}
              game={game}
            />
          ))}
      </div>
    </div>
  )
}

const OtherPlayerSetsCounter = ({
  publicUuid,
  setsWon,
  isLeadingPlayer,
  game,
  gameOverMode,
}: {
  publicUuid: string
  setsWon: SetWon[]
  isLeadingPlayer: boolean
  game: Game
  gameOverMode: boolean
}) => {
  const { userData } = useContext(SocketContext)
  const { isMobile } = useViewportDimensions()

  const [isBlocked, setIsBlocked] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      if (game.gameType == "MULTIPLAYER") {
        setIsBlocked(isPlayerInTimeout(game as MultiplayerGame, publicUuid))
      }
    }, 500)
    return () => clearInterval(interval)
  }, [game])

  const user = userData[publicUuid]

  return (
    <div
      className={`${styles.otherPlayerContainer} ${
        isMobile && !gameOverMode ? styles.otherPlayerContainerMobile : ""
      } ${isBlocked && !gameOverMode ? styles.timeOutMode : ""}`}
    >
      {(!isMobile || gameOverMode) && (
        <span>{user?.globalUsername || "Unknown Player"}</span>
      )}
      {isMobile && !gameOverMode && (
        <UserIcon
          publicUuid={publicUuid}
          size="small"
          variant="avatar"
          isBlocked={isBlocked}
        />
      )}
      <div
        className={`${styles.otherPlayerSetsContainer} ${
          isMobile && !gameOverMode ? styles.otherPlayerSetsContainerMobile : ""
        } ${
          isLeadingPlayer && setsWon.length > 0
            ? styles.leadingPlayerSetsContainer
            : ""
        }`}
      >
        {setsWon.length}
      </div>
    </div>
  )
}

export default SetsCounter
