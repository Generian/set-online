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
import { findSetInCards } from "@/helpers/setValidator"
import { evaluateSelectedCardsForSet } from "@/helpers/evaluateSelectedCards"
import { SocketContext } from "../general/SocketConnection"
import { useRouter } from "next/router"
import Layout from "./Layout"
import Timer from "./Timer"
import { Game as GameProps } from "../../helpers/gameHandling"
import AddCardsButton from "./AddCardsButton"
import SetAnnouncer from "./SetAnnouncer"
import HighscoreList from "./Highscores"
import SetsCounter from "./SetsCounter"
import GameOverInfo from "./GameOverInfo"

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

  const { gameData, localGameData, submitAction } = useContext(SocketContext)

  const router = useRouter()
  const { lobbyId } = router.query

  // Handle new game data received from server and locally. Optimise for fast rendering based on local data before server-validated data
  useEffect(() => {
    if (typeof lobbyId === "string") {
      const game = gameData[lobbyId]
      const localGame = localGameData[lobbyId]
      if (game && localGame) {
        if (game.actions.length < localGame.actions.length) {
          console.log("Using local game state to render game.")
          setGame(localGame)
          setCards(localGame.cards)
          setMaxColumns(localGame.maxColumns)
        } else {
          console.log("Using server game state to render game.")
          setGame(game)
          setCards(game.cards)
          setMaxColumns(game.maxColumns)

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
      } else if (!game && !localGame) {
        console.log("No game data available to render game. Waiting for data.")
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
            {cards.map((c) => (
              <Card key={c.id} {...c} column={c.column} row={c.row} />
            ))}
            <AddCardsButton />
            {game && <SetAnnouncer game={game} />}
            {!!game?.gameOver && <GameOverInfo game={game} />}
          </Field>
        }
        infoContainer={
          <>
            {game && <Timer game={game} />} {<HighscoreList />}
          </>
        }
        setsContainer={<>{game && <SetsCounter game={game} />}</>}
      ></Layout>
    </GameContext.Provider>
  )
}
