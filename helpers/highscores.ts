import { formatTime, getTotalTimeAndPenalties } from "@/app/game/Timer"
import { Game, TimeAttackGame } from "./gameHandling"
import { saveHighscoreToDatabase } from "@/app/actions/databaseActions"
import { informSlackAboutNewTimeattackHighscore } from "./slackHelper"
import { User } from "./userHandling"
import { Highscore } from "@/app/game/Highscores"

export const saveHighscore = (
  highscores: Highscore[],
  gameData: Game,
  publicUuid: string,
  lobbyId: string,
  user: User | undefined
) => {
  if (gameData.gameType == "TIME_ATTACK") {
    const { totalTime, penalties } = getTotalTimeAndPenalties(
      gameData as TimeAttackGame,
      publicUuid
    )

    const newHighscore = {
      publicUuid,
      lobbyId: lobbyId as string,
      totalTime,
      penalties,
    }

    // Add new highscore to session context
    if (Math.max(...highscores.map((h) => h.totalTime)) > totalTime) {
      highscores.push(newHighscore)
      highscores.sort((a, b) => a.totalTime - b.totalTime)
    }

    // Save highscore to database
    saveHighscoreToDatabase(newHighscore)

    // Inform slack about new highscore
    const {
      gameOver,
      timeAttackAttributes: { startTime, userPenalties },
    } = gameData as TimeAttackGame
    informSlackAboutNewTimeattackHighscore(
      user?.globalUsername ? user?.globalUsername : "unknown",
      lobbyId,
      formatTime(gameOver - startTime),
      userPenalties[publicUuid]
    )
  } else if (gameData.gameType == "MULTIPLAYER") {
    // TODO handle multiplayer highscore submission
  }
}
