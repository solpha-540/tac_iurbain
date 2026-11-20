import api from "../../services/api/urbainApi"

const request = async (method, url, data, fallback) => {
  const response = await api({ method, url, data })
  const body = response.data || {}
  if (body.code && ![200, 201].includes(body.code)) {
    throw new Error(body.message || fallback)
  }
  return body.data || body
}

export const getPrixCargos = async () => {
  const data = await request("get", "/resource/prix-locations", undefined, "Impossible de récupérer les prix cargo.")
  const prices = Array.isArray(data) ? data : data && data.prix_locations
  if (!Array.isArray(prices)) {
    throw new Error("La réponse de l'API des prix cargo est invalide.")
  }
  return prices
}

export const createPrixCargo = data =>
  request("post", "/resource/prix-locations", data, "Impossible de créer le prix cargo.")