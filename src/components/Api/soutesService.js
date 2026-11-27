import api from "../../services/api/urbainApi"

const endpoint = "/resource/soutes"

const readData = (response, code, fallback) => {
  const body = response.data
  if (Number(body?.code) !== code) throw new Error(body?.message || fallback)
  return body.data
}

export const getSoutes = async (idBus, { signal } = {}) => {
  const response = await api.get(endpoint, { params: { id_bus: idBus }, signal })
  const soutes = readData(response, 200, "Impossible de récupérer les soutes.")
  if (!Array.isArray(soutes)) throw new Error("La liste des soutes est invalide.")
  return soutes
}

export const createSoute = async ({ id_bus, code, libelle }) => {
  const response = await api.post(endpoint, { id_bus, code, libelle })
  const soute = readData(response, 201, "Impossible de créer la soute.")
  if (!soute?.id) throw new Error("La réponse de création de la soute est invalide.")
  return soute
}
