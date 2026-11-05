import { createApi, kisaluBaseURL, requireBaseURL } from "./createApi"
import { ensureKisaluToken } from "../auth/kisaluAuth"
import { getKisaluToken, getKisaluVersion, clearKisaluTokens, authorization } from "../auth/tokenStorage"

const kisaluApi = createApi(kisaluBaseURL)
kisaluApi.interceptors.request.use(async config => {
  requireBaseURL(kisaluBaseURL)
  if (config.url !== "/agent/ListeAgent") throw new Error("Cet accès Kisalu est réservé à la liste des agents.")
  if (config._sessionVersion !== undefined && config._sessionVersion !== getKisaluVersion()) throw new Error("Session Kisalu terminée.")
  const version = getKisaluVersion()
  const token = await ensureKisaluToken()
  if (version !== getKisaluVersion()) throw new Error("Session Kisalu terminée.")
  config._sessionVersion = version
  config._accessToken = token
  config.headers.set("Authorizations", authorization(token))
  return config
})
kisaluApi.interceptors.response.use(response => response, async error => {
  const config = error.config
  if (error.response?.status !== 401 || !config || config._sessionVersion !== getKisaluVersion()) throw error
  if (config._authRetry) {
    clearKisaluTokens()
    throw new Error("Le service Kisalu refuse la connexion.")
  }
  config._authRetry = true
  try {
    if (!getKisaluToken() || getKisaluToken() === config._accessToken) await ensureKisaluToken(true)
  } catch (_) {
    if (config._sessionVersion === getKisaluVersion()) clearKisaluTokens()
    throw new Error("Impossible de connecter le service Kisalu.")
  }
  return kisaluApi(config)
})
export default kisaluApi
