import api from "./axiosConfig"

export const getProvinces = async () => {
  const response = await api.get("/resource/provinces")
  const responseData = response.data || {}

  if (responseData.code !== 200) {
    throw new Error(responseData.message || "Impossible de récupérer les provinces.")
  }

  return Array.isArray(responseData.data) ? responseData.data : []
}

export const createProvince = async province => {
  const response = await api.post("/resource/provinces", province)
  const responseData = response.data || {}

  if (responseData.code && responseData.code !== 200 && responseData.code !== 201) {
    throw new Error(responseData.message || "Impossible de créer la province.")
  }

  return responseData.data || responseData
}

export const updateProvince = async (id, province) => {
  const response = await api.put(`/resource/provinces/${id}`, province)
  const responseData = response.data || {}

  if (responseData.code !== 200) {
    throw new Error(responseData.message || "Impossible de modifier la province.")
  }

  return responseData.data || responseData
}

export const deleteProvince = async id => {
  const response = await api.delete(`/resource/provinces/${id}`)
  const responseData = response.data || {}

  if (responseData.code !== 200) {
    throw new Error(responseData.message || "Impossible de supprimer la province.")
  }

  return responseData.data || responseData
}
