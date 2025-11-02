import { GameType } from "./types"
import { resolveUrlFromEnv } from "./utils"

const sendSlackMessage = async (message: string) => {
  const SLACK_API_KEY: string = process.env.SLACK_API_KEY as string
  if (!SLACK_API_KEY) {
    console.error("Slack API key not provided. Can't send update messages.")
    return
  }

  const requestOptions = {
    method: "POST",
    headers: {
      authorization: `Bearer ${SLACK_API_KEY}`,
      "content-Type": "application/json",
    },
    body: JSON.stringify({
      channel: "C06CRK26LCS",
      blocks: message,
    }),
    redirect: "follow",
  } as RequestInit

  fetch("https://slack.com/api/chat.postMessage", requestOptions)
    .then((response) => response.text())
    .then((result) => JSON.parse(result))
    .then((res) => {
      if (res.ok !== true) {
        console.error(res)
      }
    })
    .catch((error) => console.log("error", error))
}

export const informSlackAboutNewGameStarted = (
  player: string | undefined,
  lobbyId: string,
  gameType: GameType
) => {
  const gameTypeText = gameType == "TIME_ATTACK" ? "time attack" : "multiplayer"
  const message = [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `New ${gameTypeText} game started by ${player || "unknown"}.`,
      },
      accessory: {
        type: "button",
        text: {
          type: "plain_text",
          text: "Watch game",
        },
        url: `${resolveUrlFromEnv()}game?lobbyId=${lobbyId}`,
      },
    },
  ]

  sendSlackMessage(JSON.stringify(message))
}

export const informSlackAboutNewTimeattackHighscore = (
  player: string,
  lobbyId: string,
  time: string,
  penalties: number
) => {
  const message = [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `New highscore by ${player}: ${time} with ${penalties} penalties`,
      },
      accessory: {
        type: "button",
        text: {
          type: "plain_text",
          text: "Open Game",
        },
        url: `${resolveUrlFromEnv()}game?lobbyId=${lobbyId}`,
      },
    },
  ]

  sendSlackMessage(JSON.stringify(message))
}
