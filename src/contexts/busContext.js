import React, { createContext, useCallback, useContext, useEffect, useState } from "react"
import { getBuses } from "../components/Api/busService"

const BusContext = createContext(null)

const getErrorMessage = error =>
  (error.response && error.response.data && error.response.data.message) ||
  error.message ||
  "Impossible de récupérer les bus."

export const BusProvider = ({ children }) => {
  const [buses, setBuses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const fetchBuses = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      setBuses(await getBuses())
    } catch (requestError) {
      setBuses([])
      setError(getErrorMessage(requestError))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchBuses() }, [fetchBuses])

  return <BusContext.Provider value={{ buses, loading, error, fetchBuses }}>{children}</BusContext.Provider>
}

export const useBuses = () => {
  const context = useContext(BusContext)
  if (!context) throw new Error("useBuses doit être utilisé dans BusProvider.")
  return context
}
