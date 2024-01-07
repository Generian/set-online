export const createLobbyId = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
  let LobbyId = ""
  for (let i = 0; i < 5; i++) {
    const random = Math.floor(Math.random() * chars.length)
    LobbyId += chars[random]
  }
  return LobbyId
}

export const formatTimeDifference = (
  previousDate: string,
  current: any = Date.now()
) => {
  const previous = +new Date(previousDate)

  const msPerMinute = 60 * 1000
  const msPerHour = msPerMinute * 60
  const msPerDay = msPerHour * 24
  const msPerMonth = msPerDay * 30
  const msPerYear = msPerDay * 365

  const elapsed = current - previous

  if (elapsed < msPerMinute) {
    return "just now"
  } else if (elapsed < msPerHour) {
    const num = Math.round(elapsed / msPerMinute)
    return num + ` minute${num == 1 ? "" : "s"} ago`
  } else if (elapsed < msPerDay) {
    const num = Math.round(elapsed / msPerHour)
    return num + ` hour${num == 1 ? "" : "s"} ago`
  } else if (elapsed < msPerMonth) {
    const num = Math.round(elapsed / msPerDay)
    return num + ` day${num == 1 ? "" : "s"} ago`
  } else if (elapsed < msPerYear) {
    const num = Math.round(elapsed / msPerMonth)
    return num + ` month${num == 1 ? "" : "s"} ago`
  } else {
    const num = Math.round(elapsed / msPerYear)
    return num + ` year${num == 1 ? "" : "s"} ago`
  }
}

export const resolveUrlFromEnv = () => {
  const env = process.env.NODE_ENV
  if (env == "development") {
    return "http://localhost:3000/"
  } else if (env == "production") {
    return "https://set-online-79de5c5c5632.herokuapp.com/"
  } else {
    return "https://set-online-79de5c5c5632.herokuapp.com/"
  }
}
