export const STORAGE_KEYS = Object.freeze({
  token: "token",
  refreshToken: "refreshToken",
  userId: "id_user_created",
  nom: "nom",
  prenom: "prenom",
  role: "role"
})

const getStorage = () => {
  if (typeof window === "undefined") {
    return null
  }

  return window.localStorage
}

const setItem = (key, value) => {
  const storage = getStorage()

  if (!storage || value === undefined || value === null) {
    return
  }

  storage.setItem(key, String(value))
}

const getItem = key => {
  const storage = getStorage()
  return storage ? storage.getItem(key) : null
}

const removeItem = key => {
  const storage = getStorage()

  if (storage) {
    storage.removeItem(key)
  }
}

export const setToken = token => setItem(STORAGE_KEYS.token, token)
export const getToken = () => getItem(STORAGE_KEYS.token)
export const removeToken = () => removeItem(STORAGE_KEYS.token)

export const setRefreshToken = refreshToken =>
  setItem(STORAGE_KEYS.refreshToken, refreshToken)
export const getRefreshToken = () => getItem(STORAGE_KEYS.refreshToken)
export const removeRefreshToken = () => removeItem(STORAGE_KEYS.refreshToken)

export const setUserId = userId => setItem(STORAGE_KEYS.userId, userId)
export const getUserId = () => getItem(STORAGE_KEYS.userId)
export const removeUserId = () => removeItem(STORAGE_KEYS.userId)

export const setNom = nom => setItem(STORAGE_KEYS.nom, nom)
export const getNom = () => getItem(STORAGE_KEYS.nom)
export const removeNom = () => removeItem(STORAGE_KEYS.nom)

export const setPrenom = prenom => setItem(STORAGE_KEYS.prenom, prenom)
export const getPrenom = () => getItem(STORAGE_KEYS.prenom)
export const removePrenom = () => removeItem(STORAGE_KEYS.prenom)

export const setRole = role => setItem(STORAGE_KEYS.role, role)
export const getRole = () => getItem(STORAGE_KEYS.role)
export const removeRole = () => removeItem(STORAGE_KEYS.role)

export const clearUserStorage = () => {
  Object.keys(STORAGE_KEYS).forEach(key => removeItem(STORAGE_KEYS[key]))
}
