"use client"

import styles from "@/styles/MultiplayerHomePage.module.css"
import { useContext, useEffect } from "react"
import { SocketContext } from "../SocketConnection"
import { MultiplayerLobbies, MultiplayerLobby } from "@/helpers/types"
import UserIcon from "../shared/UserIcon"
import { PublicUser, PublicUsers } from "@/helpers/userHandling"
import { getPublicUuid } from "@/helpers/uuidHandler"
import LogoutIcon from "@mui/icons-material/Logout"
import ChatComponent from "../shared/GameChat"
import { useRouter, useSearchParams } from "next/navigation"

export default function MultiplayerHomePage() {
  const { lobbiesData, gameData, userData, submitAction } =
    useContext(SocketContext)
  const router = useRouter()
  const lobbyId = useSearchParams()?.get("lobbyId")

  useEffect(() => {
    if (typeof lobbyId === "string") {
      const game = gameData[lobbyId]
      if (game) {
        router.push(`/game?lobbyId=${lobbyId}`, undefined)
      }
    }
  }, [lobbyId, lobbiesData, gameData])

  const playerIsInAnyLobby = Object.values(lobbiesData).some((lobby) =>
    lobby.players.includes(getPublicUuid())
  )

  return (
    <div className={styles.container}>
      <div className={styles.columnContainer}>
        <h2 className={styles.title}>Multiplayer Lobbies</h2>

        <MultiplayerLobbyList
          lobbiesData={lobbiesData}
          userData={userData}
          submitAction={submitAction}
        />
        {!playerIsInAnyLobby && (
          <CreateLobbyButton submitAction={submitAction} />
        )}
      </div>
      <div className={styles.columnContainer}>
        <ChatComponent />
      </div>
    </div>
  )
}

const MultiplayerLobbyList = ({
  lobbiesData,
  userData,
  submitAction,
}: {
  lobbiesData: MultiplayerLobbies
  userData: PublicUsers
  submitAction: (action: any, callback?: (obj: any) => void) => void
}) => {
  const router = useRouter()
  const playerIsInAnyLobby = Object.values(lobbiesData).some((lobby) =>
    lobby.players.includes(getPublicUuid())
  )

  const navigateToGamePage = (obj: any) => {
    router.push(`/multiplayer?lobbyId=${obj.lobbyId}`, undefined)
    // Don't set isLoading to false here - let the useEffect handle it
  }

  const navigateToMultiplayerPage = () => {
    router.push(`/multiplayer`, undefined)
  }

  const handleJoinLobby = (lobbyId: string) => {
    submitAction(
      {
        type: "JOIN_LOBBY",
        lobbyId,
      },
      navigateToGamePage
    )
  }

  const handleStartGame = (lobbyId: string) => {
    submitAction({
      type: "INITIALISE_GAME",
      gameType: "MULTIPLAYER",
      lobbyId,
    })
  }

  const handleLeaveLobby = (lobbyId: string) => {
    submitAction(
      {
        type: "LEAVE_LOBBY",
        lobbyId,
      },
      navigateToMultiplayerPage
    )
  }

  return (
    <div className={styles.lobbyListcontainer}>
      {Object.values(lobbiesData).length === 0 && <div>No lobbies yet.</div>}
      {Object.values(lobbiesData).map((lobby) => (
        <LobbyListItem
          key={lobby.lobbyId}
          lobby={lobby}
          host={userData[lobby.host]}
          playerIsInAnyLobby={playerIsInAnyLobby}
          handleJoinLobby={handleJoinLobby}
          handleStartGame={handleStartGame}
          handleLeaveLobby={handleLeaveLobby}
        />
      ))}
    </div>
  )
}

const LobbyListItem = ({
  lobby,
  host,
  playerIsInAnyLobby,
  handleJoinLobby,
  handleStartGame,
  handleLeaveLobby,
}: {
  lobby: MultiplayerLobby
  host: PublicUser
  playerIsInAnyLobby: boolean
  handleJoinLobby: (lobbyIdToJoin: string) => void
  handleStartGame: (lobbyIdToStart: string) => void
  handleLeaveLobby: (lobbyIdToLeave: string) => void
}) => {
  const isHost = lobby.host === getPublicUuid()
  const isPlayer = lobby.players.includes(getPublicUuid())

  const isJoinable =
    lobby.players.length < lobby.maxPlayers && !playerIsInAnyLobby

  return (
    <div
      className={`${styles.lobbyListItemContainer} ${
        isPlayer ? styles.playerLobby : ""
      } ${isJoinable ? styles.joinableLobby : ""}`}
      onClick={() =>
        lobby.players.length < lobby.maxPlayers &&
        !playerIsInAnyLobby &&
        handleJoinLobby(lobby.lobbyId)
      }
    >
      <span className={styles.lobbyTitle}>{`${
        host.globalUsername || "Unknown Player"
      }'s Lobby`}</span>
      <div className={styles.userIconsContainer}>
        {lobby.players.map((player) => (
          <UserIcon
            key={player}
            publicUuid={player}
            variant="avatar"
            size="small"
          />
        ))}
        {isJoinable && (
          <div
            className={styles.addPlayerIcon}
            onClick={() => handleJoinLobby(lobby.lobbyId)}
          >
            +
          </div>
        )}
      </div>
      <div className={styles.lobbyActionButtonsContainer}>
        {isHost && lobby.players.length > 1 && (
          <div
            className={`${styles.lobbyActionButton} ${styles.startGameButton}`}
            onClick={() => handleStartGame(lobby.lobbyId)}
          >
            <span>Start Game</span>
          </div>
        )}
        {isPlayer && (
          <div
            className={`${styles.lobbyActionButton} ${styles.leaveLobbyButton}`}
            onClick={() => handleLeaveLobby(lobby.lobbyId)}
          >
            <LogoutIcon sx={{ fontSize: 16 }} />
            {(!isHost || lobby.players.length == 1) && <span>Leave Lobby</span>}
          </div>
        )}
      </div>
    </div>
  )
}

const CreateLobbyButton = ({
  submitAction,
}: {
  submitAction: (action: any, callback?: (obj: any) => void) => void
}) => {
  const router = useRouter()
  const navigateToGamePage = (obj: any) => {
    router.push(`/multiplayer?lobbyId=${obj.lobbyId}`, undefined)
    // Don't set isLoading to false here - let the useEffect handle it
  }
  const handleCreateLobby = () => {
    submitAction(
      {
        type: "CREATE_LOBBY",
      },
      navigateToGamePage
    )
  }
  return (
    <div
      className={`${styles.lobbyListItemContainer} ${styles.createLobbyButton} `}
      onClick={handleCreateLobby}
    >
      <span className={styles.createLobbyLabel}>Create new Lobby</span>
    </div>
  )
}
