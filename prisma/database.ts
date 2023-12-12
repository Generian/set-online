import { Highscore } from "@/components/game/Highscores"
import prisma from "./prisma"
import { Game, Games } from "@/helpers/gameHandling"
import { User, Users } from "@/helpers/userHandling"

// Games

export const saveGameToDatabase = async (game: Game) => {
  const save = await prisma.game.upsert({
    where: {
      lobbyId: game.lobbyId,
    },
    update: {
      updatedAt: new Date().toISOString(),
      gameData: JSON.stringify(game),
    },
    create: {
      lobbyId: game.lobbyId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      gameData: JSON.stringify(game),
    },
  })
}

export const retrieveSpecificGameFromDatabase = async (
  lobbyId: string
): Promise<Game | null> => {
  const game = await prisma.game.findUnique({
    where: {
      lobbyId: lobbyId,
    },
  })

  return game ? JSON.parse(game.gameData) : null
}

export const retrieveListOfGamesFromDatabase = async (): Promise<Games> => {
  const games_raw = await prisma.game.findMany({
    where: {
      environment: process.env.NODE_ENV,
    },
    orderBy: {
      createdAt: "desc",
    },
  })
  const games: Games = {}
  games_raw.map(
    (game: {
      id: number
      lobbyId: string
      createdAt: Date
      updatedAt: Date
      environment: string
      gameData: string
    }) => {
      games[game.lobbyId] = JSON.parse(game.gameData)
    }
  )

  return games
}

// Users

export const saveUserToDatabase = async (user: User, uuid: string) => {
  const save = await prisma.user.upsert({
    where: {
      uuid: uuid,
    },
    update: {
      updatedAt: new Date().toISOString(),
      userName: user.globalUsername ? user.globalUsername : "",
      language: "DE",
    },
    create: {
      uuid: uuid,
      publicUuid: user.publicUuid,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      userName: user.globalUsername ? user.globalUsername : "",
      language: "DE",
    },
  })
}

export const retrieveSpecificUserFromDatabase = async (
  publicUuid: string
): Promise<User | null> => {
  const user = await prisma.user.findUnique({
    where: {
      publicUuid: publicUuid,
    },
  })

  return user
    ? {
        sockets: [],
        publicUuid: user.publicUuid,
        globalUsername: user.userName,
        online: false,
      }
    : null
}

export const retrieveListOfUsersFromDatabase = async (): Promise<Users> => {
  const users_raw = await prisma.user.findMany({
    where: {
      environment: process.env.NODE_ENV,
    },
  })
  const users: Users = {}
  users_raw.map((user) => {
    users[user.uuid] = {
      sockets: [],
      publicUuid: user.publicUuid,
      globalUsername: user.userName,
      online: false,
    }
  })

  return users
}

// Highscores

export const saveHighscoreToDatabase = async (highscore: Highscore) => {
  console.log("Saved game to database:", highscore)

  const save = await prisma.highscore.create({
    data: {
      createdAt: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      highscoreType: "SET_TIMEATTACK",
      highscoreValue: highscore.totalTime,
      highscoreData: JSON.stringify(highscore),
      author: {
        connect: { publicUuid: highscore.publicUuid },
      },
      game: {
        connect: { lobbyId: highscore.lobbyId },
      },
    },
  })
}

export const retrieveListOfHighscoresFromDatabase = async (
  limit?: number
): Promise<Highscore[]> => {
  const highscores = await prisma.highscore.findMany({
    where: {
      environment: process.env.NODE_ENV,
    },
    take: limit ? limit : 10,
    orderBy: {
      highscoreValue: "asc",
    },
  })
  return highscores.map((h) => JSON.parse(h.highscoreData))
}
