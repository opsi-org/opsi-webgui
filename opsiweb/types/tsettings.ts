
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

export interface ITableRow {
    rowSelected: boolean
    item: {
        ident: string
        _rowVariant?: string
    };
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

export interface ITableHeader {
    label: string,
    key: string,
    visible: boolean,
    _fixed?: boolean,
    _isMajor?: boolean,
    _majorKey?: string,
}
export interface ITableHeaders {
    [key: string]: ITableHeader
}
