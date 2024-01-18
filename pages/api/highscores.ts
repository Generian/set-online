import { Highscore } from "@/app/game/Highscores"
import { retrieveListOfHighscoresFromDatabase } from "@/prisma/database"
import type { NextApiRequest, NextApiResponse } from "next"

type Data = {
  highscores: Highscore[]
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const {
    query: { limit },
  } = req

  const highscores = await retrieveListOfHighscoresFromDatabase()

  res.status(200).json({ highscores })
}
