import { createApi, kisaluBaseURL, requireBaseURL } from "../api/createApi"
import {
  getKisaluVersion, getKisaluToken, isKisaluTokenValid, setKisaluTokens
} from "./tokenStorage"

const authApi = createApi(kisaluBaseURL)
let loginFlight = null
export const ensureKisaluToken = (force = false) => {
  const version = getKisaluVersion()
  if (loginFlight?.version === version) return loginFlight.promise
  if (!force && isKisaluTokenValid()) return Promise.resolve(getKisaluToken())
  const promise = (async () => {
    requireBaseURL(kisaluBaseURL)
    const login = import.meta.env.VITE_KISALU_LOGIN
    const pwd = import.meta.env.VITE_KISALU_PWD
    if (!login || !pwd) throw new Error("Les identifiants du service Kisalu ne sont pas configurés.")
    const response = await authApi.post("/user/agent", { login: String(login), pwd })
    const body = response.data || {}
    if (body.code && Number(body.code) !== 200) throw new Error(body.message || "Connexion Kisalu impossible.")
    if (typeof body.token?.access !== "string" || !body.token.access) throw new Error("Réponse d'authentification Kisalu invalide.")
    if (version !== getKisaluVersion()) throw new Error("Session Kisalu terminée.")
    setKisaluTokens(body.token)
    return body.token.access
  })()
  const flight = { version, promise }
  loginFlight = flight
  promise.finally(() => { if (loginFlight === flight) loginFlight = null }).catch(() => {})
  return promise
}
