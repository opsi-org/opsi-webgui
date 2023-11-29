export const _getI18nInComposable = () => {
  // only 'const {t} = useI18n()" not works for story
  let t = (k: string) => { return k}
  let _t = undefined
  try {
    const t = useI18n({ useScope: 'global'}).t
    if (t != undefined) _t = t
  } catch (error) {
    console.warn(error)
  }
  if (_t !== undefined) t = _t
  console.log('use81n.  t  ', t)
  return t
}