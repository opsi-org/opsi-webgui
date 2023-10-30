export interface IObjectString2Function {
  // x = {'foo': () => { doSth() })}
  [key: string]: Function
}

export interface IObjectString2Any {
  [key: string]: any
}
export interface IObjectString2String {
  [key: string]: string
}
export interface IObjectString2StringOrUndefined {
  [key: string]: string|undefined
}

export interface IObjectString2Boolean {
  [key: string]: boolean
}
export interface IObjectString2ObjectString2String {
  [key: string]: {
      [key: string]: string
  }
}
