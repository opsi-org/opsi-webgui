import { useCookie } from 'nuxt/app'
import { defineStore } from 'pinia'
import { computed } from 'vue'
const expirySec = 60 * 30 // Default=30min



export const storeAuth = defineStore('auth', {
  persist: true,
  state: () => ({
    _myusername: localStorage.getItem('username') as string,
    _sessionexpiry: expirySec, // sec
    _sessionendTime: '',
  }),
  getters: {
    sessionEndTime: ({ _sessionendTime }) => _sessionendTime,
    sessionExpiry: ({ _sessionexpiry }) => _sessionexpiry,
    username: ({ _myusername }) => _myusername,
    isAuthenticated: ({ _myusername }) => Boolean(useCookie('opsiconfd-session') && _myusername),
  },
  actions: {
    login (username: string) {
      this._myusername = username
      localStorage.setItem('username', username)
    },
    logout () {
      localStorage.removeItem('username')
      this._myusername = ''
    },
    setExpiredMin (m: number) {
      this._sessionexpiry = m
    },
    setSession () {
      let expiryInSec = this._sessionexpiry
      if (!expiryInSec) { expiryInSec = this.sessionExpiry }
      if (!expiryInSec) { expiryInSec = expirySec }

      const expiryTime = new Date(new Date().getTime() + (expiryInSec * 1000))
      this._sessionendTime = expiryTime as unknown as string
    },
    clearSession () {
      this._sessionendTime = ''
    },
  },
})


if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(storeAuth, import.meta.hot));
}
// export const storeAuth = defineStore('auth', () => {
//   // need to return the states / getters/ actions in the end of the setup
//   // states
//   let _myusername: string = localStorage.getItem('username') as string
//   let _sessionexpiry: number = expirySec // sec
//   let _sessionendTime: string = ''

//   // getter
//   const sessionEndTime = computed(() => _sessionendTime)
//   const sessionExpiry = computed(() => { return _sessionexpiry })
//   const username = computed(() => { return _myusername })
//   const isAuthenticated = computed(() => { return Boolean(useCookie('opsiconfd-session') && localStorage.getItem('username')) })

//   // actions
//   function login (username: string) {
//     _myusername = username
//     localStorage.setItem('username', username)
//   }
//   function logout () {
//     localStorage.removeItem('username')
//     _myusername = ''
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
//     /* getters */ sessionEndTime, sessionExpiry, username, isAuthenticated
//     /* actions */, login, logout, setExpiredMin, setSession, clearSession
//   }
// }, { persist: true } as any)
