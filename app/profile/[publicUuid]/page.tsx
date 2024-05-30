"use client"

import { retrieveSpecificUserFromDatabase } from "@/app/actions/databaseActions"
import { Highscore } from "@/app/game/Highscores"
import { formatTime } from "@/app/game/Timer"
import { User } from "@/helpers/userHandling"
import { useEffect, useState } from "react"

export default function Page({ params }: { params: { publicUuid: string } }) {
  const [userData, setUserData] = useState<User>()
  const [highscores, setHighscores] = useState<Highscore[]>([])

  const fetchUserData = async (publicUuid: string) => {
    const data = await retrieveSpecificUserFromDatabase(publicUuid)
    if (!data) return
    const { highscores } = data
    data && setUserData(data)
    highscores && setHighscores(highscores)
    console.log("user:", userData, highscores)
  }

  useEffect(() => {
    fetchUserData(params.publicUuid)
  }, [])

  return (
    <div>
      <h1>{userData?.globalUsername}</h1>
      <h2>Time Attack</h2>
      <span>Highscore:</span>
      {highscores.length && <span>{formatTime(highscores[0].totalTime)}</span>}
    </div>
  )
}
