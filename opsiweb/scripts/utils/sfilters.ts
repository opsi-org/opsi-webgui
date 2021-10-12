export function filterObject (elements: Array<any>, matchingValue: string, key: string, resultArray:Array<string>) {
  for (const elementKey in elements) {
    const element = elements[elementKey]
    if (element[key] === matchingValue) {
      resultArray.push(element)
    } else if (element.children != null) {
      filterObject(element.children, matchingValue, key, resultArray)
    }
  }
}

export function filterObjectLabel (elements:Array<any>, matchingValue: string, compareKey:string, mapKey:string, resultArray:Array<string>) {
  for (const elementKey in elements) {
    const element = elements[elementKey]
    if (element[compareKey] === matchingValue) {
      resultArray.push(element[mapKey])
    } else if (element.children != null) {
      filterObjectLabel(element.children, matchingValue, compareKey, mapKey, resultArray)
    }
  }
}
