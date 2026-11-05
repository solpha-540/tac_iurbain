import kisaluApi from "../../services/api/kisaluApi"

export const getAgents = async () => {
  const response = await kisaluApi.get("/agent/ListeAgent")
  const responseData = response.data || {}
  if (responseData.code && responseData.code !== 200) {
    throw new Error(responseData.message || "Impossible de récupérer les agents.")
  }
  return Array.isArray(responseData.data) ? responseData.data : []
}
