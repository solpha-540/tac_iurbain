import api from "../../services/api/urbainApi"
import { getUrbainProfile, getUrbainToken } from "../../services/auth/tokenStorage"
import { AGENCY_MANAGER, getUrbainRole } from "../../services/auth/roles"

const requireAgencyId = () => {
  const { user, agent, agency } = getUrbainProfile()
  const id = Number(agency?.id)
  if (!getUrbainToken() || getUrbainRole(user, agent) !== AGENCY_MANAGER || !Number.isSafeInteger(id) || id <= 0) {
    throw new Error("Un chef d’agence rattaché à une agence est requis.")
  }
  return id
}

const request = async (method, url, data, fallback) => {
  const response = await api({ method, url, data })
  const body = response.data || {}
  if (body.code && ![200, 201].includes(Number(body.code))) {
    throw new Error(body.message || fallback)
  }
  return body.data || body
}

export const getPrixCargos = async () => {
  const agencyId = requireAgencyId()
  const data = await request("get", "/resource/prix-locations", undefined, "Impossible de récupérer les prix cargo.")
  const prices = Array.isArray(data) ? data : data && data.prix_locations
  if (!Array.isArray(prices)) {
    throw new Error("La réponse de l'API des prix cargo est invalide.")
  }
  return prices.filter(price => Number(price.id_agence ?? price.agence?.id ?? price.agence_id) === agencyId)
}

export const createPrixCargo = async data => {
  const result = await request(
    "post",
    "/resource/prix-locations",
    { ...data, id_agence: requireAgencyId() },
    "Impossible de créer le prix cargo."
  )
  return result.prix_location
}