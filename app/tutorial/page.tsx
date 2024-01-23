"use client"

import styles from "@/styles/Tutorial.module.css"
import { Card } from "../game/Card"
import { Count, ShapeType, Shading, Color } from "../game/Shape"
import { SetExample } from "./SetExample"
import { useState } from "react"
import { ExampleGame } from "./ExampleGame"

export default function Tutorial() {
  const [exampleSet, setExampleSet] = useState(1)

  return (
    <div className={styles.container}>
      <div className={styles.contentContainer}>
        <h1>How to play</h1>

        <h2>Goal</h2>
        <p>
          The objective of the game is to find{" "}
          <span className={styles.highlightText}>sets of three cards</span>.
          Finding a set can leave you scratching your head at times.
        </p>

        <h2>The deck</h2>
        <p>
          The card deck consists out of{" "}
          <span className={styles.highlightText}>81 unique cards</span>. Each
          card differs from the others in at least one of the following{" "}
          <span className={styles.highlightText}>four features</span>:
        </p>
        <div className={styles.listContainer}>
          <ul className={styles.list}>
            <li>
              <b>Shape</b>
              <div className={styles.featureContainer}>
                <div className={styles.featureExampleContainer}>
                  <div className={styles.cardFeatureContainer}>
                    <Card
                      {...{
                        id: 1,
                        rank: 1,
                        count: 1 as Count,
                        shape: "box" as ShapeType,
                        color: "red" as Color,
                        shading: "striped" as Shading,
                        column: 0,
                        row: 0,
                        hidden: false,
                        customPosition: {
                          height: 100,
                        },
                      }}
                    />
                  </div>
                  <span>Box</span>
                </div>
                <div className={styles.featureExampleContainer}>
                  <div className={styles.cardFeatureContainer}>
                    <Card
                      {...{
                        id: 1,
                        rank: 1,
                        count: 1 as Count,
                        shape: "oval" as ShapeType,
                        color: "red" as Color,
                        shading: "striped" as Shading,
                        column: 0,
                        row: 0,
                        hidden: false,
                        customPosition: {
                          height: 100,
                        },
                      }}
                    />
                  </div>
                  <span>Oval</span>
                </div>
                <div className={styles.featureExampleContainer}>
                  <div className={styles.cardFeatureContainer}>
                    <Card
                      {...{
                        id: 1,
                        rank: 1,
                        count: 1 as Count,
                        shape: "squiggle" as ShapeType,
                        color: "red" as Color,
                        shading: "striped" as Shading,
                        column: 0,
                        row: 0,
                        hidden: false,
                        customPosition: {
                          height: 100,
                        },
                      }}
                    />
                  </div>
                  <span>Squiggle</span>
                </div>
              </div>
            </li>
            <li>
              <b>Color</b>
              <div className={styles.featureContainer}>
                <div className={styles.featureExampleContainer}>
                  <div className={styles.cardFeatureContainer}>
                    <Card
                      {...{
                        id: 1,
                        rank: 1,
                        count: 1 as Count,
                        shape: "box" as ShapeType,
                        color: "red" as Color,
                        shading: "striped" as Shading,
                        column: 0,
                        row: 0,
                        hidden: false,
                        customPosition: {
                          height: 100,
                        },
                      }}
                    />
                  </div>
                  <span>Red</span>
                </div>
                <div className={styles.featureExampleContainer}>
                  <div className={styles.cardFeatureContainer}>
                    <Card
                      {...{
                        id: 1,
                        rank: 1,
                        count: 1 as Count,
                        shape: "box" as ShapeType,
                        color: "green" as Color,
                        shading: "striped" as Shading,
                        column: 0,
                        row: 0,
                        hidden: false,
                        customPosition: {
                          height: 100,
                        },
                      }}
                    />
                  </div>
                  <span>Green</span>
                </div>
                <div className={styles.featureExampleContainer}>
                  <div className={styles.cardFeatureContainer}>
                    <Card
                      {...{
                        id: 1,
                        rank: 1,
                        count: 1 as Count,
                        shape: "box" as ShapeType,
                        color: "blue" as Color,
                        shading: "striped" as Shading,
                        column: 0,
                        row: 0,
                        hidden: false,
                        customPosition: {
                          height: 100,
                        },
                      }}
                    />
                  </div>
                  <span>Blue</span>
                </div>
              </div>
            </li>
          </ul>
          <ul className={styles.list}>
            <li>
              <b>Count</b>
              <div className={styles.featureContainer}>
                <div className={styles.featureExampleContainer}>
                  <div className={styles.cardFeatureContainer}>
                    <Card
                      {...{
                        id: 1,
                        rank: 1,
                        count: 1 as Count,
                        shape: "oval" as ShapeType,
                        color: "green" as Color,
                        shading: "striped" as Shading,
                        column: 0,
                        row: 0,
                        hidden: false,
                        customPosition: {
                          height: 100,
                        },
                      }}
                    />
                  </div>
                  <span>One</span>
                </div>
                <div className={styles.featureExampleContainer}>
                  <div className={styles.cardFeatureContainer}>
                    <Card
                      {...{
                        id: 1,
                        rank: 1,
                        count: 2 as Count,
                        shape: "oval" as ShapeType,
                        color: "green" as Color,
                        shading: "striped" as Shading,
                        column: 0,
                        row: 0,
                        hidden: false,
                        customPosition: {
                          height: 100,
                        },
                      }}
                    />
                  </div>
                  <span>Two</span>
                </div>
                <div className={styles.featureExampleContainer}>
                  <div className={styles.cardFeatureContainer}>
                    <Card
                      {...{
                        id: 1,
                        rank: 1,
                        count: 3 as Count,
                        shape: "oval" as ShapeType,
                        color: "green" as Color,
                        shading: "striped" as Shading,
                        column: 0,
                        row: 0,
                        hidden: false,
                        customPosition: {
                          height: 100,
                        },
                      }}
                    />
                  </div>
                  <span>Three</span>
                </div>
              </div>
            </li>
            <li>
              <b>Shading</b>
              <div className={styles.featureContainer}>
                <div className={styles.featureExampleContainer}>
                  <div className={styles.cardFeatureContainer}>
                    <Card
                      {...{
                        id: 1,
                        rank: 1,
                        count: 2 as Count,
                        shape: "squiggle" as ShapeType,
                        color: "blue" as Color,
                        shading: "open" as Shading,
                        column: 0,
                        row: 0,
                        hidden: false,
                        customPosition: {
                          height: 100,
                        },
                      }}
                    />
                  </div>
                  <span>Open</span>
                </div>
                <div className={styles.featureExampleContainer}>
                  <div className={styles.cardFeatureContainer}>
                    <Card
                      {...{
                        id: 1,
                        rank: 1,
                        count: 2 as Count,
                        shape: "squiggle" as ShapeType,
                        color: "blue" as Color,
                        shading: "striped" as Shading,
                        column: 0,
                        row: 0,
                        hidden: false,
                        customPosition: {
                          height: 100,
                        },
                      }}
                    />
                  </div>
                  <span>Dotted</span>
                </div>
                <div className={styles.featureExampleContainer}>
                  <div className={styles.cardFeatureContainer}>
                    <Card
                      {...{
                        id: 1,
                        rank: 1,
                        count: 2 as Count,
                        shape: "squiggle" as ShapeType,
                        color: "blue" as Color,
                        shading: "solid" as Shading,
                        column: 0,
                        row: 0,
                        hidden: false,
                        customPosition: {
                          height: 100,
                        },
                      }}
                    />
                  </div>
                  <span>Solid</span>
                </div>
              </div>
            </li>
          </ul>
        </div>
        <p>
          Each possible combination of those features exists{" "}
          <span className={styles.highlightText}>
            exactly once in the deck.
          </span>
        </p>

        <h2>How to find a set</h2>
        <p>
          The rules for a set dictate that across those three cards,{" "}
          <span className={styles.highlightText}>
            each of the features taken by themselves
          </span>{" "}
          either:
        </p>
        <ul className={styles.list}>
          <li>
            <span className={styles.highlightText}>1. All match</span>
            <br />
            e.g. all three cards are red
            <br />
            <p className={styles.listSeparator}>OR</p>
          </li>
          <li>
            <span className={styles.highlightText}>2. All differ</span>
            <br />
            e.g. one is red, one is green, and one is blue
          </li>
        </ul>
        <p>
          Vice versa, three cards don't form a set if for any of the features,
          two cards match, but not the third. (e.g. two are red and one is blue)
        </p>

        <h2>Examples</h2>

        <SetExample
          initialText={
            "OK, let's give it a try. Take a look at the two cards below. Which of the following cards would complete a set?"
          }
          initialCards={[2010, 2011]}
          selectableCards={{
            "2221": {
              correct: false,
              message: [
                `
            Given that the cards on the left are both showing dotted red boxes,
            the third card needs to do the same. (Rule #1).`,
                `            While the card you selected shows boxes, they are neither red nor
            dotted.`,
              ],
            },
            "2012": {
              correct: true,
              message: [
                `Given that the cards on the left are both showing dotted red boxes,
            the third card needs to do the same. (Rule #1).`,
                `But given that the first card contains only one box and the second
            card two boxes means that the third card must show three boxes.
            (Rule #2)`,
              ],
            },
            "1102": {
              correct: false,
              message: [
                `Given that the first card contains only one element and the second
            card two elements means that the third card must contain three
            elements. (Rule #2)`,
                `However, given that the cards on the left are both showing dotted
            red boxes, the third card needs to do the same. (Rule #1).`,
                `While you correctly selected a card with three elements on it, they
            don't comply with Rule #1 for the features: color, shape, and
            shading.`,
              ],
            },
          }}
          nextExample={() => setExampleSet((e) => e + 1)}
        />

        {exampleSet >= 2 && (
          <>
            <SetExample
              initialText={
                "OK, let's give it a try. Take a look at the two cards below. Which of the following cards would complete a set?"
              }
              initialCards={[100, 202]}
              selectableCards={{
                "1": {
                  correct: true,
                  message: [
                    `In this example two features match between the cards (shape and shading) while the features count and color differ.`,
                    `Usually, the more features differ between the cards, the harder it gets to intuitively spot a Set. Let's see if you got the hang of it with yet another example.`,
                  ],
                },
                "102": {
                  correct: false,
                  message: [
                    `You spotted correctly that due to Rule #1 the third card needs to depict solid ovals.`,
                    `However, both the color as well as the count features differ between the first two cards on the left. Hence, for both these features you should look for a third card that also differs in these features from the first two. (Rule #2)`,
                  ],
                },
                "1001": {
                  correct: false,
                  message: [
                    `You spotted correctly that due to Rule #1 the third card needs to depict solid shapes.`,
                    `Also, due to Rule #2, you correctly selected a card that differs in the features color and count from the first two.`,
                    `However, take a look at the shapes. Here, the first two cards match and both depict ovals. Hence, the third card also needs to match the shape feature.`,
                  ],
                },
              }}
              nextExample={() => setExampleSet((e) => e + 1)}
            />
          </>
        )}
        {exampleSet >= 3 && (
          <>
            <SetExample
              initialCards={[222, 1020]}
              selectableCards={{
                "1121": {
                  correct: false,
                  message: [
                    `Almost correct. You correctly spotted that the third card requires two blue open shapes.`,
                    `However, take a look at the shapes. Here, the first two cards differ. Hence, the third card isn't allowed to depict squiggles, given that only the second one, but not the first card shows squiggles.`,
                  ],
                },
                "2121": {
                  correct: true,
                  message: [
                    `In this example, only the feature shading matched between all cards. All other features differ, requiring the application of Rule #2.`,
                    `Great, you've got the hang of it! Now, let's continue to the last example and the hardest-to-spot type of set.`,
                  ],
                },
                "2122": {
                  correct: false,
                  message: [
                    `Almost correct. You correctly spotted that the third card requires open blue rectangles.`,
                    `However, take a look at the count. Here, the first two cards differ, with the first card showing three shapes, while the second only contains a single shape. Hence, the third card isn't allowed to depict either one or three shapes, but needs to differ from the first two.`,
                  ],
                },
              }}
              nextExample={() => setExampleSet((e) => e + 1)}
            />
          </>
        )}
        {exampleSet >= 4 && (
          <>
            <SetExample
              initialCards={[1111, 2022]}
              selectableCards={{
                "100": {
                  correct: false,
                  message: [
                    `Take a look at the colors. Which of the rules did you break with your selection?`,
                  ],
                },
                "200": {
                  correct: true,
                  message: [
                    `Great, you also managed to master the royal discipline of finding sets. In this example, only Rule #2 applies as every feature of the cards differs.`,
                  ],
                },
                "210": {
                  correct: false,
                  message: [
                    `Take a look at the shading. Which of the rules did you break with your selection?`,
                  ],
                },
              }}
              nextExample={() => setExampleSet((e) => e + 1)}
            />
          </>
        )}

        {exampleSet >= 5 && (
          <>
            <p>
              OK, now you're ready. Let's take off the training wheels. Take a
              look at the cards below and try to find a set. (Note: There is
              more than one correct answer.)
            </p>

            <ExampleGame />
          </>
        )}
        <div style={{ height: "10rem" }}></div>
      </div>
    </div>
  )
}
