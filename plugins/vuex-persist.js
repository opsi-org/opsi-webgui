// es l i nt-disable-next-line import/no-named-as-default
import VuexPersistence from 'vuex-persist'

export default ({ store }) => {
  new VuexPersistence({
    key: 'vuex', // The key to store the state on in the storage provider.
    modules: ['auth', 'selections'],
    storage: window.localStorage // or window.sessionStorage or localForage
  }).plugin(store)
}
