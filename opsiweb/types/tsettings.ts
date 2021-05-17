
export interface ITheme {
    title: string
    rel: string
    timestamp?: number
}

export interface IClient {
    ident: string
    clientId: string
    description: string
}

export interface IDepot {
    ident: string
    depotId: string
    description: string
}

export interface IRowItem {
    ident: string
    _rowVariant?: string
}
export interface IRow {
    rowSelected: boolean
    item: IRowItem
}

export interface ITableData {
    pageNumber: number,
    perPage: number,
    sortBy: string,
    sortDesc: boolean,
    filterQuery: string,
    selectedDepot?: Array<string>,
    selectedClients?: Array<string>
}
