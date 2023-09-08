import Cookie from 'js-cookie'
import { Component, namespace, Vue } from 'nuxt-property-decorator'

// const changes = namespace('changes')
// const errors = namespace('errors')

@Component export class Cookies extends Vue {
  // @changes.Mutation public delFromChangesProducts!: (s: object) => void
  // @errors.Mutation public pushToErrorsProducts!: (s: object) => void
  isCookie (key: string, value:any, defaultValue = '') {
    let v = Cookie.get(key)
    console.log('iscookie', key, v, value, defaultValue, v === value)
    if (!v) { v = defaultValue }
    return v === value
  }

  getKeyCookie (key: string, keyitem:string, defaultResult = '') {
    const v = Cookie.get(key)
    if (!v) { return defaultResult }
    return JSON.parse(v as unknown as any)[keyitem]
  }

  includesCookie (key:string, value:string|number|boolean, defaultResult: boolean) {
    const v = Cookie.get(key)
    return v ? JSON.parse(v as unknown as any).includes(value) : defaultResult
  }

  // getCookie (key: string, defaultValue="") {
  //   return Cookie.get('last_tab_products', 'Localboot')
  //   // Cookie.set('last_tab_products', 'Localboot')
  // }
  setCookie (key:string, value:any, options = undefined) {
    Cookie.set(key, value, options)
    let v = Cookie.get(key)
    console.log('setcookie', key, v)
  }
}
