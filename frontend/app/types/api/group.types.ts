/**
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
*/

export interface Group {
  id: string
  type: string
  text: string
  parent: string | null
  children: { [key: string]: Group } | null
}

export interface GroupTransformed {
  id: string
  type: string
  text: string
  parent: string | null
  disabled?: boolean
  children?: GroupTransformed[] | null
}
