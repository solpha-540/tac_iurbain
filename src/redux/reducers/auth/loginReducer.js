import { getUrbainProfile, getUrbainToken } from "../../../services/auth/tokenStorage"
import { getUrbainRole } from "../../../services/auth/roles"

const initialState = () => {
  if (!getUrbainToken()) return { userRole: null }
  const { user, agent, agency } = getUrbainProfile()
  return {
    userRole: getUrbainRole(user, agent),
    values: { loggedInUser: user, agent, agency, loggedInWith: "urbain" }
  }
}

export const login = (state = initialState(), action) => {
  switch (action.type) {
    case "LOGIN_WITH_EMAIL": {
      return { ...state, values: action.payload }
    }
    case "LOGIN_WITH_FB": {
      return { ...state, values: action.payload }
    }
    case "LOGIN_WITH_TWITTER": {
      return { ...state, values: action.payload }
    }
    case "LOGIN_WITH_GOOGLE": {
      return { ...state, values: action.payload }
    }
    case "LOGIN_WITH_GITHUB": {
      return { ...state, values: action.payload }
    }
    case "LOGIN_WITH_JWT": {
      return {
        ...state,
        userRole: getUrbainRole(action.payload.loggedInUser, action.payload.agent),
        values: action.payload,
        error: null,
        loading: false
      }
    }
    case "LOGIN_REQUEST": {
      return { ...state, userRole: null, values: null, error: null, loading: true }
    }
    case "LOGIN_FAILURE": {
      return { ...state, error: action.payload.message, loading: false }
    }
    case "LOGOUT_WITH_JWT": {
      return { ...state, userRole: null, values: action.payload, error: null, loading: false }
    }
    case "LOGOUT_WITH_FIREBASE": {
      return { ...state, values: action.payload }
    }
    case "CHANGE_ROLE": {
      return { ...state, userRole: action.userRole }
    }
    default: {
      return state
    }
  }
}
