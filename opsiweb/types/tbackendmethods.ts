
export interface IGroupObj2Group {
    id: string
    label: string
    type?: string
    isBranch?: boolean
    hasDifferencesBetweenDepots?: boolean
}
export interface IGroup {
  id: string
  label: string
  type?: string
  isBranch?: boolean
  children: null|{
    [key: string]: IGroup|IGroupObj2Group
  }
}
export interface IGroups {
  [key: string]: IGroup
}
