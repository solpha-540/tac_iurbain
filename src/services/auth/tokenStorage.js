const storage = () => typeof window === "undefined" ? null : window.localStorage
const read = key => storage()?.getItem(key) || null
const write = (key, value) => {
  if (value === undefined || value === null) storage()?.removeItem(key)
  else storage()?.setItem(key, String(value))
}
let urbainVersion = 0
let kisaluVersion = 0
export const getUrbainVersion = () => urbainVersion
export const getKisaluVersion = () => kisaluVersion
export const getUrbainToken = () => read("urbain_access_token")
export const getUrbainRefreshToken = () => read("urbain_refresh_token")
export const getKisaluToken = () => read("kisalu_access_token")
export const getKisaluRefreshToken = () => read("kisalu_refresh_token")
const expiration = seconds => Number(seconds) > 0 ? Date.now() + Number(seconds) * 1000 : null
export const setUrbainTokens = data => {
  const previousRefresh = getUrbainRefreshToken()
  write("urbain_access_token", data.access_token)
  write("urbain_refresh_token", data.refresh_token)
  write("urbain_access_expires_at", expiration(data.expires_in))
  if (data.refresh_expires_in !== undefined || data.refresh_token !== previousRefresh) {
    write("urbain_refresh_expires_at", expiration(data.refresh_expires_in))
  }
}
export const setUrbainProfile = data => {
  for (const key of ["user", "agent", "agency"]) write("urbain_" + key, JSON.stringify(data[key] ?? null))
}
export const getUrbainProfile = () => {
  const readProfile = key => {
    try {
      return JSON.parse(read("urbain_" + key))
    } catch (_) {
      return null
    }
  }
  return { user: readProfile("user"), agent: readProfile("agent"), agency: readProfile("agency") }
}
export const isUrbainRefreshExpired = () => {
  const expires = Number(read("urbain_refresh_expires_at"))
  return expires > 0 && expires <= Date.now()
}
export const setKisaluTokens = token => {
  write("kisalu_access_token", token.access)
  write("kisalu_refresh_token", token.refresh)
  write("kisalu_access_expires_at", expiration(token.expires_in))
}
export const isKisaluTokenValid = () => {
  if (!getKisaluToken()) return false
  const expires = Number(read("kisalu_access_expires_at"))
  if (expires) return expires > Date.now() + 10000
  // Si aucune durée n'est fournie, exploiter exp uniquement comme indication de cache.
  try {
    const token = getKisaluToken().replace(/^tac\s+/i, "")
    const part = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")
    const payload = JSON.parse(atob(part))
    return payload.exp ? payload.exp * 1000 > Date.now() + 10000 : true
  } catch (_) {
    // Un token opaque reste utilisable jusqu'à un refus du serveur.
    return true
  }
}
export const clearUrbainTokens = () => {
  urbainVersion++
  for (const key of ["access_token", "refresh_token", "access_expires_at", "refresh_expires_at", "user", "agent", "agency"]) write("urbain_" + key, null)
  for (const key of ["token", "refreshToken", "id_user_created", "nom", "prenom", "role"]) write(key, null)
}
export const clearKisaluTokens = () => {
  kisaluVersion++
  for (const key of ["access_token", "refresh_token", "access_expires_at"]) write("kisalu_" + key, null)
}
export const authorization = token => "tac " + String(token).trim().replace(/^(?:tac\s+)+/i, "")
