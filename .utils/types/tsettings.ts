
export interface ISidebarAttributes {
    visible: boolean
    expanded: boolean
    alwaysVisible?: boolean // only for testing with storybook
}

export interface ITheme {
    title: string
    rel: string
    timestamp?: number
}
