import styles from "@/styles/Card.module.css"
import { useContext, useEffect, useState } from "react"
import { GameContext } from "./Game"
import {
  BoxVariant,
  CustomColors,
  OvalVariant,
  Shape,
  ShapeVariants,
} from "./Shape"
import { BaseCard } from "@/helpers/cardsInitialiser"
import { getCoordinatesAndSize } from "@/helpers/positions"
import useViewportDimensions from "@/helpers/useViewportDimensions"

export interface CardProps extends BaseCard {
  column: number | null
  row: number | null
  hidden: boolean
  rank: number
  set?: boolean
  customPosition?: {
    left: number
    top: number
    height: number
  }
  shapeVariants?: ShapeVariants
  customColors?: CustomColors
  customSelected?: boolean
  customOnClick?: () => void
}

export type CardPropList = "shape" | "count" | "color" | "shading"
export const cardProps: CardPropList[] = ["shape", "count", "color", "shading"]

export const Card = ({
  id,
  rank,
  shape,
  count,
  color,
  shading,
  column,
  row,
  hidden,
  set,
  customPosition,
  shapeVariants,
  customColors,
  customSelected,
  customOnClick,
}: CardProps) => {
  const [selected, setSelected] = useState(false)
  const [error, setError] = useState(false)

  const viewportDimensions = useViewportDimensions()

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
          shape,
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
    const shapeVariant = shapeVariants ? shapeVariants[shape] : undefined
    shapes.push(
      <Shape
        key={`${id}_${shape}_${color}_${shading}_${i}`}
        shape={shape}
        color={color}
        shading={shading}
        shapeVariant={shapeVariant}
        customColors={customColors}
      />
    )
  }

  // Get Coordinates
  let { left, top, height } = customPosition
    ? customPosition
    : getCoordinatesAndSize(viewportDimensions, column, row, maxColumns, set)

  return (
    <div
      className={`${styles.container} ${
        hidden ? styles.container__horizontal : ""
      } ${set ? styles.set : ""}`}
      style={{
        left,
        top,
        height,
        zIndex: set ? rank + 100 : row ? rank : -rank + 100,
      }}
      onClick={
        hidden || game?.gameOver
          ? () => {}
          : customOnClick
          ? customOnClick
          : () => onClick()
      }
    >
      <div
        className={`${styles.card} ${
          selected || customSelected ? styles.selected : ""
        } ${hidden ? styles.hidden : ""} ${error ? styles.errorShake : ""}`}
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
