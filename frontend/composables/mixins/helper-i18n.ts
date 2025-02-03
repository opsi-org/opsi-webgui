/**
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
*/
export const _getI18nInComposable = () => {
  // only 'const {t} = useI18n()" not works for story
  let t = (k: string) => {
    return k
  }
  let _t = undefined
  try {
    const t = useI18n({ useScope: 'global' }).t
    if (t != undefined) _t = t
  } catch (error) {
    console.error('its ok...', error)
  }
  if (_t !== undefined) t = _t
  return t
}
