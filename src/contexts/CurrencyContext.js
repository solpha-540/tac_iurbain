import React, { createContext, useCallback, useContext, useEffect, useState } from "react"
import { createCurrency as createCurrencyRequest, deleteCurrency as deleteCurrencyRequest, getCurrencies, updateCurrency as updateCurrencyRequest } from "../components/Api/CurrencyService"

const CurrencyContext = createContext(null)

export const CurrencyProvider = ({ children }) => {
  const [currencies, setCurrencies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState("")
  const [updating, setUpdating] = useState(false)
  const [updateError, setUpdateError] = useState("")
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState("")

  const fetchCurrencies = useCallback(async () => {
    setLoading(true)
    setError("")
    try { setCurrencies(await getCurrencies()) } catch (requestError) {
      const responseData = requestError.response && requestError.response.data
      setError((responseData && responseData.message) || requestError.message || "Impossible de récupérer les devises.")
      setCurrencies([])
    } finally { setLoading(false) }
  }, [])
  const createCurrency = useCallback(async currency => {
    setCreating(true); setCreateError("")
    try { const result = await createCurrencyRequest(currency); await fetchCurrencies(); return result } catch (requestError) {
      const responseData = requestError.response && requestError.response.data
      setCreateError((responseData && responseData.message) || requestError.message || "Impossible de créer la devise.")
      throw requestError
    } finally { setCreating(false) }
  }, [fetchCurrencies])
  const updateCurrency = useCallback(async (id, currency) => {
    setUpdating(true); setUpdateError("")
    try { const result = await updateCurrencyRequest(id, currency); await fetchCurrencies(); return result } catch (requestError) {
      const responseData = requestError.response && requestError.response.data
      setUpdateError((responseData && responseData.message) || requestError.message || "Impossible de modifier la devise.")
      throw requestError
    } finally { setUpdating(false) }
  }, [fetchCurrencies])
  const deleteCurrency = useCallback(async id => {
    setDeleting(true); setDeleteError("")
    try { const result = await deleteCurrencyRequest(id); await fetchCurrencies(); return result } catch (requestError) {
      const responseData = requestError.response && requestError.response.data
      setDeleteError((responseData && responseData.message) || requestError.message || "Impossible de supprimer la devise.")
      throw requestError
    } finally { setDeleting(false) }
  }, [fetchCurrencies])

  useEffect(() => { fetchCurrencies() }, [fetchCurrencies])

  return <CurrencyContext.Provider value={{ currencies, loading, error, fetchCurrencies, createCurrency, creating, createError, clearCreateError: () => setCreateError(""), updateCurrency, updating, updateError, clearUpdateError: () => setUpdateError(""), deleteCurrency, deleting, deleteError, clearDeleteError: () => setDeleteError("") }}>{children}</CurrencyContext.Provider>
}

export const useCurrencies = () => {
  const context = useContext(CurrencyContext)
  if (!context) throw new Error("useCurrencies doit être utilisé dans CurrencyProvider.")
  return context
}
