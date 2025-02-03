/**
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
*/
export const useFormat = () => {
  function date(value: any) {
    if (typeof value === 'object') {
      return value
    } else if (value !== '' || value !== undefined || value !== null) {
      // timezone of browser
      // const tz = Intl.DateTimeFormat().resolvedOptions().timeZone; // we dont care about. we use the server time
      let date
      let time
      if (value.includes('T') && value.includes('Z')) {
        date = new Date(value.split('T')[0])
        time = value.split('T')[1].split('Z')[0]
      } else if (value.includes('T')) {
        date = new Date(value.split('T')[0])
        time = value.split('T')[1]
      } else if (value.includes(' ')) {
        date = new Date(value.split(' ')[0])
        time = value.split(' ')[1]
      } else {
        console.warn('Format.date: unknown format', value)
      }
      if (date === undefined || time === undefined) {
        console.warn('Format.date: date or time is undefined', value)
        return ''
      }
      const d = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        time.split(':')[0],
        time.split(':')[1],
        time.split(':')[2],
      )
      const month = d.getMonth() + 1
      const day = d.getDate()
      const hour = d.getHours()
      const minute = d.getMinutes()
      const second = d.getSeconds()
      let datestring =
        d.getFullYear() +
        '-' +
        ('0' + month).slice(-2) +
        '-' +
        ('0' + day).slice(-2)
      datestring +=
        ' ' +
        ('0' + hour).slice(-2) +
        ':' +
        ('0' + minute).slice(-2) +
        ':' +
        ('0' + second).slice(-2)
      return datestring
    } else {
      return ''
    }
  }
  return { date }
}
