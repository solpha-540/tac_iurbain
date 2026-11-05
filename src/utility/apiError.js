const labels = {
  nom: "Nom", postnom: "Postnom", prenom: "Prénom", Telephone: "Téléphone",
  sexe: "Sexe", lieuNaissance: "Lieu de naissance", DateNaissance: "Date de naissance",
  date_embauche: "Date d'embauche", email: "E-mail", Fonction: "Fonction", Grade: "Grade",
  id_commune: "Commune", Id_direction: "Direction", Id_service: "Service",
  Id_user_created_at: "Utilisateur créateur", photo: "Photo", Id_agent: "Agent",
  agent_id: "Agent", id_agence: "Agence", DateAffectation: "Date d'affectation",
  login: "Login", pwd: "Mot de passe", pwd_confirmation: "Confirmation du mot de passe",
  status: "Statut", role_id: "Rôle"
}
const messages = value => {
  if (typeof value === "string") return [value]
  if (Array.isArray(value)) return value.flatMap(messages)
  if (value && typeof value === "object") return Object.values(value).flatMap(messages)
  return []
}
export const formatApiError = (error, fallback = "Opération impossible.") => {
  const body = error.response?.data
  const summary = typeof body?.message === "string" ? body.message : error.message || fallback
  // Certains endpoints placent le dictionnaire de validation dans data.errors,
  // d'autres directement dans data. Ne pas afficher de réponse brute.
  let bag = body?.errors ?? body?.error ?? body?.data?.errors ?? body?.validation_errors
  if (!bag && body?.data && typeof body.data === "object" && !Array.isArray(body.data)) {
    bag = Object.fromEntries(Object.entries(body.data).filter(([key, value]) =>
      labels[key] && (typeof value === "string" || Array.isArray(value))))
  }
  const details = typeof bag === "string" || Array.isArray(bag)
    ? messages(bag)
    : Object.entries(bag || {}).flatMap(([key, value]) =>
      messages(value).map(message => (labels[key] || key) + " : " + message))
  return [summary, ...new Set(details)].filter(Boolean).join("\n")
}
