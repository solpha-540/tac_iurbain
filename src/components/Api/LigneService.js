import api from "../../services/api/urbainApi"
import { getVilles } from "./VilleService"

const request = async (method, url, data, fallback) => {
  const response = await api({ method, url, data })
  const body = response.data || {}
  if (body.code && ![200, 201].includes(body.code)) throw new Error(body.message || fallback)
  return body.data || body
}
const list = async (url, fallback) => {
  const data = await request("get", url, undefined, fallback)
  return Array.isArray(data) ? data : []
}

export const getLignesPrincipales = () => list("/resource/lignes-principales", "Impossible de récupérer les lignes principales.")
export const createLignePrincipale = data => request("post", "/resource/lignes-principales", data, "Impossible de créer la ligne principale.")
export const updateLignePrincipale = (id, data) => request("put", `/resource/lignes-principales/${id}`, data, "Impossible de modifier la ligne principale.")
export const deleteLignePrincipale = id => request("delete", `/resource/lignes-principales/${id}`, undefined, "Impossible de supprimer la ligne principale.")
export const getLignesSecondaires = () => list("/resource/lignes-secondaires", "Impossible de récupérer les lignes secondaires.")
export const createLigneSecondaire = data => request("post", "/resource/lignes-secondaires", data, "Impossible de créer la ligne secondaire.")
export const updateLigneSecondaire = (id, data) => request("put", `/resource/lignes-secondaires/${id}`, data, "Impossible de modifier la ligne secondaire.")
export const deleteLigneSecondaire = id => request("delete", `/resource/lignes-secondaires/${id}`, undefined, "Impossible de supprimer la ligne secondaire.")


export const getPrixLignes = () => list("/resource/prix-lignes", "Impossible de récupérer les tarifs.")
export const createPrixLigne = data => request("post", "/resource/prix-lignes", data, "Impossible de créer le tarif.")
export const updatePrixLigne = (id, data) => request("put", `/resource/prix-lignes/${id}`, data, "Impossible de modifier le tarif.")
export const deletePrixLigne = id => request("delete", `/resource/prix-lignes/${id}`, undefined, "Impossible de supprimer le tarif.")
export { getVilles }
