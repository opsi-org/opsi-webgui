/**
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
*/
export interface IObjectString2Function {
  [key: string]: () => void
}

export interface IObjectString2Any {
  [key: string]: any
}
export interface IObjectString2String {
  [key: string]: string
}
export interface IObjectString2StringOrUndefined {
  [key: string]: string | undefined
}

export interface IObjectString2Boolean {
  [key: string]: boolean
}
export interface IObjectString2ObjectString2String {
  [key: string]: {
    [key: string]: string
  }
}
