import mock from "../mock"

let users = [
  {
    id: 1,
    email: "demo@demo.com",
    password: "demodemo",
    name: "Demo"
  },
  {
    id: 2,
    email: "admin@admin.com",
    password: "adminadmin",
    name: "Admin"
  },
  {
    id: 3,
    email: "staff@staff.com",
    password: "staff",
    name: "Staff"
  }
]

const jwtConfig = {
  "secret"   : "dd5f3089-40c3-403d-af14-d0c228b05cb4",
  "expireTime": 8000
}

// This module runs in the browser as an Axios mock. A server-only JWT library
// such as jsonwebtoken relies on Node APIs, so use a lightweight mock token.
const createAccessToken = id => {
  const payload = { id, exp: Math.floor(Date.now() / 1000) + jwtConfig.expireTime }
  return `mock.${btoa(JSON.stringify(payload))}.token`
}

const readAccessToken = accessToken => {
  const [, encodedPayload] = accessToken.split(".")
  const payload = JSON.parse(atob(encodedPayload))

  if (!payload.id || payload.exp < Math.floor(Date.now() / 1000)) {
    throw new Error("Invalid access token")
  }

  return payload
}

// POST: Check User Login Details and return user
mock.onPost("/api/authenticate/login/user").reply( request => {

  let { email, password } = JSON.parse(request.data)
  let error = "Something went wrong"

  const user = users.find(user => user.email === email && user.password === password)

  if (user) {

    try {

      const accessToken = createAccessToken(user.id)

      const userData = Object.assign({}, user, {loggedInWith: "jwt"})

      delete userData.password

      const response = {
        user : userData,
        accessToken: accessToken
      }

      return [200, response]

    } catch(e) {
      error = e
    }
  }else {
    error = "Email Or Password Invalid"
  }

  return [200, {error}]
})

mock.onPost("/api/authenticate/register/user").reply( request => {
  if(request.data.length > 0){

    let { email, password, name } = JSON.parse(request.data)
    const isEmailAlreadyInUse = users.find((user) => user.email === email)
    const error = {
      email      : isEmailAlreadyInUse ? 'This email is already in use.' : null,
      name: name === '' ? 'Please enter your name.' : null
    }

    if ( !error.name && !error.email ) {

      let userData = {
        email: email,
        password: password,
        name: name
      }

      // Add user id
      const length = users.length
      let lastIndex = 0
      if(length){
        lastIndex = users[length - 1].id
      }
      userData.id = lastIndex + 1

      users.push(userData)

      const accessToken = createAccessToken(userData.id)

      let user = Object.assign({}, userData)
      delete user['password']
      const response = { user: user, accessToken: accessToken }

      return [200, response]
    } else {
      return [200, {error}]
    }

  }

})

mock.onPost('/api/authenticate/refresh-token').reply((request) => {

  const {accessToken} = JSON.parse(request.data)

  try {
    const {id} = readAccessToken(accessToken)

    let userData = Object.assign({}, users.find(user => user.id === id))

    const newAccessToken = createAccessToken(userData.id)

    delete userData['password']
    const response = {
      userData: userData,
      accessToken: newAccessToken
    }

    return [200, response]
  } catch (e){
    const error = "Invalid access token"
    return [401, {error}]
  }
})
