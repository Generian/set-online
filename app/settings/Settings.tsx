import styles from "@/styles/Settings.module.css"
import { Button, Switch, TextField } from "@mui/material"
import { Card } from "../game/Card"
import {
  BoxVariant,
  Color,
  Count,
  OvalVariant,
  Shading,
  ShapeType,
  defaultColors,
} from "../game/Shape"
import useUserPreferences from "@/helpers/useUserPreferences"

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
  const {
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
  } = useUserPreferences()

  // Event handlers
  const handleUsernameChange = (newUsername: string) => {
    setUsername(newUsername)
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

  const handleCleanModeChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setCleanMode(event.target.checked)
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
            value={username}
            onChange={(event) => handleUsernameChange(event.target.value)}
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
        <div className={styles.settigsSection}>
          <h2>Misc</h2>
          <div>
            <Switch
              checked={cleanMode}
              onChange={handleCleanModeChange}
              inputProps={{ "aria-label": "controlled" }}
            />
            {"Clean Mode"}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings
