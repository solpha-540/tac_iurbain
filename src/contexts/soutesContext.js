import React, { createContext, useCallback, useContext, useEffect, useState } from "react"
import { createSoute, getSoutes } from "../components/Api/soutesService"

const SoutesContext = createContext(null)
const messageFor = error => error.response?.data?.message || error.message

export const SoutesProvider = ({ idBus, children }) => {
  const [soutes, setSoutes] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [saveError, setSaveError] = useState("")

  const load = useCallback(async signal => {
    setLoading(true)
    setError("")
    try {
      const rows = await getSoutes(idBus, { signal })
      if (!signal?.aborted) setSoutes(rows)
    } catch (error) {
      if (!signal?.aborted) setError(messageFor(error))
    } finally {
      if (!signal?.aborted) setLoading(false)
    }
  }, [idBus])

  useEffect(() => {
    const controller = new AbortController()
    load(controller.signal)
    return () => controller.abort()
  }, [load])

  const addSoute = async fields => {
    setSaving(true)
    setSaveError("")
    try {
      const created = await createSoute({ ...fields, id_bus: idBus })
      setSoutes(rows => [...rows.filter(row => row.id !== created.id), created])
      return created
    } catch (error) {
      setSaveError(messageFor(error))
      return null
    } finally {
      setSaving(false)
    }
  }

  return (
    <SoutesContext.Provider value={{ soutes, loading, saving, error, saveError, load, addSoute }}>
      {children}
    </SoutesContext.Provider>
  )
}

export const useSoutes = () => {
  const context = useContext(SoutesContext)
  if (!context) throw new Error("useSoutes doit être utilisé dans SoutesProvider.")
  return context
}
