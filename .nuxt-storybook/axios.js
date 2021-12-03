import Axios from 'axios'
import defu from 'defu'

// Axios.prototype cannot be modified
const axiosExtra = {
  setBaseURL (baseURL) {
    this.defaults.baseURL = baseURL
  },
  setHeader (name, value, scopes = 'common') {
    for (const scope of Array.isArray(scopes) ? scopes : [ scopes ]) {
      if (!value) {
        delete this.defaults.headers[scope][name];
        continue
      }
      this.defaults.headers[scope][name] = value
    }
  },
  setToken (token, type, scopes = 'common') {
    const value = !token ? null : (type ? type + ' ' : '') + token
    this.setHeader('Authorization', value, scopes)
  },
  onRequest(fn) {
    this.interceptors.request.use(config => fn(config) || config)
  },
  onResponse(fn) {
    this.interceptors.response.use(response => fn(response) || response)
  },
  onRequestError(fn) {
    this.interceptors.request.use(undefined, error => fn(error) || Promise.reject(error))
  },
  onResponseError(fn) {
    this.interceptors.response.use(undefined, error => fn(error) || Promise.reject(error))
  },
  onError(fn) {
    this.onRequestError(fn)
    this.onResponseError(fn)
  },
  create(options) {
    return createAxiosInstance(defu(options, this.defaults))
  }
}

// Request helpers ($get, $post, ...)
for (const method of ['request', 'delete', 'get', 'head', 'options', 'post', 'put', 'patch']) {
  axiosExtra['$' + method] = function () { return this[method].apply(this, arguments).then(res => res && res.data) }
}

const extendAxiosInstance = axios => {
  for (const key in axiosExtra) {
    axios[key] = axiosExtra[key].bind(axios)
  }
}

const createAxiosInstance = axiosOptions => {
  // Create new axios instance
  const axios = Axios.create(axiosOptions)
  axios.CancelToken = Axios.CancelToken
  axios.isCancel = Axios.isCancel

  // Extend axios proto
  extendAxiosInstance(axios)

  // Intercept to apply default headers
  axios.onRequest((config) => {
    config.headers = { ...axios.defaults.headers.common, ...config.headers }
  })

  // Setup interceptors

  return axios
}

export default (ctx, inject) => {
  // runtimeConfig
  const runtimeConfig = ctx.$config && ctx.$config.axios || {}
  // baseURL
  const baseURL = process.browser
    ? (runtimeConfig.browserBaseURL || runtimeConfig.browserBaseUrl || runtimeConfig.baseURL || runtimeConfig.baseUrl || 'https://localhost:4447/addons/webgui')
      : (runtimeConfig.baseURL || runtimeConfig.baseUrl || process.env._AXIOS_BASE_URL_ || 'https://localhost:4447/addons/webgui')

  // Create fresh objects for all default header scopes
  // Axios creates only one which is shared across SSR requests!
  // https://github.com/mzabriskie/axios/blob/master/lib/defaults.js
  const headers = {
    "common": {
        "Accept": "application/json, text/plain, */*"
    },
    "delete": {},
    "get": {},
    "head": {},
    "post": {},
    "put": {},
    "patch": {}
}

  const axiosOptions = {
    baseURL,
    headers
  }

  // Proxy SSR request headers headers
  if (process.server && ctx.req && ctx.req.headers) {
    const reqHeaders = { ...ctx.req.headers }
    for (const h of ["accept","cf-connecting-ip","cf-ray","content-length","content-md5","content-type","host","x-forwarded-host","x-forwarded-port","x-forwarded-proto"]) {
      delete reqHeaders[h]
    }
    axiosOptions.headers.common = { ...reqHeaders, ...axiosOptions.headers.common }
  }

  if (process.server) {
    // Don't accept brotli encoding because Node can't parse it
    axiosOptions.headers.common['accept-encoding'] = 'gzip, deflate'
  }

  const axios = createAxiosInstance(axiosOptions)

  // Inject axios to the context as $axios
  ctx.$axios = axios
  inject('axios', axios)
}
