/**
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
*/
export function assert(condition: any, message: string = 'Type error') {
  if (!condition) {
    console.error(message)
    throw new Error(message)
  }
}
