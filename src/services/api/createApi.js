import axios from "axios"

export const createApi = baseURL => axios.create({
  baseURL,
  timeout: 10000,
  ...(typeof XMLHttpRequest !== "undefined" ? { adapter: axios.getAdapter("xhr") } : {})
})
// Le navigateur utilise la même origine en développement. Les tests SSR et
// la production conservent les URL configurées dans l'environnement.
const browserDev = import.meta.env.DEV && !import.meta.env.SSR
export const urbainBaseURL = import.meta.env.VITE_URBAIN_BASE_URL
  ? (browserDev ? "/api-urbain" : import.meta.env.VITE_URBAIN_BASE_URL)
  : undefined
export const kisaluBaseURL = import.meta.env.VITE_KISALU_BASE_URL
  ? (browserDev ? "/api-kisalu" : import.meta.env.VITE_KISALU_BASE_URL)
  : undefined
export const requireBaseURL = value => {
  if (!value) throw new Error("L'URL du service API n'est pas configurée.")
}
