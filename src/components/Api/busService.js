import kisaluApi from "../../services/api/kisaluApi"

export const getBuses = async () => {
  const response = await kisaluApi.get("/bus/get")
  const responseData = response.data || {}
  if (responseData.code && responseData.code !== 200) {
    throw new Error(responseData.message || "Impossible de récupérer les bus.")
  }
  return Array.isArray(responseData.data) ? responseData.data : []
}