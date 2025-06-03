/**
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
*/
/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-ignore

const loggedIn = ref(false)
export async function logout() {
  if (!loggedIn.value) return
  const { error } = await useApiPOST('/auth/logout')
  if (error?.response.data.message === 'Unauthorized') {
    loggedIn.value = false
    storeAuth().logout()
    storeAuth().clearSession()
  } else if (error !== undefined && error !== null) {
    console.log('error', error.response.data.message)
  } else {
    loggedIn.value = false
    console.log('logged out')
    // TODO wsDisconnect()
    storeAuth().logout()
    storeAuth().clearSession()
    // authStore.setExpiresInterval(undefined)
  }
}

// async function login({ app, story, variant }) {
export async function loginlogout({ app }: any) {
  if (loggedIn.value) return
  console.log('APP INSTANCE', app)
  const _unmount = app.unmount
  app.unmount = async () => {
    await logout()
    _unmount()
  }
  // console.log('ENV', process.env)
  // console.log('ENV', process.env.OPSI_ADMIN_PASSWORD)
  // const publicEnvVar = import.meta.env;
  // console.log('ENV2', publicEnvVar)
  // console.log('ENV2', publicEnvVar.OPSI_ADMIN_PASSWORD)
  const User = new FormData()
  User.append('username', 'adminuser')
  User.append('password', 'adminuser')
  const { data, error } = await useApiPOST<{ result: string }>('/auth/login', User)
  if (error !== undefined && error !== null) {
    console.error('error', error)
  } else if (data?.value?.result == 'Login success') {
    loggedIn.value = true
    console.log('login successful')
    storeAuth().login('adminuser')
    storeAuth().setSession()
  }
}
