export const AGENCY_MANAGER = "agency-manager"

export const getUrbainRole = (user, agent) => {
  const label = (user?.role?.label || user?.role_libelle || agent?.role_libelle || "")
    .trim().toUpperCase().replace(/’/g, "'")
  if (Number(user?.role?.id) === 13 || label === "CHEF D'AGENCE") return AGENCY_MANAGER
  if (["ADMIN", "ADMINISTRATEUR", "SUPER ADMIN", "SUPER ADMINISTRATEUR"].includes(label)) return "admin"
  if (label === "EDITOR") return "editor"
  // Les anciennes sessions administrateur peuvent ne contenir aucun rôle.
  return user && !label && !user.role?.id && user.status !== "AG" ? "admin" : null
}
