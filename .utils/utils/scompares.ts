
export function arrayEqual (aOrig: Array<any>, bOrig: Array<any>):boolean {
  // if (bOrig==undefined && aOrig==undefined) return true;
  // if (bOrig!=undefined && aOrig!=undefined){}
  if (aOrig.length === bOrig.length && aOrig.length === 0) {
    return true
  } else if (aOrig.length !== bOrig.length) {
    return false
  }
  const a = JSON.parse(JSON.stringify(aOrig))
  const b = JSON.parse(JSON.stringify(bOrig))
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
export default {
  arrayEqual
}
