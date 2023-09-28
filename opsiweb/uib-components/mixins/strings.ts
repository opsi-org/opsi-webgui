import { Component, Vue } from 'nuxt-property-decorator'
@Component export class Strings extends Vue {
  strings: object = {
    '.keep-english.(content)': '({content})',
    '.keep-english.[content]': '[{content}]',
    'keep-english.count/all': '{count}/{all}',
    'keep-english.colon': ':',
    'keep-english.empty': '--',
    'keep-english.title.delimiter': ' - ',
    'title.project': 'opsi-webgui',
    uib: 'uib GmbH',
    unequal: '≠',
    notOrigin: '*'
  }

  t_fixed (key: string) { return this.strings[key] }
}
