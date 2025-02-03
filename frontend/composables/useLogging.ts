/**
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
*/
/* eslint-disable no-console */

export const log = () => {
  function log(...msg: any) {
    console.log(...msg)
  }
  function debug(...msg: any) {
    console.debug(...msg)
  }
  function info(...msg: any) {
    console.info(...msg)
  }
  function warn(...msg: any) {
    console.warn(...msg)
  }
  function error(...msg: any) {
    console.error(...msg)
  }

  function log_colored(color: string, ...msg: any) {
    // const [first, ...rest] = msg
    const s = '' + msg.map((v: any) => v).join(' ')
    console.log('%c' + s, 'color:' + color + ';font-weight:bold;')
  }
  function log_colored_group(color: string, ...msg: any) {
    const s =
      '' +
      msg
        .map((v: string) => {
          return v
        })
        .join(' ')
    console.group('%c' + s, 'color:' + color + ';font-weight:bold;')
  }
  function log_colored_group_end() {
    console.groupEnd()
  }

  // colorTrace("Test Me", "red");
  return {
    log,
    debug,
    info,
    warn,
    error,
    log_colored,
    log_colored_group,
    log_colored_group_end,
  }
}
