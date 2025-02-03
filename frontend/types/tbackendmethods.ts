/**
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
*/
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
  children: null | {
    [key: string]: IGroup | IGroupObj2Group
  }
}
export interface IGroups {
  [key: string]: IGroup
}

export interface Group {
  id: string
  text: string
  isBranch?: boolean
  type: string
  isDisabled?: boolean
  children: null | Array<any>
}
