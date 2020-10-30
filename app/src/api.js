import Vue from 'vue'

function getCookie (name) {
  if (document.cookie && document.cookie !== '') {
    const cookie = document.cookie.split(';')
      .map(cookie => cookie.trim())
      .find(cookie => cookie.substring(0, name.length + 1) === (name + '='))
    return cookie ? decodeURIComponent(cookie.substring(name.length + 1)) : null
  }
  return null
}

class APIError extends Error {
  constructor (message, errors) {
    super(message)
    this.errors = errors
  }
}

export const userData = Vue.observable({
  user: null,
  boards: []
})

export const userMixin = {
  computed: {
    user () {
      return userData.user
    },
    isLoggedIn () {
      return Boolean(userData.user)
    }
  },
  async created () {
    if (!(await shouldLogin()) && !userData.user) {
      await setUserData()
    }
  }
}

export const userBoardsMixin = {
  computed: {
    boards () {
      return userData.boards
    }
  }
}

function fetch (resource, init = null) {
  init = init || {}
  if (!init.headers) {
    init.headers = new Headers()
  } else {
    if (typeof init.headers.set === 'undefined') {
      init.headers = new Headers(init.headers)
    }
  }
  if (init && init.method && ['PUT', 'PATCH', 'POST', 'DELETE'].includes(init.method.toUpperCase())) {
    init.headers.set('X-CSRFToken', getCookie('csrftoken'))
  }
  init.headers.set('Accept', 'application/json')
  init.headers.set('Content-Type', 'application/json')
  return window.fetch(resource, init)
}

export async function shouldLogin () {
  return (await fetch('/api/users/login')).status === 403
}

async function getLoginInfo () {
  return await fetch('/api/users/login').then(res => res.json())
}

export async function login (email, password) {
  // logout any existing sessions
  await logout()
  // fetch the login endpoint we use for authentication
  const {login_endpoint: loginEndpoint} = await getLoginInfo()
  // fetch the login page, so it sets csrf cookies
  await window.fetch(loginEndpoint)

  // authenticate us
  const body = new window.FormData()
  body.append('username', email)
  body.append('password', password)
  body.append('csrfmiddlewaretoken', getCookie('csrftoken'))
  const res = await window.fetch(loginEndpoint, {method: 'post', body})

  // successful logins are followed by a redirect
  if (res.redirected && res.status === 200) {
    await setUserData()
    return true
  } else {
    // this is helpful for debugging, as it will load the actual
    // request content in devtools
    await res.text()
    return false
  }
}

export async function logout () {
  const wasSuccessFul = (await fetch('/api/users/logout', {method: 'post'})).status === 200
  if (wasSuccessFul) {
    userData.user = null
    userData.boards = []
  }
  return wasSuccessFul
}

async function setUserData () {
  userData.user = await fetch('/api/users/me').then(res => res.json())
  userData.boards = await getBoards({onlyPrivate: true})
}

export async function register (data) {
  // logout any existing sessions
  await logout()
  // fetch the login endpoint we use for authentication
  const {login_endpoint: loginEndpoint} = await getLoginInfo()
  // fetch the login page, so it sets csrf cookies
  await window.fetch(loginEndpoint)

  // create account
  const res = await fetch('/api/users', {
    method: 'post',
    body: JSON.stringify(data)
  })
  const userDataOrErrors = await res.json()

  if (res.status === 201) {
    return await login(data.email, data.password)
  } else {
    throw new APIError(res.statusText, userDataOrErrors)
  }
}

export async function getBoards ({onlyPrivate = null}) {
  const query = []
  if (onlyPrivate !== null) {
    query.push(`is_private=${onlyPrivate ? 1 : 0}`)
  }
  return await fetch(`/api/boards?${query.join('&')}`).then(res => res.json())
}

export async function getBoard (board) {
  const res = await fetch(`/api/boards/${board}`)
  const boardOrErrors = await res.json()
  if (res.status === 200) {
    return boardOrErrors
  } else {
    throw new APIError(res.statusText, boardOrErrors)
  }
}

export async function updateBoard (pk, data) {
  const res = await fetch(`/api/boards/${pk}`, {
    method: 'put',
    body: JSON.stringify(data)
  })
  const boardDataOrErrors = await res.json()
  if (res.status === 200) {
    return boardDataOrErrors
  } else {
    throw new APIError(res.statusText, boardDataOrErrors)
  }
}

export async function createBoard (data) {
  const res = await fetch(`/api/boards`, {
    method: 'post',
    body: JSON.stringify(data)
  })
  const boardDataOrErrors = await res.json()
  if (res.status === 201) {
    return boardDataOrErrors
  } else {
    throw new APIError(res.statusText, boardDataOrErrors)
  }
}

export async function getNotes (board) {
  const query = [
    `board=${board}`
  ]
  return fetch(`/api/notes?${query.join('&')}`).then(res => res.json())
}

export async function createNote (data) {
  const res = await fetch(`/api/notes`, {
    method: 'post',
    body: JSON.stringify(data)
  })
  const noteOrErrors = await res.json()
  if (res.status === 201) {
    return noteOrErrors
  } else {
    throw new APIError(res.statusText, noteOrErrors)
  }
}

export async function deleteNote (pk) {
  const res = await fetch(`/api/notes/${pk}`, {
    method: 'delete'
  })
  if (res.status !== 204) {
    throw new APIError(res.statusText, await res.json())
  }
}

export async function updateNote (pk, data) {
  const res = await fetch(`/api/notes/${pk}`, {
    method: 'put',
    body: JSON.stringify(data)
  })
  const noteOrErrors = await res.json()
  if (res.status === 200) {
    return noteOrErrors
  } else {
    throw new APIError(res.statusText, noteOrErrors)
  }
}

export async function getUsers ({email = null}) {
  const query = []
  if (email !== null) {
    query.push(`email=${encodeURIComponent(email)}`)
  }
  return await fetch(`/api/users?${query.join('&')}`).then(res => res.json())
}

export const getUser = (() => {
  const cache = new Map()

  return async function (url) {
    if (cache.has(url)) {
      return cache.get(url)
    } else {
      const user = await fetch(url).then(res => res.json())
      cache.set(url, user)
      return user
    }
  }
})()

export async function updateUser (pk, data) {
  const res = await fetch(`/api/users/${pk}`, {
    method: 'put',
    body: JSON.stringify(data)
  })
  const userDataOrErrors = await res.json()
  if (res.status === 200) {
    if (userData.user.pk === pk) {
      userData.user = userDataOrErrors
    }
    return userDataOrErrors
  } else {
    throw new APIError(res.statusText, userDataOrErrors)
  }
}

export const getSettings = (() => {
  let settings = null

  return async function () {
    if (settings === null) {
      const res = await fetch('/api/settings')
      const settingsOrErrors = await res.json()
      if (res.status !== 200) {
        throw new APIError(res.statusText, settingsOrErrors)
      } else {
        settings = settingsOrErrors
      }
    }
    return settings
  }
})()
