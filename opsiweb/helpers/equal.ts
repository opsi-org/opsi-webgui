export function arrEqual (arr1:Array<any>, arr2:Array<any>):boolean {
  if (arr1.length === 0 && arr1.length === arr2.length) { return true }
  if (arr1.length !== arr2.length) { return false }
  const a = JSON.parse(JSON.stringify(arr1))
  const b = JSON.parse(JSON.stringify(arr2))
  if (a === b) { return true }
  if (a == null || b == null) { return false }
  if (a.length !== b.length) { return false }
  a.sort()
  b.sort()

  for (let i = 0; i < a.length; ++i) {
    // !!!! error: Empty block statement (no-empty) !!!!
    // if (a[i] == b[i]) {
    // } else return false;
    if (a[i] !== b[i]) {
      return false
    }
  }
  return true
}
