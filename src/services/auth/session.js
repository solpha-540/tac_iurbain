import { history } from "../../history"
import { clearUrbainTokens, clearKisaluTokens } from "./tokenStorage"

const listeners = new Set()
export const onSessionEnded = callback => {
  listeners.add(callback)
  return () => listeners.delete(callback)
}
export const endSession = () => {
  clearUrbainTokens()
  clearKisaluTokens()
  listeners.forEach(callback => callback())
  history.replace("/pages/login")
}
