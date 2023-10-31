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
    return useCookie(key).value
  }

  function isCookie (key: string, value:any, defaultValue = undefined) {
    let v = useCookie(key).value
    if (!v) { v = defaultValue }
    return v === value
  }

  function getCookie (key: string, defaultResult = '') {
    const v = useCookie(key).value
    if (!v) { return defaultResult }
    return v as unknown as any
  }

  function getParsedCookie (key: string, defaultResult = '') {
    const v = useCookie(key).value
    if (!v) { return defaultResult }
    const r = JSON.parse(v as unknown as any)
    return r
  }

  function getKeyCookie (key: string, keyitem:string, defaultResult = '') {
    const v = useCookie(key).value
    if (!v) { return defaultResult }
    return JSON.parse(v as unknown as any)[keyitem]
  }

  function includesCookie (key:string, value:string|number|boolean, defaultResult: boolean) {
    const v = useCookie(key).value
    return v ? JSON.parse(v as unknown as any).includes(value) : defaultResult
  }

  function setCookie (key:string, value:string, options = undefined) {
    let opt:any = options
    if (opt === undefined) { opt = { expires: 365 } }
    useCookie(key, opt).value = value
  }
  return { existsCookie, isCookie, getCookie, getParsedCookie, getKeyCookie, includesCookie, setCookie }
}
