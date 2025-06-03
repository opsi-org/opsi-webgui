/**
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
*/
export const useUtils = () => {
  const addOrRemoveListItem = (arr: any[], upload: any, by = 'ident') => {
    const index = arr.findIndex(function (element) {
      return element[by] === upload[by]
    })
    if (index > -1) {
      arr.splice(index, 1)
    } else {
      arr.push(upload)
    }
    return arr
  }
  const isEqual = (arr: any[]) => {
    if (arr.length === 0) return true
    return arr.every((v) => v === arr[0])
  }

  return { addOrRemoveListItem, isEqual }
}
