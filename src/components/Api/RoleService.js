import urbainApi from "../../services/api/urbainApi"

const readBody = response => {
  const body = response.data || {}
  if (body.code && ![200, 201].includes(Number(body.code))) {
    const error = new Error(body.message || "Impossible de traiter les rôles.")
    error.response = { data: body }
    throw error
  }
  return body
}
export const getRoles = async () => {
  const body = readBody(await urbainApi.get("/resource/roles"))
  const roles = Array.isArray(body.data) ? body.data : body.data?.roles
  return Array.isArray(roles) ? roles : []
}
export const createRole = async label => {
  const value = String(label ?? "").trim()
  if (!value) throw new Error("Le libellé du rôle est obligatoire.")
  const body = readBody(await urbainApi.post("/resource/roles", { label: value }))
  return body.data || body
}
