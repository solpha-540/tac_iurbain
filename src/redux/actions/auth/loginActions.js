import { history } from "../../../history"
import { AGENCY_MANAGER, getUrbainRole } from "../../../services/auth/roles"
import { login } from "../../../services/auth/urbainAuth"
import { endSession, onSessionEnded } from "../../../services/auth/session"
import { setNom, setPrenom, setRole, setUserId } from "../../../utility/utlitaire"

const getApiErrorMessage = error => {
  const body = error.response?.data
  return body?.message || body?.error || error.message || "Impossible de vous connecter."
}
let activeDispatch = null
onSessionEnded(() => {
  if (activeDispatch) activeDispatch({ type: "LOGOUT_WITH_JWT", payload: {} })
})
export const loginUrbain = ({ login: loginValue, pwd }) => async dispatch => {
  activeDispatch = dispatch
  dispatch({ type: "LOGIN_REQUEST" })
  try {
    const data = await login(loginValue, pwd)
    const user = data.user || {}
    const agent = data.agent || {}
    setUserId(user.id || agent.agent_id || agent.id)
    setNom(user.nom || agent.nom)
    setPrenom(user.prenom || agent.prenom)
    setRole(user.role?.label || user.role_libelle || agent.role_libelle)
    dispatch({
      type: "LOGIN_WITH_JWT",
      payload: { loggedInUser: user, agent: data.agent, agency: data.agency, loggedInWith: "urbain" }
    })
    history.push(getUrbainRole(user, agent) === AGENCY_MANAGER ? "/accueil-agence" : "/dashboard")
    return data
  } catch (error) {
    const message = getApiErrorMessage(error)
    dispatch({ type: "LOGIN_FAILURE", payload: { message } })
    throw new Error(message)
  }
}
// Compatibilité avec les anciens composants.
export const loginAgent = loginUrbain
export const logoutWithJWT = () => dispatch => {
  activeDispatch = dispatch
  endSession()
}

export const changeRole = userRole => ({ type: "CHANGE_ROLE", userRole })
