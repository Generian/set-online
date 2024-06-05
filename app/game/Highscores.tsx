"use client"

import styles from "@/styles/Highscore.module.css"
import { useState, useEffect, useContext } from "react"
import { formatTime, getTotalTimeAndPenalties } from "./Timer"
import { GameContext } from "./Game"
import { getPublicUuid } from "@/helpers/uuidHandler"
import { Game, TimeAttackGame } from "@/helpers/gameHandling"
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft"
import { SocketContext } from "../SocketConnection"
import useViewportDimensions from "@/helpers/useViewportDimensions"
import KeyboardArrowUpRoundedIcon from "@mui/icons-material/KeyboardArrowUpRounded"
import { formatTimeDifference } from "@/helpers/utils"
import { retrieveListOfHighscoresFromDatabase } from "@/app/actions/databaseActions"
import { CircularProgress } from "@mui/material"

export interface Highscore {
  publicUuid: string
  lobbyId: string
  createdAt?: string
  totalTime: number
  penalties: number
}

export type FilterOption = "ALL_TIME" | "7D" | "24H"

export default function TimeAttackGameHighscoreComponent() {
  const [highscores, setHighscores] = useState<Highscore[]>([])
  const [time, setTime] = useState(0)
  const [highscoreIndexToHighlight, setHighscoreIndexToHighlight] = useState<
    number | undefined
  >()
  const [isExpanded, setIsExpanded] = useState<boolean>(false)

  const { game } = useContext(GameContext)
  const { isMobile } = useViewportDimensions()

  const fetchHighscores = async () => {
    const highscores = await retrieveListOfHighscoresFromDatabase()
    highscores && setHighscores(highscores)
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
    if (game?.gameType == "TIME_ATTACK") {
      clock = setInterval(() => {
        const newTime = new Date().getTime()
        setTime(newTime)
      }, 1000)
    }

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

  // if (!game || game?.gameType !== "TIME_ATTACK") return <></>

  if (highscores.length > 0) {
    if (!isMobile) {
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
              gameOver={!!game?.gameOver}
            />
          ))}
        </div>
      )
    } else {
      const handleMobileContainerToggle = () => {
        setIsExpanded((e) => !e)
      }
      return (
        <div className={styles.mobileContainer}>
          <div
            className={styles.mobileNextHighscoreContainer}
            onClick={handleMobileContainerToggle}
          >
            <div
              className={`${styles.arrow} ${
                isExpanded ? styles.closeArrow : ""
              }`}
            >
              <KeyboardArrowUpRoundedIcon />
            </div>
          </div>
          <div
            className={styles.mobileHighscoresContainer}
            style={{ maxHeight: isExpanded ? "2000px" : "0px" }}
          >
            {highscores.map((h, i) => (
              <Highscore
                key={`highscore_${h.lobbyId}`}
                rank={i + 1}
                highscore={h}
                highlight={i == highscoreIndexToHighlight}
                thisGame={h.lobbyId == game?.lobbyId}
                gameOver={!!game?.gameOver}
                showCreationTime={true}
              />
            ))}
          </div>
        </div>
      )
    }
  } else {
    return <></>
  }
}

export const TimeAttackGameHighscoreList = ({
  game,
  highscoreIndexToHighlight,
}: {
  game?: Game
  highscoreIndexToHighlight?: number
}) => {
  const [highscores, setHighscores] = useState<Highscore[] | null>(null)
  const [filter, setFilter] = useState<FilterOption>("7D")

  const fetchHighscores = async (filter?: FilterOption) => {
    const highscores = await retrieveListOfHighscoresFromDatabase(
      undefined,
      filter
    )
    highscores && setHighscores(highscores)
  }

  useEffect(() => {
    fetchHighscores(filter)
    let fetchTimer: NodeJS.Timer | undefined = undefined
    fetchTimer = setInterval(() => {
      fetchHighscores(filter)
    }, 30000)

    return () => {
      clearInterval(fetchTimer)
    }
  }, [filter])

  return (
    <div className={styles.highscoreListContainer}>
      <div className={styles.highscoreListHeader}>
        <span>Highscores</span>
      </div>
      <div className={styles.highscoreFilterContainer}>
        {["ALL_TIME", "7D", "24H"].map((f) => (
          <div
            key={f}
            className={`${styles.highscoreFilterItem} ${
              f == filter ? styles.filterSelected : ""
            }`}
            onClick={() => setFilter(f as FilterOption)}
          >
            <span>
              {
                {
                  ALL_TIME: "All time",
                  "7D": "Last 7 days",
                  "24H": "Last 24 hours",
                }[f]
              }
            </span>
          </div>
        ))}
      </div>
      {highscores &&
        highscores.map((h, i) => (
          <Highscore
            key={`highscore_${h.lobbyId}`}
            rank={i + 1}
            highscore={h}
            highlight={i == highscoreIndexToHighlight}
            thisGame={h.lobbyId == game?.lobbyId}
            gameOver={!!game?.gameOver}
            showCreationTime={true}
            inline={true}
          />
        ))}
      {highscores && !highscores.length && (
        <div className={styles.retryText}>
          <p>
            Unable to load highscores. <br />{" "}
            <a
              onClick={() => {
                setHighscores(null)
                fetchHighscores(filter)
              }}
            >
              Retry
            </a>
          </p>
        </div>
      )}
      {!highscores && (
        <div className={styles.loadingContainer}>
          <CircularProgress size={20} />
          <span>Loading highscores</span>
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
  gameOver,
  showCreationTime,
  inline,
}: {
  rank: number
  highscore: Highscore
  highlight: boolean
  thisGame: boolean
  gameOver: boolean
  showCreationTime?: boolean
  inline?: boolean
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
      <div
        className={`${styles.innerContainer} ${
          inline ? styles.innerContainer__row : ""
        }`}
      >
        <div className={styles.time}>{formatTime(totalTime)}</div>
        <div className={styles.extraInfo}>
          {"by "}
          <span className={styles.userName}>{`${username} `}</span>
          {highscore.createdAt && showCreationTime && (
            <span>{formatTimeDifference(highscore.createdAt)}</span>
          )}
        </div>
      </div>
      <div
        className={`${styles.penalties} ${
          !penalties ? styles.noPenalties : ""
        }`}
      >
        {penalties}
      </div>
      {highlight && !gameOver && (
        <div className={styles.highlight}>
          <KeyboardArrowLeftIcon />
        </div>
      )}
    </div>
  )
}
