// import Cookie from 'js-cookie'
// import { Component, Vue } from 'nuxt-property-decorator'

// const changes = namespace('changes')
// const errors = namespace('errors')

// @Component export class Cookies extends Vue {
export const useCookies = () => {
  // let options: any
  // @changes.Mutation public delFromChangesProducts!: (s: object) => void
  // @errors.Mutation public pushToErrorsProducts!: (s: object) => void
  function existsCookie (key: string) {
    return (useCookie(key) as Ref).value
  }

  function isCookie (key: string, value:any, defaultValue = undefined) {
    let v = (useCookie(key) as Ref).value
    if (!v) { v = defaultValue }
    return v === value
  }

  function getCookie (key: string, defaultResult:any = '') {
    const v = (useCookie(key) as Ref).value
    if (!v) { return defaultResult }
    return v as unknown as any
  }

  function getParsedCookie (key: string, defaultResult = ''):any {
    const v = (useCookie(key) as Ref).value
    if (v === undefined) { return defaultResult }
    return v
    // const r = JSON.parse(v as unknown as any)
    // return r
  }

  function getKeyCookie (key: string, keyitem:string, defaultResult = '') {
    const v:any = (useCookie(key) as Ref).value
    if (v === undefined || v === null) { return defaultResult }
    return v[keyitem]
    // return JSON.parse(v as unknown as any)[keyitem]
  }

  function includesCookie (key:string, value:string|number|boolean, defaultResult: boolean):any {
    const v: Array<any> = (useCookie(key) as Ref).value
    if (v === undefined || v === null) { return defaultResult }
    return (v).includes(value)
    // return v ? JSON.parse(v as unknown as any).includes(value) : defaultResult
  }

  function setCookie (key:string, value:any, options:any = undefined) {
    let opt:any = options
    // https://nuxt.com/docs/api/composables/use-cookie#options
    if (opt === undefined) { opt = { maxAge: 365 } }
    if (opt.expires !== undefined) {
      opt.maxAge = opt.expires
      opt.expires = undefined
    }
    const keyCookie: Ref = useCookie(key, opt)
    if (value.value === undefined)
      keyCookie.value = value
    else
      keyCookie.value = value.value
    // const _keyCookie = useCookie(key, opt)
  }
  return { existsCookie, isCookie, getCookie, getParsedCookie, getKeyCookie, includesCookie, setCookie }
}
