import { Game, TimeAttackGame } from "@/helpers/gameHandling"
import { getPublicUuid } from "@/helpers/uuidHandler"
import styles from "@/styles/Timer.module.css"
import { useEffect, useRef, useState } from "react"
import Progressbar from "./Progressbar"

// Types
interface TimerProps {
  game: Game
}

// Time-attack component
const TimeAttackTimer = ({ game }: TimerProps) => {
  const [time, setTime] = useState(0)
  const [penaltyTimers, setPenaltyTimers] = useState<number[]>([])

  const isFirstRender = useRef(true)

  const publicUuid = getPublicUuid()

  const {
    gameOver,
    timeAttackAttributes: {
      startTime,
      userPenalties: {
        [game.players[0] ? game.players[0] : publicUuid]: penalties,
      },
    },
  } = game as TimeAttackGame

  useEffect(() => {
    let clock: NodeJS.Timer | undefined = undefined
    clock = setInterval(() => {
      const newTime = new Date().getTime() - startTime
      setTime(newTime)
    }, 1000)

    let penaltyClock: NodeJS.Timer | undefined = undefined
    penaltyClock = setInterval(() => {
      setPenaltyTimers((timers) => {
        let newTimers: number[] = []
        for (let index = 0; index < timers.length; index++) {
          const t = timers[index]
          newTimers.push(t > 1 ? t - 1 : 0)
        }
        return newTimers
      })
    }, 30)

    if (gameOver) {
      clearInterval(clock)
      clearInterval(penaltyClock)
    }

    return () => {
      clearInterval(clock)
      clearInterval(penaltyClock)
    }
  }, [game?.gameOver])

  useEffect(() => {
    if (!isFirstRender.current) {
      penalties && setPenaltyTimers((timers) => [...timers, 60])
    } else {
      isFirstRender.current = false
    }
  }, [penalties])

  let totalTime = game?.gameOver ? game?.gameOver - startTime : time // TODO use getTotalTime function from below

  const timeTooHigh = totalTime >= 36000000

  if (!!penalties) {
    totalTime = totalTime + penalties * 1000 * 60
  }

  if (penaltyTimers.filter((t) => t > 0).length > 0) {
    penaltyTimers.forEach((t) => {
      totalTime -= t * 1000
    })
  }

  return (
    <div className={styles.container}>
      <div className={styles.innerContainer}>
        <div className={styles.timeContainer}>
          <span className={styles.timeStatic}>{formatTime(totalTime)}</span>
          <span
            className={`${styles.time} ${
              penaltyTimers.filter((t) => t > 0).length > 0
                ? styles.pulsate
                : ""
            }`}
          >
            {formatTime(totalTime)}
          </span>
          <div className={styles.penaltyContainer}>
            {!timeTooHigh &&
              penaltyTimers
                .filter((t) => t > 0)
                .map((t, i) => (
                  <span
                    key={`timer_${i}`}
                    className={styles.penalty}
                    style={{
                      transform: `translateY(${t / 2}px)`,
                      opacity: t / 60.0,
                    }}
                  >
                    {`+${t > 9 ? "" : 0}${t}`}
                  </span>
                ))}
          </div>
        </div>
        <div
          className={`${styles.penaltiesCountContainer} ${
            !penalties ? styles.noPenalties : ""
          }`}
        >
          <span
            className={`${styles.penaltiesCount} ${
              penalties > 9 ? styles.highPenalties : ""
            }`}
          >
            {penalties ? penalties : 0}
          </span>
        </div>
      </div>
      <Progressbar />
    </div>
  )
}

// Multiplayer component
const MultiplayerTimer = ({ game }: TimerProps) => {
  const [time, setTime] = useState(0)

  return (
    <div className={styles.container}>
      <span className={styles.time}>{formatTime(time)}</span>
    </div>
  )
}

// Final universal component
const Timer = ({ game }: TimerProps) => {
  if (game.gameType == "TIME_ATTACK") {
    return <TimeAttackTimer game={game} />
  } else if (game.gameType == "MULTIPLAYER") {
    return <MultiplayerTimer game={game} />
  } else {
    return null
  }
}

export default Timer

// Helper functions
const formatToTwoDigits = (number: number) => {
  // Convert the number to a string
  let numStr = number.toString()

  // If the number is less than 10, prepend '0' to it
  if (number < 10) {
    numStr = "0" + numStr
  }

  return numStr
}

export const formatTime = (c: number) => {
  if (c < 36000000) {
    const hours = Math.floor(c / (1000.0 * 60 * 60))
    const minutes = Math.floor((c - hours * 1000.0 * 60 * 60) / (1000.0 * 60))
    const seconds = Math.floor(
      (c - minutes * 1000 * 60 - hours * 1000.0 * 60 * 60) / 1000.0
    )
    return `${hours ? hours + ":" : ""}${formatToTwoDigits(
      minutes
    )}:${formatToTwoDigits(seconds)}`
  } else {
    return "∞"
  }
}

export const getTotalTimeAndPenalties = (
  game: TimeAttackGame,
  publicUuid: string
) => {
  const {
    timeAttackAttributes: {
      startTime,
      userPenalties: { [publicUuid]: penalties },
    },
  } = game
  let time = new Date().getTime() - startTime

  if (!!penalties) {
    time = time + penalties * 1000 * 60
  }
  return { totalTime: time, penalties: penalties ? penalties : 0 }
}
