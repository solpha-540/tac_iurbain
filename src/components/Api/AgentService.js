import axios from "axios"
import { getToken } from "../../utility/utlitaire"

const AGENTS_URL = "https://sendbox-kisalu.trans-academia.cd/api/v1/agent/ListeAgent"

// Cette API appartient au même service que la connexion Agent, pas à l'API urbain.
const agentApi = axios.create({
  timeout: 10000,
  adapter: axios.getAdapter("xhr")
})

export const getAgents = async () => {
  const token = getToken()
  if (!token) {
    throw new Error("Votre session a expiré. Veuillez vous reconnecter.")
  }

  const authorization = String(token).toLowerCase().startsWith("tac ")
    ? token
    : `tac ${token}`
  const response = await agentApi.get(AGENTS_URL, {
    headers: { Authorizations: authorization }
  })
  const responseData = response.data || {}

  if (responseData.code && responseData.code !== 200) {
    throw new Error(responseData.message || "Impossible de récupérer les agents.")
  }

  return Array.isArray(responseData.data) ? responseData.data : []
}
