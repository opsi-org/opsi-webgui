import path from 'path'
import fs from 'fs'
import Vue from 'vue'
import VueI18n from 'vue-i18n'

Vue.use(VueI18n)

const langs = {}

const dir = './uib-components/locale/'
const fullPath = path.join(__dirname, dir)
const files = fs.readdirSync(fullPath)
try {
  // gets all internationalization files, which are located in 'dir'
  files.forEach((file) => {
    if (/opsiweb-ui_(.*)\.json/.test(file)) {
      const l = file.match(/opsiweb-ui_(.*)\.json/)
      try {
        const json = require(fullPath + '/' + file)
        langs[l[1]] = json
      } catch (error) { console.log('Error reading file ', file, error) }
    }
  })
} catch (error) { console.log(error) }

export default ({ app }) => {
  app.i18n = new VueI18n({
    locale: 'en',
    silentTranslationWarn: process.env.NODE_ENV === 'production',
    fallbackLocale: 'en',
    messages: langs
  })
}
