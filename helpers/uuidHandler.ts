import { getCookie, setCookie } from "./cookies"

export const handleNewUuid = (newUuid: string, cookieName: string) => {
  const uuid = getCookie(cookieName)
  if (newUuid == uuid) {
    console.log(`Expected case. No cookie update needed. ${cookieName}:`, uuid)
  } else if (!uuid) {
    console.log(`No ${cookieName} set yet. Saving new uuid in cookie:`, newUuid)
    setCookie(cookieName, newUuid, 30)
  } else {
    console.error(
      `Received a mismatching ${cookieName}. Unexpected error. Old value: ${uuid}, new value: ${newUuid}`
    )
  }
}

export const getUuid = () => getCookie("uuid") as string
export const getPublicUuid = () => getCookie("publicUuid") as string
