import { Component, Vue } from 'nuxt-property-decorator'

console.log('MIXIN')
const _iconnames = {
  depot: 'server',
  client: 'laptop',
  product: 'grid',
  changes: 'list-check',
  support: 'headset',
  settings: 'gear',
  columns: 'grid3x3'
}

@Component
export class Constants extends Vue {
  iconnames: any = _iconnames
  // get iconnames () {
  //   return _iconnames
  // }
}

// import Vue from 'vue'

// const mixin = {
//   data: () => {
//     return {
//     }
//   }
// }

// Vue.mixin(mixin)
// mixin.ts
