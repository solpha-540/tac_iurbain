import api from "../../services/api/urbainApi"

export const getCommunes = async () => {
  const response = await api.get("/resource/communes")
  const responseData = response.data || {}

  if (responseData.code !== 200) {
    throw new Error(responseData.message || "Impossible de récupérer les Communes.")
  }

  return Array.isArray(responseData.data) ? responseData.data : []
}


export const createCommune = async commune => {
  const response = await api.post("/resource/communes", commune)
  const responseData = response.data || {}

  if (responseData.code && responseData.code !== 200 && responseData.code !== 201) {
    throw new Error(responseData.message || "Impossible de créer la Commune.")
  }

  return responseData.data || responseData
}

export const updateCommune = async (id, commune) => {
  const response = await api.put(`/resource/communes/${id}`, commune)
  const responseData = response.data || {}

  if (responseData.code !== 200) {
    throw new Error(responseData.message || "Impossible de modifier la Commune.")
  }

  return responseData.data || responseData
}

export const deleteCommune = async id => {
  const response = await api.delete(`/resource/communes/${id}`)
  const responseData = response.data || {}

  if (responseData.code !== 200) {
    throw new Error(responseData.message || "Impossible de supprimer la Commune.")
  }

  return responseData.data || responseData
}
