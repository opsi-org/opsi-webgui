<template>
  <div class="text-capitalize text-small">
    <b-breadcrumb
      v-if="crumbs.length > 0"
      data-testid="BarBBreadcrumb"
      class="p-0 m-0 lightBreadcrumb"
      :items="crumbs"
    />
  </div>
</template>

<script lang="ts">
import { Vue, Prop, Component } from 'nuxt-property-decorator'

@Component
export default class BBreadcrumbRow extends Vue {
  @Prop({ default: undefined }) specificItems!: Array<string>|undefined
  $t: any
  $route: any

  get crumbs (): Array<string> {
    if (this.specificItems !== undefined) { return this.specificItems }
    const pathArray : Array<string> = this.$route.path.split('/')
    pathArray.shift()
    const items:any = []
    for (const c in pathArray) {
      const obj:any = {}
      switch (pathArray[c]) {
        case 'support': obj.text = this.$t('title.support') as string; break
        case 'depots': obj.text = this.$t('title.depots') as string; break
        case 'config': obj.text = this.$t('title.config') as string; break
        case 'log': obj.text = this.$t('title.log') as string; break
        case 'depotsconfig': obj.text = this.$t('title.depotsconfig') as string; break
        case 'clientsconfig': obj.text = this.$t('title.clientsconfig') as string; break
        case 'clientslog': obj.text = this.$t('title.clientslog') as string; break
        case 'clientscreation': obj.text = this.$t('title.addNewClient') as string; break
        case 'products': obj.text = this.$t('title.products') as string; break
        case 'adminterminal': obj.text = this.$t('title.adminterminal') as string; break
        case 'adminserverhealthcheck': obj.text = this.$t('title.serverhealthcheck') as string; break
        case 'adminmodules': obj.text = this.$t('form.modules') as string; break
        case 'settings': obj.text = this.$t('title.settings') as string; break
        case '': break
        default: obj.text = pathArray[c]
      }

      obj.to = { path: '/' + pathArray.slice(0, Number(c) + 1).join('/') }
      if (pathArray[c] !== '') {
        items.push(obj)
      }
    }
    return items
  }
}
</script>

<style>
.lightBreadcrumb a.nuxt-link-active {
  font-weight: normal !important;
  color: var(--light) !important;
  text-decoration: underline;
}
.lightBreadcrumb .breadcrumb-item.active {
  color: var(--light) !important;
}
</style>
