import { agentFormData } from "./agentUrbainForm"
import { getUserId } from "../../utility/utlitaire"
import urbainApi from "../../services/api/urbainApi"

export const getAllAgent = async () => {
  const response = await urbainApi.get("/resource/agents")
  const body = response.data || {}
  if (body.code && Number(body.code) !== 200) {
    throw new Error(body.message || "Impossible de récupérer les agents Inter-urbain.")
  }
  return Array.isArray(body.data?.agents) ? body.data.agents : []
}

export const createAgentUrbain = async (form, photo) => {
  const data = agentFormData(form, getUserId(), photo)
  // Axios/le navigateur ajoute la boundary multipart ; ne pas fixer Content-Type.
  const response = await urbainApi.post("/resource/agents", data)
  const body = response.data || {}
  if (body.code && ![200, 201].includes(Number(body.code))) {
    const error = new Error(body.message || "Impossible de créer l'agent Inter-urbain.")
    error.response = { data: body }
    throw error
  }
  return body.data || body
}

const positiveId = value => /^[1-9]\d*$/.test(String(value ?? ""))

export const assignAgentUrbain = async (agentId, form) => {
  if (!positiveId(agentId) || !positiveId(form.id_agence)) throw new Error("Agent et agence valides obligatoires.")
  const date = String(form.DateAffectation || "")
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/.test(date) || Number.isNaN(Date.parse(date))) {
    throw new Error("Date d'affectation invalide.")
  }
  if (Date.parse(date) > Date.now()) throw new Error("La date choisie ne peut pas être dans le futur.")
  return postAgentAction("/resource/agent-affectations", {
    Id_agent: Number(agentId), id_agence: Number(form.id_agence),
    DateAffectation: date.replace("T", " ") + (date.length === 16 ? ":00" : "")
  })
}

export const createAgentAccount = async (agentId, form) => {
  if (!positiveId(agentId) || !positiveId(form.role_id)) throw new Error("Agent et rôle valides obligatoires.")
  if (!String(form.login || "").trim()) throw new Error("Le login est obligatoire.")
  if (!form.pwd || form.pwd !== form.pwd_confirmation) throw new Error("Les mots de passe doivent être renseignés et identiques.")
  if (!String(form.status || "").trim()) throw new Error("Le statut est obligatoire.")
  return postAgentAction("/resource/agent-accounts", {
    agent_id: Number(agentId), login: String(form.login).trim(), pwd: form.pwd,
    pwd_confirmation: form.pwd_confirmation, status: String(form.status).trim(),
    role_id: Number(form.role_id)
  })
}

const postAgentAction = async (path, payload) => {
  const response = await urbainApi.post(path, payload)
  const body = response.data || {}
  if (body.code && ![200, 201].includes(Number(body.code))) {
    const error = new Error(body.message || "Impossible de terminer cette opération.")
    error.response = { data: body }
    throw error
  }
  return body.data || body
}
