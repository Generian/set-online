export const createLobbyId = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
  let LobbyId = ""
  for (let i = 0; i < 5; i++) {
    const random = Math.floor(Math.random() * chars.length)
    LobbyId += chars[random]
  }
  return LobbyId
}
