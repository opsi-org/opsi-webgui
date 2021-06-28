export interface IObjectString2Function {
    // x = {'foo': () => { doSth() })}
    [key: string]: Function
}
export interface IObjectString2String {
    // x = {'foo': 'bar'}
    [key: string]: string
}
export interface IObjectString2ObjectString2String {
    // x = {'foo': { 'k': 'bar' })}
    [key: string]: {
        [key: string]: string
    }
}
export interface ISidebarAttributes {
    visible: boolean
    expanded: boolean
}

export interface ITheme {
    title: string
    rel: string
    timestamp?: number
}

