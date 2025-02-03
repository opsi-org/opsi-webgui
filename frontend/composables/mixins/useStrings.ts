/**
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
*/
export const useStrings = () => {
  const strings: { [key: string]: string } = {
    'keep-english.(content)': '(content)',
    'keep-english.[content]': '[content]',
    'keep-english.count/all': 'count/all',
    'keep-english.colon': ':',
    'keep-english.empty': '--',
    'keep-english.title.delimiter': ' - ',
    'title.project': 'opsi-webgui',
    'title.project.webgui': ' WebGUI',
    uib: 'uib GmbH',
    unequal: '≠',
    notOrigin: '*',
  }

  function t_fixed(key: string) {
    return strings[key]
  }
  return { strings, t_fixed }
}
