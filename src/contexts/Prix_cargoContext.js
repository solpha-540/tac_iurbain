import React, { createContext, useCallback, useContext, useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { getPrixCargos, createPrixCargo } from "../components/Api/Prix_cargoService"
import { getLignesPrincipales, getLignesSecondaires } from "../components/Api/Prix_ligneService"

const PrixCargoContext = createContext(null)

const errorMessage = (error, fallback) =>
  (error.response && error.response.data && error.response.data.message) ||
  error.message ||
  fallback

export const PrixCargoProvider = ({ children }) => {
  const [prixCargos, setPrixCargos] = useState([])
  const agency = useSelector(state => state.auth.login.values?.agency)
  const [lignesPrincipales, setLignesPrincipales] = useState([])
  const [lignesSecondaires, setLignesSecondaires] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError("")

    try {
      const [prices, mainLines, secondaryLines] = await Promise.all([
        getPrixCargos(),
        getLignesPrincipales(),
        getLignesSecondaires(),
      ])
      setPrixCargos(prices)
      setLignesPrincipales(mainLines)
      setLignesSecondaires(secondaryLines)
    } catch (requestError) {
      setError(errorMessage(requestError, "Impossible de charger les prix cargo."))
    } finally {
      setLoading(false)
    }
  }, [])

  const addPrixCargo = useCallback(async data => {
    setSaving(true)
    setError("")
    try {
      const result = await createPrixCargo(data)
      await fetchData()
      return result
    } catch (requestError) {
      setError(errorMessage(requestError, "Impossible de créer le prix cargo."))
      throw requestError
    } finally {
      setSaving(false)
    }
  }, [fetchData])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const value = {
    prixCargos,
    agency,
    lignesPrincipales,
    lignesSecondaires,
    loading,
    saving,
    error,
    fetchData,
    clearError: () => setError(""),
    addPrixCargo,
  }

  return <PrixCargoContext.Provider value={value}>{children}</PrixCargoContext.Provider>
}

export const usePrixCargos = () => {
  const context = useContext(PrixCargoContext)
  if (!context) {
    throw new Error("usePrixCargos doit être utilisé dans PrixCargoProvider.")
  }
  return context
}