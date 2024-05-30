import {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react"
import { Card, CardProps } from "./Card"
import { Field } from "./Field"
import { evaluateSelectedCardsForSet } from "@/helpers/evaluateSelectedCards"
import { SocketContext } from "../SocketConnection"
import { useSearchParams } from "next/navigation"
import Layout from "./Layout"
import Timer from "./Timer"
import { Game as GameProps } from "../../helpers/gameHandling"
import AddCardsButton from "./AddCardsButton"
import SetAnnouncer from "./SetAnnouncer"
import TimeAttackGameHighscoreComponent from "./Highscores"
import SetsCounter from "./SetsCounter"
import GameOverInfo from "./GameOverInfo"
import ServerSyncIndicator from "./ServerSyncIndicator"
import { defaultColors, ShapeVariants } from "./Shape"
import { getCookie } from "@/helpers/cookies"
import { UserPreferences } from "../UserPreferences"

interface GameContextProps {
  game: GameProps | undefined
  selectedCards: CardProps[]
  setSelectedCards: Dispatch<SetStateAction<CardProps[]>>
  errorCards: CardProps[]
  setErrorCards: Dispatch<SetStateAction<CardProps[]>>
  maxColumns: number
}

export const GameContext = createContext<GameContextProps>({
  game: undefined,
  selectedCards: [],
  setSelectedCards: () => {},
  errorCards: [],
  setErrorCards: () => {},
  maxColumns: 4,
})

export const Game = () => {
  const [cards, setCards] = useState<CardProps[]>([])
  const [selectedCards, setSelectedCards] = useState<CardProps[]>([])
  const [errorCards, setErrorCards] = useState<CardProps[]>([])
  const [maxColumns, setMaxColumns] = useState(4)
  const [game, setGame] = useState<GameProps>()
  const [shapeVariants, setShapeVariants] = useState<ShapeVariants>()
  const [colors, setColors] = useState(defaultColors)
  const [waitingForServerSync, setWaitingForServerSync] =
    useState<boolean>(false)

  const { gameData, localGameData, submitAction } = useContext(SocketContext)

  const lobbyId = useSearchParams()?.get("lobbyId")

  // Load custom user preferences
  useEffect(() => {
    const userPreferencesRaw = getCookie("userPreferences")
    if (userPreferencesRaw) {
      const { shapeVariants, customColors } = JSON.parse(
        userPreferencesRaw
      ) as UserPreferences
      setShapeVariants(shapeVariants)
      setColors(customColors)
    }
  }, [])

  // Handle new game data received from server and locally. Optimise for fast rendering based on local data before server-validated data
  useEffect(() => {
    if (typeof lobbyId === "string") {
      const game = gameData[lobbyId]
      const localGame = localGameData[lobbyId]
      if (game && localGame) {
        if (game.actions.length < localGame.actions.length) {
          console.log(
            "Using local game state to render game. Server state index:",
            game.actions.length,
            "Local state index:",
            localGame.actions.length
          )
          setGame(localGame)
          setCards(localGame.cards)
          setMaxColumns(localGame.maxColumns)
          setWaitingForServerSync(true)
        } else {
          console.log("Using server game state to render game.")
          setGame(game)
          setCards(game.cards)
          setMaxColumns(game.maxColumns)
          setWaitingForServerSync(false)

          // Validation of local game state vs server game state
          const serverAheadOfLocal =
            game.actions.length > localGame.actions.length
          if (serverAheadOfLocal) {
            console.warn("Server game state ahead of local game state.")
          } else {
            // Server and local state are on the same action index
            const latestLocalActionType = localGame.actions.slice(-1)[0].type
            const latestServerActionType = game.actions.slice(-1)[0].type
            const latestActionNotEqual =
              latestLocalActionType !== latestServerActionType

            if (latestActionNotEqual) {
              console.error(
                "Latest game action differs between local and server state. Local:",
                latestLocalActionType,
                "Server:",
                latestServerActionType
              )
              const getCardIdSum = (cards: CardProps[]) => {
                return cards
                  .filter((c) => !c.hidden && !c.set)
                  .reduce((accumulator, card) => accumulator + card.id, 0)
              }
              const cardsNotEqual =
                getCardIdSum(game.cards) !== getCardIdSum(localGame.cards)

              if (cardsNotEqual) {
                console.error(
                  "Although on the same action index, the cards don't match between local and server state."
                )
              }
            }
          }
        }
      } else if (game && !localGame) {
        setGame(game)
        setCards(game.cards)
        setMaxColumns(game.maxColumns)
        setWaitingForServerSync(false)
      } else if (!game && !localGame) {
        console.log("No game data available to render game. Waiting for data.")
        lobbyId &&
          submitAction &&
          submitAction({
            type: "GET_GAME_DATA",
            lobbyId,
          })
      } else {
        console.error(
          "Case should not be possible. Server data for the game should always exist if local data exists."
        )
      }
    }
  }, [gameData, localGameData, lobbyId])

  // Evaluate Set if card gets selected
  useEffect(() => {
    evaluateSelectedCardsForSet(
      selectedCards,
      setSelectedCards,
      setErrorCards,
      submitAction
    )
  }, [selectedCards])

  return (
    <GameContext.Provider
      value={{
        game,
        selectedCards,
        setSelectedCards,
        errorCards,
        setErrorCards,
        maxColumns,
      }}
    >
      <Layout
        field={
          <Field>
            {!game?.gameOver &&
              cards.map((c) => (
                <Card
                  key={c.id}
                  {...c}
                  shapeVariants={shapeVariants}
                  column={c.column}
                  row={c.row}
                  customColors={colors}
                />
              ))}
            <AddCardsButton />
            {game && <SetAnnouncer game={game} />}
            {!!game?.gameOver && <GameOverInfo game={game} />}
            {<ServerSyncIndicator show={waitingForServerSync} />}
          </Field>
        }
        infoContainer={
          <>
            {game && <Timer game={game} />}{" "}
            {<TimeAttackGameHighscoreComponent />}
          </>
        }
        setsContainer={<>{game && <SetsCounter game={game} />}</>}
      ></Layout>
    </GameContext.Provider>
  )
}
