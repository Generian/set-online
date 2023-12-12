export const setCookie = (
  name: string,
  value: string,
  lifetimeInDays: number
) => {
  document.cookie = `${name}=${value}; expires=${new Date(
    new Date().getTime() + 60 * 60 * 1000 * 24 * lifetimeInDays
  ).toUTCString()}`
}

export const getCookie = (cname: string) => {
  if (typeof document == "undefined") return null
  let name = cname + "="
  let decodedCookie = decodeURIComponent(document.cookie)
  let ca = decodedCookie.split(";")
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i]
    while (c.charAt(0) == " ") {
      c = c.substring(1)
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length)
    }
  }
}
