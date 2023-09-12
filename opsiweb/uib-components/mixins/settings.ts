import { Component, namespace, Vue } from 'nuxt-property-decorator'

const settings = namespace('settings')

@Component export class Settings extends Vue {
  @settings.Getter public colortheme!: any
  CONST_LIGHT = 'theme-light'
  CONST_DARK = 'theme-dark'

  get themeclass (): string {
    return (this.colortheme && this.colortheme.title === 'light') ? this.CONST_LIGHT : this.CONST_DARK
  }
}
