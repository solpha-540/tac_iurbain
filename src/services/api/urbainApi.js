import { createApi, urbainBaseURL, requireBaseURL } from "./createApi"
import { getUrbainToken, getUrbainVersion, authorization } from "../auth/tokenStorage"
import { refreshUrbainToken } from "../auth/urbainAuth"
import { endSession } from "../auth/session"

const urbainApi = createApi(urbainBaseURL)
urbainApi.interceptors.request.use(config => {
  requireBaseURL(urbainBaseURL)
  if (/^(?:[a-z][a-z\d+.-]*:)?\/\//i.test(config.url || "")) throw new Error("Une URL relative Inter-urbain est requise.")
  if (config._sessionVersion !== undefined && config._sessionVersion !== getUrbainVersion()) throw new Error("Session terminée.")
  config._sessionVersion = getUrbainVersion()
  const token = getUrbainToken()
  config._accessToken = token
  if (token) config.headers.set("Authorizations", authorization(token))
  else config.headers.delete("Authorizations")
  return config
})
urbainApi.interceptors.response.use(response => response, async error => {
  const config = error.config
  if (error.response?.status !== 401 || !config || config._sessionVersion !== getUrbainVersion()) throw error
  if (config._authRetry) {
    endSession()
    throw new Error("Votre session a expiré. Veuillez vous reconnecter.")
  }
  config._authRetry = true
  try {
    if (!getUrbainToken() || getUrbainToken() === config._accessToken) await refreshUrbainToken()
  } catch (_) {
    if (config._sessionVersion === getUrbainVersion()) endSession()
    throw new Error("Votre session a expiré. Veuillez vous reconnecter.")
  }
  return urbainApi(config)
})
export default urbainApi
