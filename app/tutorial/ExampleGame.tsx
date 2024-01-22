"use client"

import styles from "@/styles/Tutorial.module.css"
import { getAllCards, BaseCard } from "@/helpers/cardsInitialiser"
import useViewportDimensions from "@/helpers/useViewportDimensions"
import { useEffect, useState } from "react"
import { Card } from "../game/Card"

export const ExampleGame = ({}: {}) => {
  const [selectedCards, setSelectedCards] = useState<number[]>([])
  const [solution, setSolution] = useState<"SOLVED" | "ERROR" | undefined>()
  const [selectCard, setSelectCard] = useState<(c: number) => void>(
    (c: number) => {}
  )
  const { isMobile } = useViewportDimensions()
  const cardHeight = isMobile ? 100 : 125

  const allCards = getAllCards()
  // console.log(allCards)

  const set = [1, 12, 20]

  const handleSelectCard = (c: number) => {
    setSelectedCards((cards) => {
      if (cards.find((card) => card == c)) {
        return cards.filter((card) => card != c)
      } else {
        return [...cards, c]
      }
    })
  }

  useEffect(() => {
    if (selectedCards.length == 3) {
      // Check for set
      let isSet = true
      selectedCards.forEach((c) => {
        if (!set.find((s) => s == c)) {
          isSet = false
        }
      })
      if (isSet) {
        setSolution("SOLVED")
      } else {
        setSolution("ERROR")
        setTimeout(() => {
          setSelectedCards([])
        }, 2000)
      }
    }
  }, [selectedCards])

  return (
    <>
      <div className={styles.gameContainer}>
        {[
          [1, 202, 12],
          [111, 20, 2021],
        ].map((g, i) => (
          <div key={`container_${i}`} className={styles.gameContainerRow}>
            {g.map((c) => {
              const cardProps = allCards.find(
                (all) => all.id == Number(c)
              ) as BaseCard
              return (
                <div
                  key={c}
                  className={`${styles.cardHighlighter} ${
                    solution
                      ? solution == "SOLVED"
                        ? styles.correctSet
                        : styles.noSet
                      : ""
                  }`}
                >
                  <Card
                    {...{
                      rank: 1,
                      column: 0,
                      row: 0,
                      hidden: false,
                      ...cardProps,
                      customPosition: {
                        height: cardHeight,
                      },
                      customOnClick: () => handleSelectCard(c),
                      customSelected: !!selectedCards.find((card) => card == c),
                    }}
                  />
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </>
  )
}
