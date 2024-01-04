import { debounce } from "@mui/material"
import { useState, useEffect, useContext } from "react"
import { getCookie, setCookie } from "./cookies"
import {
  BoxVariant,
  CustomColors,
  OvalVariant,
  ShapeVariants,
  defaultColors,
} from "@/components/game/Shape"
import { SocketContext } from "@/components/general/SocketConnection"

export interface UserPreferences {
  username: string
  shapeVariants: ShapeVariants
  customColors: CustomColors
}

export default function useUserPreferences() {
  const [username, setUsername] = useState<string>("")
  const [boxVariant, setBoxVariant] = useState<BoxVariant>("RECTANGLE")
  const [ovalVariant, setOvalVariant] = useState<OvalVariant>("OVAL")
  const [colors, setColors] = useState<CustomColors>(defaultColors)

  const { submitAction } = useContext(SocketContext)

  useEffect(() => {
    const userPreferencesRaw = getCookie("userPreferences")
    if (userPreferencesRaw) {
      const {
        username,
        shapeVariants: { box, oval },
        customColors,
      } = JSON.parse(userPreferencesRaw) as UserPreferences
      console.log("values:", username)
      username && setUsername(username)
      box && setBoxVariant(box)
      oval && setOvalVariant(oval)
      customColors && setColors(customColors)
    }
  }, [])

  const setUserPreferenceCookie = debounce(
    (username, boxVariant, ovalVariant, colors) => {
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
          })
        )
      }
    },
    500
  )

  useEffect(() => {
    setUserPreferenceCookie(username, boxVariant, ovalVariant, colors)
  }, [username, boxVariant, ovalVariant, colors])

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
  }
}
