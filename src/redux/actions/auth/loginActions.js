import axios from "axios"
import { history } from "../../../history"

// En développement, Vite transmet cet appel au serveur distant. Cela évite le
// pré-vol CORS OPTIONS, que l'API distante rejette actuellement avec un 405.
const AGENT_LOGIN_URL =
  "https://sendbox-kisalu.trans-academia.cd/api/v1/user/agent"

const agentApi = axios.create({
  adapter: axios.getAdapter("xhr")
})

const getApiErrorMessage = error => {
  const responseData = error.response && error.response.data

  if (responseData) {
    return (
      responseData.message ||
      responseData.error ||
      (responseData.data && responseData.data.message) ||
      "Impossible de vous connecter."
    )
  }

  return "Le service de connexion est indisponible. Vérifiez votre connexion Internet."
}

export const loginAgent = ({ login, pwd }) => {
  return async dispatch => {
    dispatch({ type: "LOGIN_REQUEST" })

    try {
      const requestBody = `login=${encodeURIComponent(login)}&pwd=${encodeURIComponent(pwd)}`
      console.log("[Auth] Tentative de connexion agent", {
        url: AGENT_LOGIN_URL,
        login
      })
      const response = await agentApi.post(AGENT_LOGIN_URL, requestBody, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" }
      })
      console.log("[Auth] Réponse de connexion reçue", {
        status: response.status,
        message: response.data && response.data.message,
        agentLogin:
          response.data && response.data.data && response.data.data.login
      })
      const responseData = response.data || {}
      const payload = responseData.data || responseData
      const tokenData = responseData.token || payload.token
      const token =
        (tokenData && (tokenData.access || tokenData.access_token)) ||
        tokenData ||
        payload.access_token ||
        responseData.access_token
      const refreshToken = tokenData && tokenData.refresh
      const id_user_created = payload.agent_id 
      const nom = payload.nom
      const prenom = payload.prenom
      const role = payload.role_libelle
      const agent = payload.user || payload.agent || responseData.user || payload

      if (token) {
        localStorage.setItem("token", token)
      }
      if (refreshToken) {
        localStorage.setItem("refreshToken", refreshToken)
      }

      if(id_user_created)
      {
        localStorage.setItem("id_user_created", id_user_created)
      }
      if(nom)
      {
        localStorage.setItem("nom", nom)
      }
      if(prenom)
      {
        localStorage.setItem("prenom", prenom)
      }
      if(role)
      {
        localStorage.setItem("role", role)
      }

      dispatch({
        type: "LOGIN_WITH_JWT",
        payload: {
          loggedInUser: agent,
          token,
          refreshToken,
          loggedInWith: "agent"
        }
      })

      history.push("/dashboard")
      return responseData
    } catch (error) {
      console.error("[Auth] Échec de la connexion agent", {
        message: error.message,
        code: error.code,
        url: error.config && error.config.url,
        method: error.config && error.config.method,
        status: error.response && error.response.status,
        response: error.response && error.response.data,
        request: error.request
      })
      const message = getApiErrorMessage(error)
      dispatch({ type: "LOGIN_FAILURE", payload: { message } })
      throw new Error(message)
    }
  }
}

export const logoutWithJWT = () => {
  return dispatch => {
    localStorage.removeItem("token")
    localStorage.removeItem("refreshToken")
    dispatch({ type: "LOGOUT_WITH_JWT", payload: {} })
    history.push("/")
  }
}
