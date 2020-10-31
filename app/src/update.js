import Vue from 'vue'

const UPDATE_EVENT = 'update-available'

const application = new Vue({
  data: {
    registration: null,
    isUpdateInProgress: false
  },
  watch: {
    registration (reg) {
      this.$emit(UPDATE_EVENT, Boolean(reg))
    }
  }
})

export const appUpdateMixin = {
  computed: {
    isAppUpdateAvailable () {
      return Boolean(application.registration)
    },
    isAppUpdateInProgress () {
      return application.isUpdateInProgress
    }
  },
  methods: {
    async updateApp() {
      if (await performAppUpdate()) {
        window.location.reload(true)
      }
    }
  }
}

export function setRegistration (reg) {
  application.registration = reg
}

export async function performAppUpdate () {
  function update () {
    if (!application.registration || !application.registration.waiting) {
      return Promise.reject()
    }

    const worker = application.registration.waiting
    const channel = new MessageChannel()
    return new Promise((resolve, reject) => {
      channel.port1.onmessage = event => {
        if (event.data.error) {
          reject(event.data.error)
        } else {
          resolve(event.data)
        }
      }

      worker.postMessage({ type: 'skip-waiting' }, [channel.port2])
    })
  }

  try {
    application.isUpdateInProgress = true
    await update()
    return true
  } catch (err) {
    return false
  } finally {
    application.registration = null
    application.isUpdateInProgress = false
  }
}
