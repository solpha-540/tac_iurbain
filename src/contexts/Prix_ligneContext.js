import React, { createContext, useCallback, useContext, useEffect, useState } from "react"
import { getAgences } from "../components/Api/AgenceService"
import {
  createPrixLigne,
  deletePrixLigne,
  getLignesPrincipales,
  getLignesSecondaires,
  getPrixLignes,
  updatePrixLigne,
} from "../components/Api/LigneService"

const PrixLigneContext = createContext(null)

const errorMessage = (error, fallback) =>
  (error.response && error.response.data && error.response.data.message) ||
  error.message ||
  fallback

export const PrixLigneProvider = ({ children }) => {
  const [prixLignes, setPrixLignes] = useState([])
  const [lignesPrincipales, setLignesPrincipales] = useState([])
  const [lignesSecondaires, setLignesSecondaires] = useState([])
  const [agences, setAgences] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError("")

    try {
      const [prix, principales, secondaires, agencyList] = await Promise.all([
        getPrixLignes(),
        getLignesPrincipales(),
        getLignesSecondaires(),
        getAgences(),
      ])

      setPrixLignes(prix)
      setLignesPrincipales(principales)
      setLignesSecondaires(secondaires)
      setAgences(agencyList)
    } catch (requestError) {
      setError(errorMessage(requestError, "Impossible de charger la tarification."))
    } finally {
      setLoading(false)
    }
  }, [])

  const action = useCallback(
    async (request, fallback) => {
      setSaving(true)
      setError("")

      try {
        const result = await request()
        await fetchData()
        return result
      } catch (requestError) {
        setError(errorMessage(requestError, fallback))
        throw requestError
      } finally {
        setSaving(false)
      }
    },
    [fetchData],
  )

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const value = {
    prixLignes,
    lignesPrincipales,
    lignesSecondaires,
    agences,
    loading,
    loadingPrixLignes: loading,
    saving,
    error,
    errorPrixLignes: error,
    clearError: () => setError(""),
    fetchData,
    refreshPrixLignes: fetchData,
    createPrixLigne: data => action(() => createPrixLigne(data), "Impossible de créer le tarif."),
    updatePrixLigne: (id, data) => action(() => updatePrixLigne(id, data), "Impossible de modifier le tarif."),
    deletePrixLigne: id => action(() => deletePrixLigne(id), "Impossible de supprimer le tarif."),
  }

  return <PrixLigneContext.Provider value={value}>{children}</PrixLigneContext.Provider>
}

export const usePrixLignes = () => {
  const context = useContext(PrixLigneContext)

  if (!context) {
    throw new Error("usePrixLignes doit être utilisé dans PrixLigneProvider.")
  }

  return context
}
