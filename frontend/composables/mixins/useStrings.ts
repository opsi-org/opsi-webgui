
export const useStrings = () => {
  const strings: object = {
    'keep-english.(content)': '(content)',
    'keep-english.[content]': '[content]',
    'keep-english.count/all': 'count/all',
    'keep-english.colon': ':',
    'keep-english.empty': '--',
    'keep-english.title.delimiter': ' - ',
    'title.project': 'opsi-webgui',
    uib: 'uib GmbH',
    unequal: '≠',
    notOrigin: '*'
  }

  function t_fixed (key: string) { return this.strings[key] }
  return { strings, t_fixed }
 }