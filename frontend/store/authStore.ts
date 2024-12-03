import { useCookie } from 'nuxt/app'
import { defineStore } from 'pinia'

const expirySec = 60 * 30 // Default=30min

export const storeAuth = defineStore('auth', {
  persist: {
    key: 'opsi-auth',
    storage: localStorage,
    // storage: sessionStorage,
  },
  state: () => ({
    // the state objects are stored in localStorage
    username: '',
    sessionExpiry: expirySec, // sec
    sessionEndTime: '',
  }),
  getters: {
    // sessionEndTime: ({ _sessionendTime }) => _sessionendTime,
    // sessionExpiry: ({ _sessionexpiry }) => _sessionexpiry,
    // username: ({ _username }) => _username,
    isAuthenticated: ({ username }) =>
      Boolean(useCookie('opsiconfd-session') && username),
  },
  actions: {
    $reset() {
      this.username = ''
      this.sessionEndTime = ''
    },
    login(_username: string) {
      this.username = _username
      // localStorage.setItem('_username', _username)
    },
    logout() {
      this.$reset()
      storeMBus().$reset()
      storeTablesettings().$reset()

      // localStorage.removeItem('_username')
      // localStorage.removeItem('tablesettings')
      // localStorage.removeItem('data-cache')
      // storeTablesettings().$hydrate()
      this.username = ''
    },
    setUser(username: string) {
      this.username = username
    },
    setExpiredMin(m: number) {
      this.sessionExpiry = m
    },
    setSession() {
      let expiryInSec = this.sessionExpiry
      if (!expiryInSec) {
        expiryInSec = this.sessionExpiry
      }
      if (!expiryInSec) {
        expiryInSec = expirySec
      }

      const expiryTime = new Date(new Date().getTime() + expiryInSec * 1000)
      this.sessionEndTime = expiryTime as unknown as string
    },
    clearSession() {
      this.sessionEndTime = ''
      this.username = ''
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(storeAuth, import.meta.hot))
}
// export const storeAuth = defineStore('auth', () => {
//   // need to return the states / getters/ actions in the end of the setup
//   // states
//   let _username: string = localStorage.getItem('_username') as string
//   let _sessionexpiry: number = expirySec // sec
//   let _sessionendTime: string = ''

//   // getter
//   const sessionEndTime = computed(() => _sessionendTime)
//   const sessionExpiry = computed(() => { return _sessionexpiry })
//   const _username = computed(() => { return _username })
//   const isAuthenticated = computed(() => { return Boolean(useCookie('opsiconfd-session') && localStorage.getItem('_username')) })

//   // actions
//   function login (_username: string) {
//     _username = _username
//     localStorage.setItem('_username', _username)
//   }
//   function logout () {
//     localStorage.removeItem('_username')
//     _username = ''
//   }

//   function setExpiredMin (m: number) {
//     _sessionexpiry = m
//   }

//   function setSession () {
//     let expiryInSec = _sessionexpiry
//     if (!expiryInSec) { expiryInSec = sessionExpiry.value }
//     if (!expiryInSec) { expiryInSec = expirySec }

//     const expiryTime = new Date(new Date().getTime() + (expiryInSec * 1000))
//     _sessionendTime = expiryTime as unknown as string
//   }

//   function clearSession () {
//     _sessionendTime = ''
//   }

//   return {
//     /* states */
//     /* getters */ sessionEndTime, sessionExpiry, _username, isAuthenticated
//     /* actions */, login, logout, setExpiredMin, setSession, clearSession
//   }
// }, { persist: true } as any)
