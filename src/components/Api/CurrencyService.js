import api from "../../services/api/urbainApi"

export const getCurrencies = async () => {
  const response = await api.get("/resource/currencies")
  const responseData = response.data || {}

  if (responseData.code !== 200) {
    throw new Error(responseData.message || "Impossible de récupérer les devises.")
  }

  return Array.isArray(responseData.data) ? responseData.data : []
}

export const createCurrency = async currency => {
  const response = await api.post("/resource/currencies", currency)
  const responseData = response.data || {}

  if (responseData.code && responseData.code !== 200 && responseData.code !== 201) {
    throw new Error(responseData.message || "Impossible de créer la devise.")
  }

  return responseData.data || responseData
}

export const updateCurrency = async (id, currency) => {
  const response = await api.put(`/resource/currencies/${id}`, currency)
  const responseData = response.data || {}

  if (responseData.code !== 200) {
    throw new Error(responseData.message || "Impossible de modifier la devise.")
  }

  return responseData.data || responseData
}

export const deleteCurrency = async id => {
  const response = await api.delete(`/resource/currencies/${id}`)
  const responseData = response.data || {}

  if (responseData.code !== 200) {
    throw new Error(responseData.message || "Impossible de supprimer la devise.")
  }

  return responseData.data || responseData
}
