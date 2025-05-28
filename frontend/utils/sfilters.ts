/**
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
*/
/**
 * @module sfilters for data-objects
 */

/**
 * Recursivly filter the elements.
 * Compare by element[key] === matchingValue
 * if element found add it (as object) to the result array
 * @param elements
 * @param matchingValue
 * @param key
 * @param resultArray
 */
export function filterObject(
  elements: Array<any>,
  matchingValue: string,
  key: string,
  resultArray: Array<string>
) {
  for (const elementKey in elements) {
    const element = elements[elementKey]
    if (element[key] === matchingValue) {
      resultArray.push(element)
    } else if (element.children != null) {
      filterObject(element.children, matchingValue, key, resultArray)
    }
  }
}

/**
 * Recursivly filter the elements.
 * Compare by element[key] in matchingValues
 * if element found add it (as object) to the result array
 * @param elements
 * @param matchingValue
 * @param key
 * @param resultArray
 */
export function filterObjectByValues(
  elements: Array<any>,
  matchingValues: Array<string>,
  key: string,
  resultArray: Array<string>
) {
  for (const elementKey in elements) {
    const element = elements[elementKey]
    if (matchingValues.includes(element[key])) {
      resultArray.push(element)
    } else if (element.children != null) {
      filterObjectByValues(element.children, matchingValues, key, resultArray)
    }
  }
}

/**
 * Recursivly filter the elements.
 * Compare by element[compareKey] === matchingValue
 * If element found add the *value* of element[mapKey] to result array
 * @param elements
 * @param matchingValue
 * @param compareKey
 * @param mapKey
 * @param resultArray
 */
export function filterObjectLabel(
  elements: Array<any>,
  matchingValue: string,
  compareKey: string,
  mapKey: string,
  resultArray: Array<string>
) {
  for (const elementKey in elements) {
    const element = elements[elementKey]
    if (element[compareKey] === matchingValue) {
      resultArray.push(element[mapKey])
    } else if (element.children != null) {
      filterObjectLabel(element.children, matchingValue, compareKey, mapKey, resultArray)
    }
  }
}

/**
 * Recursivly filter the elements.
 * Compare by element[compareKey] in matchingValues
 * If element found add the *value* of element[mapKey] to result array
 * @param elements
 * @param matchingValues
 * @param compareKey
 * @param mapKey
 * @param resultArray
 */
export function filterObjectLabels(
  elements: Array<any>,
  matchingValues: Array<string>,
  compareKey: string,
  mapKey: string,
  resultArray: Array<string>
) {
  for (const elementKey in elements) {
    const element = elements[elementKey]
    if (matchingValues.includes(element[compareKey])) {
      resultArray.push(element[mapKey])
    } else if (element.children != null) {
      filterObjectLabels(element.children, matchingValues, compareKey, mapKey, resultArray)
    }
  }
}

export default {
  filterObject,
  filterObjectLabel,
  filterObjectLabels,
}
