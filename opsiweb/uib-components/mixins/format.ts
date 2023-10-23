import { Component, Vue } from 'nuxt-property-decorator'

@Component export class Format extends Vue {
  date (value:any) {
    if (typeof value === 'object') {
      return value
    } else if (value !== '' || value !== undefined || value !== null) {
      return new Date(value).toString()
    } else { return '' }
  }
}
