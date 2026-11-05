export const emptyAgentForm = {
  nom: "", postnom: "", prenom: "", Telephone: "", sexe: "", lieuNaissance: "",
  DateNaissance: "", date_embauche: "", email: "", Fonction: "", Grade: "",
  id_commune: "", Id_direction: "", Id_service: ""
}

const dateInput = value => {
  const text = String(value ?? "").trim()
  const iso = text.match(/^(\d{4}-\d{2}-\d{2})/)
  if (iso) return iso[1]
  const local = text.match(/^(\d{2})[/-](\d{2})[/-](\d{4})$/)
  return local ? local[3] + "-" + local[2] + "-" + local[1] : ""
}
const normalize = value => String(value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim()
export const kisaluAgentName = agent => [agent.nom, agent.postNom, agent.prenom].filter(Boolean).join(" ")
export const matchesKisaluAgent = (agent, query) => {
  const text = normalize([kisaluAgentName(agent), agent.telephone_un, agent.telephone_deux, agent.telephone_trois].filter(Boolean).join(" "))
  return normalize(query).split(/\s+/).filter(Boolean).every(term => text.includes(term) ||
    (/[0-9]/.test(term) && [agent.telephone_un, agent.telephone_deux, agent.telephone_trois].some(phone => String(phone ?? "").replace(/\D/g, "").includes(term.replace(/\D/g, "")) && term.replace(/\D/g, "").length > 0)))
}

export const prefillKisaluAgent = (agent, services = []) => {
  const label = normalize(agent.serviceLibelle)
  const matches = services.filter(service => label && normalize(service.libelle || service.labele || service.nom) === label)
  const sex = normalize(agent.sexe)
  return {
    ...emptyAgentForm,
    nom: agent.nom || "", postnom: agent.postNom || "", prenom: agent.prenom || "",
    Telephone: String(agent.telephone_un || agent.telephone_deux || agent.telephone_trois || ""),
    sexe: ["m", "masculin", "homme"].includes(sex) ? "M" : ["f", "feminin", "femme"].includes(sex) ? "F" : "",
    DateNaissance: dateInput(agent.dateNaissance),
    date_embauche: dateInput(agent.dateEmbauche),
    email: agent.mail || "", Fonction: agent.fonctionLibelle || "", Grade: agent.gradeLibelle || "",
    // Correspondance par libellé unique avec le catalogue Inter-urbain uniquement.
    Id_service: matches.length === 1 ? String(matches[0].id) : ""
  }
}

export const validateAgentForm = form => {
  const errors = {}
  for (const field of ["nom", "postnom", "prenom", "Telephone", "sexe", "lieuNaissance", "DateNaissance", "date_embauche", "Fonction", "Grade"]) {
    if (!String(form[field] ?? "").trim()) errors[field] = "Ce champ est obligatoire."
  }
  for (const field of ["id_commune", "Id_direction", "Id_service"]) {
    if (!/^[1-9]\d*$/.test(String(form[field]))) errors[field] = "Sélectionnez ou indiquez une référence Inter-urbain valide."
  }
  return errors
}

export const agentFormData = (form, userId, photo) => {
  if (!/^[1-9]\d*$/.test(String(userId ?? ""))) throw new Error("Utilisateur connecté introuvable. Veuillez vous reconnecter.")
  const errors = validateAgentForm(form)
  if (Object.keys(errors).length) throw new Error("Veuillez compléter les champs obligatoires.")
  const data = new FormData()
  for (const key of Object.keys(emptyAgentForm)) {
    const value = String(form[key] ?? "").trim()
    if (value) data.append(key, ["DateNaissance", "date_embauche"].includes(key) ? value + " 00:00:00" : value)
  }
  data.append("Id_user_created_at", String(userId))
  if (photo) data.append("photo", photo)
  return data
}
