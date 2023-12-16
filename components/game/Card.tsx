import styles from "@/styles/Card.module.css"
import { useContext, useEffect, useState } from "react"
import { GameContext } from "./Game"
import { Shape } from "./Shape"
import { BaseCard } from "@/helpers/cardsInitialiser"
import { getCoordinatesAndSize } from "@/helpers/positions"

export interface CardProps extends BaseCard {
  column: number | null
  row: number | null
  hidden: boolean
  rank: number
  set?: boolean
}

export type CardPropList = "type" | "count" | "color" | "shading"
export const cardProps: CardPropList[] = ["type", "count", "color", "shading"]

export const Card = ({
  id,
  rank,
  type,
  count,
  color,
  shading,
  column,
  row,
  hidden,
  set,
}: CardProps) => {
  const [selected, setSelected] = useState(false)
  const [error, setError] = useState(false)

  const { game, selectedCards, setSelectedCards, errorCards, maxColumns } =
    useContext(GameContext)

  useEffect(() => {
    if (game?.gameOver) {
      setSelected(false)
    } else {
      if (selectedCards.map((c) => c.id).includes(id)) {
        setSelected(true)
      } else {
        setSelected(false)
      }
    }
  }, [selectedCards, game?.gameOver])

  useEffect(() => {
    if (errorCards.map((c) => c.id).includes(id)) {
      setError(true)
    } else {
      setError(false)
    }
  }, [errorCards])

  // Handle selection
  const onClick = () => {
    if (selectedCards.map((c) => c.id).includes(id)) {
      setSelectedCards((cards) => cards.filter((c) => c.id != id))
    } else {
      setSelectedCards((cards) => [
        ...cards,
        {
          id,
          rank,
          type,
          count,
          color,
          shading,
          hidden,
          row,
          column,
        },
      ])
    }
  }

  // Create shapes
  const shapes = []

  for (let i = 0; i < count; i++) {
    shapes.push(
      <Shape
        key={`${id}_${type}_${color}_${shading}_${i}`}
        type={type}
        color={color}
        shading={shading}
      />
    )
  }

  // Get Coordinates
  const { left, top, height } = getCoordinatesAndSize(
    column,
    row,
    maxColumns,
    set
  )

  // if (hidden) {
  //   return (
  //     <div className={`${styles.container} ${styles.hidden}`}>
  //       <div className={styles.shapeContainer}>{shapes}</div>
  //     </div>
  //   )
  // }

  return (
    <div
      className={`${styles.container} ${
        hidden ? styles.container__horizontal : ""
      } ${set ? styles.set : ""}`}
      style={{
        left,
        top,
        height,
        zIndex: set ? rank + 100 : row ? rank : -rank,
      }}
      onClick={hidden || game?.gameOver ? () => {} : () => onClick()}
    >
      <div
        className={`${styles.card} ${selected ? styles.selected : ""} ${
          hidden ? styles.hidden : ""
        } ${error ? styles.errorShake : ""}`}
      >
        <div
          className={`${styles.card__face} ${styles.card__front} ${
            error ? styles.errorBackground : ""
          }`}
        >
          <div className={styles.shapeContainer}>{shapes}</div>
        </div>
        <div className={`${styles.card__face} ${styles.card__back}`}>
          <div className={styles.card__background}></div>
        </div>
      </div>
    </div>
  )
}
