export type ItemServer = { id: string; description: string }

export type ItemClient = {
  id: string
  description: string
  depotId: string
  amount_products_installed: number
  amount_products_setup: number
}

export type ItemProduct = {
  id: string
  isAllowed: boolean
  wasInstalled: boolean
  mustHave: boolean
  info?: string
  ondepotOld: boolean | null | undefined
  ondepotNew: boolean
}
export type Response<T> = { result: T }
export type ResponseList<T> = { result: Array<T> }
