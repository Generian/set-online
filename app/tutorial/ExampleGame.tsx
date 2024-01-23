"use client"

import styles from "@/styles/Tutorial.module.css"
import { getAllCards, BaseCard } from "@/helpers/cardsInitialiser"
import useViewportDimensions from "@/helpers/useViewportDimensions"
import { useEffect, useState } from "react"
import { Card } from "../game/Card"
import { Button } from "@mui/material"

export const ExampleGame = ({}: {}) => {
  const [selectedCards, setSelectedCards] = useState<number[]>([])
  const [solution, setSolution] = useState<"SOLVED" | "ERROR" | undefined>()
  const [showOtherSetMessage, setShowOtherSetMessage] = useState<
    "FIRST_SET" | "OTHER_SET" | false
  >(false)
  const [solvedSets, setSolvedSets] = useState<number[]>([])
  const { isMobile } = useViewportDimensions()
  const cardHeight = isMobile ? 100 : 125

  const allCards = getAllCards()
  // console.log(allCards)

  const sets = [
    [1, 12, 20],
    [202, 111, 20],
  ]

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
      let setValidations: boolean[] = []

      for (let index = 0; index < sets.length; index++) {
        const set = sets[index]
        let isSet = true
        selectedCards.forEach((c) => {
          if (!set.find((s) => s == c)) {
            isSet = false
          }
        })
        setValidations = [...setValidations, isSet]
      }

      const isSet = setValidations.find((s) => s)

      if (isSet) {
        setSolution("SOLVED")
        if (solvedSets.length > 1) {
          // Check if user selected already solved set
          let resubmittedSameSet = true

          selectedCards.forEach((c) => {
            if (!solvedSets.find((s) => s == c)) {
              resubmittedSameSet = false
            }
          })

          if (resubmittedSameSet) {
            setShowOtherSetMessage("OTHER_SET")
            setSolution("SOLVED")
            setTimeout(() => {
              setSelectedCards([])
              setSolution(undefined)
            }, 3000)
          } else {
            setShowOtherSetMessage(false)
          }
        } else {
          setShowOtherSetMessage("FIRST_SET")
          setSolvedSets(selectedCards)
          setSolution("SOLVED")
          setTimeout(() => {
            setSelectedCards([])
            setSolution(undefined)
          }, 3000)
        }
      } else {
        setShowOtherSetMessage(false)
        setSolution("ERROR")
        setTimeout(() => {
          setSelectedCards([])
          setSolution(undefined)
        }, 3000)
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
                    solution && !!selectedCards.find((s) => s == c)
                      ? solution == "SOLVED"
                        ? styles.solved
                        : styles.error
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
                      customOnClick: () =>
                        solution ? () => {} : handleSelectCard(c),
                      customSelected: !!selectedCards.find((card) => card == c),
                    }}
                  />
                </div>
              )
            })}
          </div>
        ))}
      </div>
      <div className={styles.gameMessageContainer}>
        {solution == "ERROR" && (
          <>
            <p>
              <b className={styles.wrong}>Incorrect!</b> Please try again.
            </p>
          </>
        )}
        {showOtherSetMessage == "FIRST_SET" && (
          <>
            <p>
              <b className={styles.correct}>Correct!</b> But there is yet
              another Set in the deck. <b>Can you spot that one as well?</b>
            </p>
          </>
        )}
        {showOtherSetMessage == "OTHER_SET" && (
          <>
            <p>
              You've already found that set before.{" "}
              <b>Can you spot another one?</b>
            </p>
          </>
        )}
        {solution == "SOLVED" && showOtherSetMessage != "FIRST_SET" && (
          <>
            <p>
              <b className={styles.correct}>Fantastic!</b> Now you're all set
              (pun intended) to play your first game.
            </p>
            <Button href="/" variant="contained" color="success">
              Play!
            </Button>
          </>
        )}
      </div>
    </>
  )
}
