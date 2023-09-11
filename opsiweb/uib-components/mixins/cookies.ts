import Cookie from 'js-cookie'
import { Component, namespace, Vue } from 'nuxt-property-decorator'

// const changes = namespace('changes')
// const errors = namespace('errors')

@Component export class Cookies extends Vue {
  static options: any
  // @changes.Mutation public delFromChangesProducts!: (s: object) => void
  // @errors.Mutation public pushToErrorsProducts!: (s: object) => void
  existsCookie (key: string) {
    return Cookie.get(key)
  }

  isCookie (key: string, value:any, defaultValue = undefined) {
    let v = Cookie.get(key)
    if (!v) { v = defaultValue }
    return v === value
  }

  getCookie (key: string, defaultResult = '') {
    const v = Cookie.get(key)
    if (!v) { return defaultResult }
    return v as unknown as any
  }

  getParsedCookie (key: string, defaultResult = '') {
    const v = Cookie.get(key)
    if (!v) { return defaultResult }
    const r = JSON.parse(v as unknown as any)
    return r
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

  setCookie (key:string, value:string, options = undefined) {
    let opt:any = options
    if (opt === undefined) { opt = { expires: 365 } }
    Cookie.set(key, value, opt)
  }
}
