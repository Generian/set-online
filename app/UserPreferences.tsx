"use client"

import { getCookie, setCookie } from "@/helpers/cookies"
import { debounce } from "@mui/material"
import {
  Dispatch,
  SetStateAction,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react"
import {
  BoxVariant,
  OvalVariant,
  CustomColors,
  defaultColors,
  ShapeVariants,
} from "./game/Shape"
import { SocketContext } from "./SocketConnection"

export interface UserPreferences {
  username: string
  shapeVariants: ShapeVariants
  customColors: CustomColors
  cleanMode: boolean
}

interface UserPreferencesContextProps {
  username: string
  setUsername: Dispatch<SetStateAction<string>>
  boxVariant: BoxVariant
  setBoxVariant: Dispatch<SetStateAction<BoxVariant>>
  ovalVariant: OvalVariant
  setOvalVariant: Dispatch<SetStateAction<OvalVariant>>
  colors: CustomColors
  setColors: Dispatch<SetStateAction<CustomColors>>
  cleanMode: boolean
  setCleanMode: Dispatch<SetStateAction<boolean>>
}

export const UserPreferencesContext =
  createContext<UserPreferencesContextProps>({
    username: "",
    setUsername: () => {},
    boxVariant: "RECTANGLE",
    setBoxVariant: () => {},
    ovalVariant: "OVAL",
    setOvalVariant: () => {},
    colors: defaultColors,
    setColors: () => {},
    cleanMode: false,
    setCleanMode: () => {},
  })

interface UserPreferencesContextComponentProps {
  children?: JSX.Element
}

const UserPreferencesContextComponent = ({
  children,
}: UserPreferencesContextComponentProps) => {
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

  return (
    <UserPreferencesContext.Provider
      value={{
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
      }}
    >
      {children}
    </UserPreferencesContext.Provider>
  )
}

export default UserPreferencesContextComponent
