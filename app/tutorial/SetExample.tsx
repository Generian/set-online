"use client"

import styles from "@/styles/Tutorial.module.css"
import { getAllCards, BaseCard } from "@/helpers/cardsInitialiser"
import useViewportDimensions from "@/helpers/useViewportDimensions"
import { Button } from "@mui/material"
import { ReactNode, useState } from "react"
import { Card } from "../game/Card"

export const SetExample = ({
  initialText,
  initialCards,
  selectableCards,
  nextExample,
}: {
  initialText?: ReactNode
  initialCards: number[]
  selectableCards: {
    [id: number]: {
      correct: boolean
      message: string[]
    }
  }
  nextExample: () => void
}) => {
  const [selectedCard, setSelectedCard] = useState<number>()
  const [isComplete, setIsComplete] = useState(false)
  const { isMobile } = useViewportDimensions()

  const allCards = getAllCards()

  const solved = selectedCard && selectableCards[selectedCard].correct

  const cardHeight = isMobile ? 100 : 100
  return (
    <div
      className={`${styles.exampleContainer} ${
        isComplete ? styles.completed : ""
      }`}
    >
      {initialText}

      <div
        className={styles.setExample__cardContainer}
        style={{
          height:
            !isMobile || selectedCard ? cardHeight + 10 : 2 * cardHeight + 20,
        }}
      >
        {initialCards.map((c, i) => {
          const cardProps = allCards.find((all) => all.id == c) as BaseCard
          return (
            <Card
              key={c}
              {...{
                rank: 1,
                column: 0,
                row: 0,
                hidden: false,
                ...cardProps,
                customPosition: {
                  left: i * 80,
                  top: 0,
                  height: cardHeight,
                },
              }}
            />
          )
        })}
        <div
          className={`${styles.setExample__cardPlaceholder} ${
            selectedCard ? (solved ? styles.solved : styles.error) : ""
          }`}
          style={{ height: cardHeight }}
        >
          <span>?</span>
        </div>
        {Object.keys(selectableCards).map((c, i) => {
          const cardProps = allCards.find(
            (all) => all.id == Number(c)
          ) as BaseCard

          const isSelected = selectedCard == Number(c)
          return (
            <div
              key={c}
              style={{
                opacity: selectedCard && selectedCard != Number(c) ? "0" : "1",
              }}
            >
              <Card
                {...{
                  rank: 1,
                  column: 0,
                  row: 0,
                  hidden: false,
                  ...cardProps,
                  customPosition: {
                    left: isSelected
                      ? 160 + 8
                      : isMobile
                      ? i * 80
                      : i * 80 + 280,
                    top: isSelected || !isMobile ? 0 : 150,
                    height: selectedCard
                      ? isSelected
                        ? cardHeight
                        : 0
                      : cardHeight,
                  },
                  customOnClick: () => setSelectedCard(Number(c)),
                  customSelected: selectedCard == Number(c),
                }}
              />
            </div>
          )
        })}
        {!selectedCard && (
          <span className={styles.setExample__pickCardInstruction}>
            Select one of the cards below
          </span>
        )}
      </div>

      {selectedCard && (
        <div
          className={`${styles.answerContainer} ${
            selectableCards[selectedCard].correct
              ? styles.correctAnswer
              : styles.wrongAnswer
          }`}
        >
          <h3>
            {selectableCards[selectedCard].correct ? "Correct!" : "Wrong!"}
          </h3>
          {selectableCards[selectedCard].message.map((m, i) => (
            <p key={`message_${i}`}>{m}</p>
          ))}
          {selectableCards[selectedCard].correct && (
            <Button
              variant="contained"
              color="success"
              onClick={() => {
                setIsComplete(true)
                nextExample()
              }}
            >
              Next
            </Button>
          )}
          {!selectableCards[selectedCard].correct && (
            <Button
              variant="contained"
              color="error"
              onClick={() => setSelectedCard(undefined)}
            >
              Try again
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
