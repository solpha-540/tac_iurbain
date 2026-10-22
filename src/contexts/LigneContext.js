import React, { createContext, useCallback, useContext, useEffect, useState } from "react"
import * as service from "../components/Api/LigneService"

const LigneContext = createContext(null)
const message = (error, fallback) => (error.response && error.response.data && error.response.data.message) || error.message || fallback

export const LigneProvider = ({ children }) => {
  const [lignesPrincipales, setLignesPrincipales] = useState([])
  const [lignesSecondaires, setLignesSecondaires] = useState([])
  const [villes, setVilles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)
  const [actionError, setActionError] = useState("")
  const fetchData = useCallback(async () => { setLoading(true); setError(""); try { const [principales, secondaires, villeList] = await Promise.all([service.getLignesPrincipales(), service.getLignesSecondaires(), service.getVilles()]); setLignesPrincipales(principales); setLignesSecondaires(secondaires); setVilles(villeList) } catch (e) { setError(message(e, "Impossible de charger les lignes.")) } finally { setLoading(false) } }, [])
  const execute = useCallback(async (operation, fallback) => { setSaving(true); setActionError(""); try { const result = await operation(); await fetchData(); return result } catch (e) { const text = message(e, fallback); setActionError(text); throw e } finally { setSaving(false) } }, [fetchData])
  useEffect(() => { fetchData() }, [fetchData])
  return <LigneContext.Provider value={{ lignesPrincipales, lignesSecondaires, villes, loading, error, saving, actionError, clearActionError: () => setActionError(""), fetchData, createLignePrincipale: data => execute(() => service.createLignePrincipale(data), "Impossible de créer la ligne principale."), updateLignePrincipale: (id, data) => execute(() => service.updateLignePrincipale(id, data), "Impossible de modifier la ligne principale."), deleteLignePrincipale: id => execute(() => service.deleteLignePrincipale(id), "Impossible de supprimer la ligne principale. Cette ligne possède peut-être des lignes secondaires."), createLigneSecondaire: data => execute(() => service.createLigneSecondaire(data), "Impossible de créer la ligne secondaire."), updateLigneSecondaire: (id, data) => execute(() => service.updateLigneSecondaire(id, data), "Impossible de modifier la ligne secondaire."), deleteLigneSecondaire: id => execute(() => service.deleteLigneSecondaire(id), "Impossible de supprimer la ligne secondaire.") }}>{children}</LigneContext.Provider>
}
export const useLignes = () => { const context = useContext(LigneContext); if (!context) throw new Error("useLignes doit être utilisé dans LigneProvider."); return context }
