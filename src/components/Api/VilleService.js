import api from "../../services/api/urbainApi"

export const getVilles = async () => {
  const response = await api.get("/resource/cities")
  const responseData = response.data || {}

  if (responseData.code !== 200) {
    throw new Error(responseData.message || "Impossible de récupérer les villes.")
  }

  return Array.isArray(responseData.data) ? responseData.data : []
}


export const createVille = async ville => {
  const response = await api.post("/resource/cities", ville)
  const responseData = response.data || {}

  if (responseData.code && responseData.code !== 200 && responseData.code !== 201) {
    throw new Error(responseData.message || "Impossible de créer la ville.")
  }

  return responseData.data || responseData
}

export const updateVille = async (id, ville) => {
  const response = await api.put(`/resource/cities/${id}`, ville)
  const responseData = response.data || {}

  if (responseData.code !== 200) {
    throw new Error(responseData.message || "Impossible de modifier la ville.")
  }

  return responseData.data || responseData
}

export const deleteVille = async id => {
  const response = await api.delete(`/resource/cities/${id}`)
  const responseData = response.data || {}

  if (responseData.code !== 200) {
    throw new Error(responseData.message || "Impossible de supprimer la ville.")
  }

  return responseData.data || responseData
}
