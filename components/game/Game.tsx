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

  const { gameData, submitAction } = useContext(SocketContext)

  const router = useRouter()
  const { lobbyId } = router.query

  // Handle new game data received from server
  useEffect(() => {
    console.log("gameData:", gameData)
    if (typeof lobbyId === "string") {
      const game = gameData[lobbyId]
      if (game) {
        setGame(game)
        setCards(game.cards)
        setMaxColumns(game.maxColumns)
        findSetInCards(game.cards)?.forEach((c, i) => {
          console.log("Set card", i, ":", c.color, c.type, c.count, c.shading)
        })
      }
    }
  }, [gameData, lobbyId])

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
