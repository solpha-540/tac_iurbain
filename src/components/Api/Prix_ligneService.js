// Les appels de tarification sont centralisés avec ceux des lignes.
// Ce fichier est conservé comme point de compatibilité pour les imports existants.
export {
  getLignesPrincipales,
  getLignesSecondaires,
  getPrixLignes,
  createPrixLigne,
  updatePrixLigne,
  deletePrixLigne,
} from "./LigneService"
