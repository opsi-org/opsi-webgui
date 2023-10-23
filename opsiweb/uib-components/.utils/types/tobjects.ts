import { IDepend, IProp } from "./ttable"

export interface NewClient {
  hostId: string,
  description: string,
  inventoryNumber: string,
  hardwareAddress: string,
  ipAddress: any,
  notes: string
}

export interface FormClientAgent {
    clients: Array<string>,
    username: string,
    password: string,
    type: string
}


export interface IErrorDepProp {
  dependencies: string
  properties: string
}
export interface IFetchedData {
  dependencies:IDepend,
  properties:IProp
}

export interface FormUser {
    username: string,
    password: string
}

export interface SideBarAttr {
    visible: boolean,
    expanded: boolean
}

export interface IFetchOptions {
  fetchClients:boolean,
  fetchClients2Depots:boolean,
}

export interface AppState {
  type: string
  address_exceptions: Array<string>,
  retry_after: number
}
export interface CreateBackup {
  config_files: boolean,
  redis_data:boolean,
  maintenance_mode: boolean,
  password: string
}
export interface RestoreBackup {
  file_id: string,
  config_files: boolean,
  redis_data:boolean,
  server_id: string,
  password: string
}

export interface Group {
  id: string
  text: string
  type: string
  isDisabled?: boolean
  isNew?: boolean
  hasAnySelection?: boolean
  children?: null | Array<any>
}
export interface StoreSelection {
  selection: Array<string>
  pushSelection: Function
  delSelection: Function
}

export interface IMenuItem {
  title:string
  route?: string
  icon?: string
  disabled?: boolean
  submenu?: Array<IMenuItem>
  menu?: Array<IMenuItem>
}

export interface LogRequest {
  selectedClient: string,
  selectedLogType: string
}
export interface FormClientAgent {
  clients: Array<string>,
  username: string,
  password: string,
  type: string
}

export interface QuickAction {
  action: any,
  outdated: boolean,
  installation_status: any,
  action_result: any,
  selectedClients: undefined | Array<string>,
  // selectedDepots: undefined | Array<string>,
  demoMode: boolean
}

export interface DeleteClient {
  clientid: string
}

export interface IColumnLayoutCollapsed {
  parentId: string,
  value: boolean
}