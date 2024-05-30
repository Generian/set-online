"use client"

import { debounce } from "@mui/material"
import { useState, useEffect, useContext } from "react"
import { getCookie, setCookie } from "./cookies"
import {
  BoxVariant,
  CustomColors,
  OvalVariant,
  ShapeVariants,
  defaultColors,
} from "@/app/game/Shape"
import { SocketContext } from "@/app/SocketConnection"

export interface UserPreferences {
  username: string
  shapeVariants: ShapeVariants
  customColors: CustomColors
  cleanMode: boolean
}

export default function useUserPreferences() {
  const [username, setUsername] = useState<string>("")
  const [boxVariant, setBoxVariant] = useState<BoxVariant>("RECTANGLE")
  const [ovalVariant, setOvalVariant] = useState<OvalVariant>("OVAL")
  const [colors, setColors] = useState<CustomColors>(defaultColors)
  const [cleanMode, setCleanMode] = useState<boolean>(false)

  const { submitAction } = useContext(SocketContext)

  useEffect(() => {
    const userPreferencesRaw = getCookie("userPreferences")
    if (userPreferencesRaw) {
      const {
        username,
        shapeVariants: { box, oval },
        customColors,
        cleanMode,
      } = JSON.parse(userPreferencesRaw) as UserPreferences
      console.log("Loading user preferences for:", username)
      username && setUsername(username)
      box && setBoxVariant(box)
      oval && setOvalVariant(oval)
      customColors && setColors(customColors)
      cleanMode && setCleanMode(cleanMode)
    }
  }, [])

  const setUserPreferenceCookie = debounce(
    (username, boxVariant, ovalVariant, colors, cleanMode) => {
      if (boxVariant || ovalVariant || colors) {
        setCookie(
          "userPreferences",
          JSON.stringify({
            username,
            shapeVariants: {
              box: boxVariant,
              oval: ovalVariant,
            },
            customColors: colors,
            cleanMode,
          })
        )
      }
    },
    500
  )

  useEffect(() => {
    setUserPreferenceCookie(
      username,
      boxVariant,
      ovalVariant,
      colors,
      cleanMode
    )
  }, [username, boxVariant, ovalVariant, colors, cleanMode])

  // Save selected data also in database
  useEffect(() => {
    username &&
      submitAction({
        type: "SET_USERNAME",
        username: username,
      })
  }, [username])

  return {
    username,
    setUsername,
    boxVariant,
    setBoxVariant,
    ovalVariant,
    setOvalVariant,
    colors,
    setColors,
    cleanMode,
    setCleanMode,
  }
}
