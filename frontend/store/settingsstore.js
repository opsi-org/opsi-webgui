// import { defineStore } from 'pinia'

export const useSettingsStore = defineStore('settings', {
  persist: true,
  state: () => ({
    theme: 'light',
  }),
  getters: {
    isLight() { return this.theme === 'light' }
  },
  actions: {
    changeTheme(t) {
      // `this` is the store instance
      this.theme = t
    },
  },
})


if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useMainStore, import.meta.hot));
}