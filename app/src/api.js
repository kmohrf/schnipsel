import Vue from 'vue'

const {sessionStorage: webStorage} = window

function bindStorage (prop) {
  return {
    get () {
      return JSON.parse(webStorage.getItem(prop))
    },
    set (value) {
      webStorage.setItem(prop, JSON.stringify(value))
    }
  }
}

const credentials = Object.defineProperties({
  clear () {
    this.set({email: null, password: null})
  },
  set ({email, password}) {
    this.email = email
    this.password = password
  }
}, {
  email: bindStorage('email'),
  password: bindStorage('password')
})

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
    if (credentials.email && !userData.user) {
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
  if (credentials.email) {
    init.headers.set('Authorization', `Basic ${btoa(`${credentials.email}:${credentials.password}`)}`)
  }
  init.headers.set('Accept', 'application/json')
  init.headers.set('Content-Type', 'application/json')
  return window.fetch(resource, init)
}

export async function shouldLogin () {
  if (!credentials.email) return true
  return (await fetch('/api/users')).status !== 200
}

export async function login (email, password) {
  await logout()
  credentials.set({email, password})
  if (await shouldLogin()) {
    credentials.clear()
    return false
  } else {
    await setUserData()
    return true
  }
}

export async function logout () {
  credentials.clear()
  userData.user = null
  userData.boards = []
}

async function setUserData () {
  userData.user = await fetch('/api/users/me').then(res => res.json())
  userData.boards = await getBoards({onlyPrivate: true})
}

export async function register (data) {
  credentials.clear()
  const {email, password} = data
  const res = await fetch('/api/users', {
    method: 'post',
    body: JSON.stringify(data)
  })
  const userDataOrErrors = await res.json()
  if (res.status === 201) {
    credentials.set({email, password})
    await setUserData()
    return true
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
