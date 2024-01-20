"use client"

import { Game } from "@/app/game/Game"
import { SocketContext } from "@/app/SocketConnection"
import { useSearchParams } from "next/navigation"
import { useContext, useEffect } from "react"

export default function Home() {
  const { gameData } = useContext(SocketContext)
  const lobbyId = useSearchParams()?.get("lobbyId")

  useEffect(() => {
    if (typeof lobbyId === "string" && gameData) {
      const game = gameData[lobbyId]
      if (!game) {
        console.log(lobbyId, game, gameData)
        // router.push("/")
      }
    }
  }, [lobbyId, gameData[lobbyId as string]])

  return <Game />
}
