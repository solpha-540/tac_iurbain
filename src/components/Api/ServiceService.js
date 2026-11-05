import api from "../../services/api/urbainApi"

const request = async (method, url, data, fallback) => {
  const response = await api({ method, url, data })
  const responseData = response.data || {}

  if (responseData.code && ![200, 201].includes(responseData.code)) {
    throw new Error(responseData.message || fallback)
  }

  return responseData.data || responseData
}

export const getServices = async () => {
  const data = await request("get", "/resource/services", undefined, "Impossible de récupérer les services.")
  return Array.isArray(data) ? data : []
}

export const createService = service =>
  request("post", "/resource/services", service, "Impossible de créer le service.")

export const updateService = (id, service) =>
  request("put", `/resource/services/${id}`, service, "Impossible de modifier le service.")

export const deleteService = id =>
  request("delete", `/resource/services/${id}`, undefined, "Impossible de supprimer le service.")
