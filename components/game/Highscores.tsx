import styles from "@/styles/Highscore.module.css"
import { useState, useEffect, useContext } from "react"
import { formatTime, getTotalTimeAndPenalties } from "./Timer"
import { GameContext } from "./Game"
import { getPublicUuid } from "@/helpers/uuidHandler"
import { TimeAttackGame } from "@/helpers/gameHandling"
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft"
import { SocketContext } from "../general/SocketConnection"

export interface Highscore {
  publicUuid: string
  lobbyId: string
  createdAt?: string
  totalTime: number
  penalties: number
}

export default function HighscoreList() {
  const [highscores, setHighscores] = useState<Highscore[]>([])
  const [time, setTime] = useState(0)
  const [highscoreIndexToHighlight, setHighscoreIndexToHighlight] = useState<
    number | undefined
  >()

  const { game } = useContext(GameContext)

  const fetchHighscores = () => {
    fetch("/api/highscores")
      .then((res) => res.json())
      .then((data) => {
        const { highscores } = data
        setHighscores(highscores)
      })
  }

  // Fetch highscore triggers
  useEffect(() => {
    fetchHighscores()
  }, [game?.gameOver])

  useEffect(() => {
    let fetchTimer: NodeJS.Timer | undefined = undefined
    fetchTimer = setInterval(() => {
      fetchHighscores()
    }, 30000)

    return () => {
      clearInterval(fetchTimer)
    }
  }, [])

  // Set indicator
  useEffect(() => {
    let clock: NodeJS.Timer | undefined = undefined
    clock = setInterval(() => {
      const newTime = new Date().getTime()
      setTime(newTime)
    }, 1000)

    return () => {
      clearInterval(clock)
    }
  }, [])

  useEffect(() => {
    if (game?.gameType == "TIME_ATTACK") {
      const { totalTime } = getTotalTimeAndPenalties(
        game as TimeAttackGame,
        getPublicUuid()
      )

      let newHighscoreIndexToHighlight = undefined

      for (let index = highscores.length - 1; index >= 0; index--) {
        const h = highscores[index]
        if (h.totalTime > totalTime) {
          newHighscoreIndexToHighlight = index
        }
      }

      setHighscoreIndexToHighlight(newHighscoreIndexToHighlight)
    }
  }, [game, time])

  if (!game || game?.gameType !== "TIME_ATTACK") return <></>

  return (
    <div className={styles.container}>
      <div className={styles.title}>
        <span>Highscores</span>
      </div>
      {highscores.map((h, i) => (
        <Highscore
          key={`highscore_${h.lobbyId}`}
          rank={i + 1}
          highscore={h}
          highlight={i == highscoreIndexToHighlight}
          thisGame={h.lobbyId == game?.lobbyId}
        />
      ))}
      {!highscores.length && (
        <div className={styles.retryText}>
          <p>
            Unable to load highscores. <br />{" "}
            <a onClick={fetchHighscores}>Retry</a>
          </p>
        </div>
      )}
    </div>
  )
}

const Highscore = ({
  rank,
  highscore,
  highlight,
  thisGame,
}: {
  rank: number
  highscore: Highscore
  highlight: boolean
  thisGame: boolean
}) => {
  const { userData } = useContext(SocketContext)
  const { totalTime, penalties, publicUuid } = highscore

  const username = userData[publicUuid]?.globalUsername
    ? userData[publicUuid].globalUsername
    : "Unknown Player"

  return (
    <div
      className={`${styles.highscoreContainer} ${
        highlight ? styles.highlightBorder : ""
      } ${thisGame ? styles.thisGame : ""}`}
    >
      <div className={styles.rank}>{`${rank}.`}</div>
      <div className={styles.innerContainer}>
        <div className={styles.time}>{formatTime(totalTime)}</div>
        <div className={styles.extraInfo}>{username}</div>
      </div>
      <div
        className={`${styles.penalties} ${
          !penalties ? styles.noPenalties : ""
        }`}
      >
        {penalties}
      </div>
      {highlight && !thisGame && (
        <div className={styles.highlight}>
          <KeyboardArrowLeftIcon />
        </div>
      )}
    </div>
  )
}
