import { createApi, urbainBaseURL, requireBaseURL } from "../api/createApi"
import {
  clearUrbainTokens, clearKisaluTokens, getUrbainVersion, getUrbainRefreshToken,
  isUrbainRefreshExpired, setUrbainTokens, setUrbainProfile
} from "./tokenStorage"

const authApi = createApi(urbainBaseURL)
let refreshFlight = null
const parse = response => {
  const body = response.data || {}
  if (body.code && Number(body.code) !== 200) throw new Error(body.message || "Connexion impossible.")
  if (!body.data?.access_token || typeof body.data.access_token !== "string") throw new Error("Réponse d'authentification Inter-urbain invalide.")
  return body.data
}
export const login = async (loginValue, pwd) => {
  requireBaseURL(urbainBaseURL)
  clearUrbainTokens()
  clearKisaluTokens()
  const version = getUrbainVersion()
  const data = parse(await authApi.post("/auth/login", { login: String(loginValue), pwd }))
  if (version !== getUrbainVersion()) throw new Error("Connexion annulée.")
  setUrbainTokens(data)
  setUrbainProfile(data)
  return data
}
export const refreshUrbainToken = () => {
  const version = getUrbainVersion()
  if (refreshFlight?.version === version) return refreshFlight.promise
  const promise = (async () => {
    requireBaseURL(urbainBaseURL)
    const path = import.meta.env.VITE_URBAIN_REFRESH_PATH
    const field = import.meta.env.VITE_URBAIN_REFRESH_TOKEN_FIELD
    const refreshToken = getUrbainRefreshToken()
    if (!path || !field || !refreshToken || isUrbainRefreshExpired()) {
      throw new Error("Votre session a expiré. Veuillez vous reconnecter.")
    }
    if (!path.startsWith("/") || path.startsWith("//")) throw new Error("Chemin de refresh invalide.")
    const data = parse(await authApi.post(path, { [field]: refreshToken }))
    if (version !== getUrbainVersion()) throw new Error("Session terminée.")
    setUrbainTokens({ ...data, refresh_token: data.refresh_token || refreshToken })
    return data.access_token
  })()
  const flight = { version, promise }
  refreshFlight = flight
  promise.finally(() => { if (refreshFlight === flight) refreshFlight = null }).catch(() => {})
  return promise
}
