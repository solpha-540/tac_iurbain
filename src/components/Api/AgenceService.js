import api from "./axiosConfig"

export const getAgences = async () => {
  const response = await api.get("/resource/agencies")
  const responseData = response.data || {}

  if (responseData.code !== 200) {
    throw new Error(responseData.message || "Impossible de récupérer les Agences.")
  }

  return Array.isArray(responseData.data) ? responseData.data : []
}


export const createAgence = async agence => {
  const response = await api.post("/resource/agencies", agence)
  const responseData = response.data || {}

  if (responseData.code && responseData.code !== 200 && responseData.code !== 201) {
    throw new Error(responseData.message || "Impossible de créer la Agence.")
  }

  return responseData.data || responseData
}

export const updateAgence = async (id, agence) => {
  const response = await api.put(`/resource/agencies/${id}`, agence)
  const responseData = response.data || {}

  if (responseData.code !== 200) {
    throw new Error(responseData.message || "Impossible de modifier la Agence.")
  }

  return responseData.data || responseData
}

export const deleteAgence = async id => {
  const response = await api.delete(`/resource/agencies/${id}`)
  const responseData = response.data || {}

  if (responseData.code !== 200) {
    throw new Error(responseData.message || "Impossible de supprimer la Agence.")
  }

  return responseData.data || responseData
}
