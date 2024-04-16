export const storeCache = defineStore('data-cache', {
  persist: {
    key: 'opsi-data',
    storage: localStorage,
    // storage: sessionStorage,
  },
  state: () => ({
    myopsiconfigserver: '',
  }),
  getters: {
    opsiconfigserver: ({ myopsiconfigserver }) => myopsiconfigserver
  },
  actions: {
    setOpsiconfigserver(s: string) { // `this` is the store instance
      this.myopsiconfigserver = s
    },
  },
})


if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(storeCache, import.meta.hot));
}