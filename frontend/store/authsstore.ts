import { useCookie } from 'nuxt/app'
import { defineStore } from 'pinia'
import { computed } from 'vue'
const expirySec = 60 * 30 // Default=30min

export const storeAuth = defineStore('auth', () => {
  // need to return the states / getters/ actions in the end of the setup
  // states
  let _myusername: string = localStorage.getItem('username') as string
  let _sessionexpiry: number = expirySec // sec
  let _sessionendTime: string = ''

  // getter
  const sessionEndTime = computed(() => _sessionendTime)
  const sessionExpiry = computed(() => { return _sessionexpiry })
  const username = computed(() => { return _myusername })
  const isAuthenticated = computed(() => { return Boolean(useCookie('opsiconfd-session') && localStorage.getItem('username')) })

  // actions
  function login (username: string) {
    _myusername = username
    localStorage.setItem('username', username)
  }
  function logout () {
    localStorage.removeItem('username')
    _myusername = ''
  }

  function setExpiredMin (m: number) {
    _sessionexpiry = m
  }

  function setSession () {
    let expiryInSec = _sessionexpiry
    if (!expiryInSec) { expiryInSec = sessionExpiry.value }
    if (!expiryInSec) { expiryInSec = expirySec }

    const expiryTime = new Date(new Date().getTime() + (expiryInSec * 1000))
    _sessionendTime = expiryTime as unknown as string
  }

  function clearSession () {
    _sessionendTime = ''
  }

  return {
    /* states */
    /* getters */ sessionEndTime, sessionExpiry, username, isAuthenticated
    /* actions */, login, logout, setExpiredMin, setSession, clearSession
  }
}, { persist: true } as any)
