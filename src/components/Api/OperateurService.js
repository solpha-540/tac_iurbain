import api from "./axiosConfig"

export const getOperateurs = async () => {
  const response = await api.get("/resource/payment-operators")
  const responseData = response.data || {}

  if (responseData.code !== 200) {
    throw new Error(responseData.message || "Impossible de récupérer les opérateurs de paiement.")
  }

  return Array.isArray(responseData.data) ? responseData.data : []
}

export const createOperateur = async operateur => {
  const response = await api.post("/resource/payment-operators", operateur)
  const responseData = response.data || {}

  if (responseData.code && responseData.code !== 200 && responseData.code !== 201) {
    throw new Error(responseData.message || "Impossible de créer l'opérateur de paiement.")
  }

  return responseData.data || responseData
}

export const updateOperateur = async (id, operateur) => {
  const response = await api.put(`/resource/payment-operators/${id}`, operateur)
  const responseData = response.data || {}

  if (responseData.code !== 200) {
    throw new Error(responseData.message || "Impossible de modifier l'opérateur de paiement.")
  }

  return responseData.data || responseData
}

export const deleteOperateur = async id => {
  const response = await api.delete(`/resource/payment-operators/${id}`)
  const responseData = response.data || {}

  if (responseData.code !== 200) {
    throw new Error(responseData.message || "Impossible de supprimer l'opérateur de paiement.")
  }

  return responseData.data || responseData
}
