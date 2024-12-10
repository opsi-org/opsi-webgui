export const useCookies = () => {
  function existsCookie(key: string) {
    return (useCookie(key) as Ref).value
  }

  function isCookie(key: string, value: any, defaultValue = undefined) {
    let v = (useCookie(key) as Ref).value
    if (!v) {
      v = defaultValue
    }
    return v === value
  }

  function getCookie(key: string, defaultResult: any = '') {
    const v = (useCookie(key) as Ref).value
    if (!v) {
      return defaultResult
    }
    return v as unknown as any
  }

  function getParsedCookie(key: string, defaultResult = ''): any {
    const v = (useCookie(key) as Ref).value
    if (v === undefined) {
      return defaultResult
    }
    return v
  }

  function getKeyCookie(key: string, keyitem: string, defaultResult = '') {
    const v: any = (useCookie(key) as Ref).value
    if (v === undefined || v === null) {
      return defaultResult
    }
    return v[keyitem]
  }

  function includesCookie(
    key: string,
    value: string | number | boolean,
    defaultResult: boolean,
  ): any {
    const v: Array<any> = (useCookie(key) as Ref).value
    if (v === undefined || v === null) {
      return defaultResult
    }
    return v.includes(value)
  }

  function setCookie(key: string, value: any, options: any = undefined) {
    let opt: any = options
    // https://nuxt.com/docs/api/composables/use-cookie#options
    if (opt === undefined) {
      opt = { maxAge: 365 }
    }
    if (opt.expires !== undefined) {
      opt.maxAge = opt.expires
      opt.expires = undefined
    }
    const keyCookie: Ref = useCookie(key, opt)
    if (value.value === undefined) keyCookie.value = value
    else keyCookie.value = value.value
  }
  return {
    existsCookie,
    isCookie,
    getCookie,
    getParsedCookie,
    getKeyCookie,
    includesCookie,
    setCookie,
  }
}
