
export interface ISidebarAttributes {
    visible: boolean
    expanded: boolean
}

export interface ITheme {
    title: string
    rel: string
    timestamp?: number
}

export interface ITableDataItem {
    ident: string
}

export interface ITableRow {
    rowSelected: boolean
    item: {
        ident: string
        _rowVariant?: string
    };
}

export interface ITableRowItemProducts {
    ident: Array<string>
    request: Array<string>
}
export interface ITableData {
    pageNumber: number,
    setPageNumber: Function,
    perPage: number,
    sortBy: string,
    sortDesc: boolean,
    filterQuery: string,
    selectedDepots?: Array<string>,
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
