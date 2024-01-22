"use client"

import styles from "@/styles/Tutorial.module.css"
import { getAllCards, BaseCard } from "@/helpers/cardsInitialiser"
import useViewportDimensions from "@/helpers/useViewportDimensions"
import { Button } from "@mui/material"
import { useState } from "react"
import { Card } from "../game/Card"

export const SetExample = ({
  initialCards,
  selectableCards,
  nextExample,
}: {
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
  const { isMobile } = useViewportDimensions()

  const allCards = getAllCards()

  const solved = selectedCard && selectableCards[selectedCard].correct

  const cardHeight = isMobile ? 100 : 125
  return (
    <>
      <div className={styles.setExampleContainer}>
        <div className={styles.cardContainer} style={{ height: cardHeight }}>
          {initialCards.map((c) => {
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
                    height: cardHeight,
                  },
                }}
              />
            )
          })}
        </div>
        <div
          className={`${styles.cardPlaceholder} ${
            selectedCard ? (solved ? styles.solved : styles.error) : ""
          }`}
          style={{ height: cardHeight }}
        >
          <span>?</span>
        </div>
        <div
          className={`${styles.cardSelectionContainer} ${
            selectedCard ? styles.cardIsSelected : ""
          }`}
        >
          <span>{selectedCard ? "." : "Select one of the cards below"}</span>
          <div
            className={styles.cardContainer}
            style={{
              left: selectedCard
                ? `calc(-${(cardHeight * 8) / 11.5 + 8}px - 2rem)`
                : "",
            }}
          >
            {Object.keys(selectableCards).map((c) => {
              const cardProps = allCards.find(
                (all) => all.id == Number(c)
              ) as BaseCard
              return (
                <div
                  key={c}
                  style={{
                    opacity:
                      selectedCard && selectedCard != Number(c) ? "0" : "1",
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
                        height: selectedCard
                          ? selectedCard == Number(c)
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
          </div>
          <span style={{ color: "transparent" }}>.</span>
        </div>
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
            <Button variant="contained" color="success" onClick={nextExample}>
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
    </>
  )
}
