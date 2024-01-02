import { getPublicUuid } from "@/helpers/uuidHandler"
import styles from "@/styles/Settings.module.css"
import { Button, TextField, debounce } from "@mui/material"
import { useContext, useEffect, useMemo, useState } from "react"
import { SocketContext } from "./SocketConnection"
import { Card } from "../game/Card"
import {
  BoxVariant,
  Color,
  Count,
  CustomColors,
  OvalVariant,
  Shading,
  ShapeType,
  ShapeVariants,
  defaultColors,
} from "../game/Shape"
import { getCookie, setCookie } from "@/helpers/cookies"

export interface UserPreferences {
  shapeVariants: ShapeVariants
  customColors: CustomColors
}

const exampleCard = {
  rank: 1,
  count: 2 as Count,
  shape: "squiggle" as ShapeType,
  color: "red" as Color,
  shading: "striped" as Shading,
  column: 0,
  row: 0,
  hidden: false,
}

const Settings = () => {
  const [boxVariant, setBoxVariant] = useState<BoxVariant>("RECTANGLE")
  const [ovalVariant, setOvalVariant] = useState<OvalVariant>("OVAL")
  const [colors, setColors] = useState<CustomColors>(defaultColors)

  const { userData } = useContext(SocketContext)
  let { submitAction } = useContext(SocketContext)

  const user = userData[getPublicUuid()]

  useEffect(() => {
    const userPreferencesRaw = getCookie("userPreferences")
    if (userPreferencesRaw) {
      const {
        shapeVariants: { box, oval },
        customColors,
      } = JSON.parse(userPreferencesRaw) as UserPreferences
      box && setBoxVariant(box)
      oval && setOvalVariant(oval)
      setColors(customColors)
    }
  }, [])

  const setUserPreferenceCookie = debounce(
    (boxVariant, ovalVariant, colors) => {
      if (boxVariant || ovalVariant || colors) {
        setCookie(
          "userPreferences",
          JSON.stringify({
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
    setUserPreferenceCookie(boxVariant, ovalVariant, colors)
  }, [boxVariant, ovalVariant, colors])

  if (!user) return <></>

  const { globalUsername } = user

  // Event handlers
  const handleUsernameChange = (newUsername: string) => {
    console.log(newUsername)
    submitAction({
      type: "SET_USERNAME",
      username: newUsername,
    })
  }

  const handleColorChange = (
    color: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setColors((oldColors) => {
      return {
        ...oldColors,
        [color]: e.target.value,
      }
    })
  }

  const handleResetColors = () => {
    setColors(defaultColors)
  }

  return (
    <div className={styles.container}>
      <h1>Settings</h1>

      <div className={styles.settingsContainer}>
        <div className={styles.settigsSection}>
          <h2>Username</h2>
          <TextField
            id="outlined-basic"
            label="Username"
            variant="outlined"
            defaultValue={globalUsername ? globalUsername : ""}
            onBlur={(event) => handleUsernameChange(event.target.value)}
          />
        </div>
        <div className={styles.settigsSection}>
          <h2>Shape Preferences</h2>
          <h3>Box</h3>
          <div className={styles.cardContainer}>
            {["RECTANGLE", "DIAMOND"].map((variant, i) => (
              <Card
                key={`exampleCard_${variant}`}
                {...{
                  ...exampleCard,
                  id: 1,
                  shape: "box" as ShapeType,
                  customPosition: {
                    left: 120 * i,
                    top: 0,
                    height: 150,
                  },
                  shapeVariants: {
                    box: variant as BoxVariant,
                  },
                  customColors: colors,
                  customOnClick: () => setBoxVariant(variant as BoxVariant),
                  customSelected: boxVariant == variant,
                }}
              />
            ))}
          </div>
          <h3>Oval</h3>
          <div className={styles.cardContainer}>
            {["OVAL", "TUBE"].map((variant, i) => (
              <Card
                key={`exampleCard_${variant}`}
                {...{
                  ...exampleCard,
                  id: 1,
                  shape: "oval" as ShapeType,
                  color: "green",
                  customPosition: {
                    left: 120 * i,
                    top: 0,
                    height: 150,
                  },
                  shapeVariants: {
                    oval: variant as OvalVariant,
                  },
                  customColors: colors,
                  customOnClick: () => setOvalVariant(variant as OvalVariant),
                  customSelected: ovalVariant == variant,
                }}
              />
            ))}
          </div>
        </div>
        <div className={styles.settigsSection}>
          <h2>Colors</h2>
          <div className={styles.colorSettings}>
            {colors &&
              Object.keys(colors).map((color) => (
                <div
                  key={`Color_Setting_${color}`}
                  className={styles.colorSettingSection}
                >
                  <h3 className={styles.colorHeadings}>{color}</h3>
                  <input
                    type="color"
                    value={colors[color as Color]}
                    onChange={(e) => handleColorChange(color, e)}
                  />
                  <div className={styles.cardContainer}>
                    <Card
                      {...{
                        ...exampleCard,
                        id: 1,
                        color: color as Color,
                        customPosition: {
                          left: 0,
                          top: 0,
                          height: 150,
                        },
                        customColors: colors,
                      }}
                    />
                  </div>
                </div>
              ))}
          </div>
          <Button onClick={handleResetColors}>{"Reset"}</Button>
        </div>
      </div>
    </div>
  )
}

export default Settings
