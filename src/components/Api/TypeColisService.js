import api from "./axiosConfig"

const request = async (method, url, data, fallback) => {
  const response = await api({ method, url, data })
  const responseData = response.data || {}

  if (responseData.code && ![200, 201].includes(responseData.code)) {
    throw new Error(responseData.message || fallback)
  }

  return responseData.data || responseData
}

export const getTypesColis = async () => {
  const data = await request("get", "/resource/type-colis", undefined, "Impossible de récupérer les types de colis.")
  return Array.isArray(data) ? data : []
}

export const createTypeColis = typeColis =>
  request("post", "/resource/type-colis", typeColis, "Impossible de créer le type de colis.")

export const updateTypeColis = (id, typeColis) =>
  request("put", `/resource/type-colis/${id}`, typeColis, "Impossible de modifier le type de colis.")

export const deleteTypeColis = id =>
  request("delete", `/resource/type-colis/${id}`, undefined, "Impossible de supprimer le type de colis.")
