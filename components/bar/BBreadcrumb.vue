<template>
  <b-breadcrumb v-if="crumbs.length > 0" data-testid="BarBBreadcrumb" :items="crumbs" />
  <!-- <b-row
  > -->
  <!-- align-v="stretch" -->
  <!-- no-gutters -->
  <!-- class="breadcrumb View-Row-Breadcrumb border-primary" -->
  <!-- :class="{TitleColumnLeft:hasTitleColumnLeftSlot}" -->
  <!-- <b-col>
    <b-breadcrumb class="View-Breadcrumb" :items="crumbs" />
  </b-col> -->
  <!-- <b-col sm="auto" v-if="!!this.$slots.TitleColumnLeft || !!this.$slots.TitleColumnRight"
    :class="$mq =='mobile' ? 'View-Breadcrumb-RightCol_Mobile' : 'View-Breadcrumb-RightCol'">
    <slot name="TitleColumnLeft"></slot>
    <div class="View-Breadcrumb-RightCol-SpaceBetween"></div>
    <slot name="TitleColumnRight"></slot> -->
  <!-- </b-col> -->
  <!-- </b-row> -->
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'
// import { BBreadcrumb } from 'bootstrap-vue'
// import { ITableRow, ITableHeaders } from '~/types/tsettings'

// export interface IBreadcrumb {
//     path: string,
//     to: string,
//     text: string,
// }
@Component
export default class BBreadcrumbRow extends Vue {
  @Prop({ default: undefined }) specificItems!: Array<string>|undefined

  get breadcrumbItems (): Array<string> {
    if (this.$router === null || this.$router === undefined) {
      return []
    } else if (this.$router.currentRoute === null || this.$router.currentRoute === undefined) {
      return []
    } else if (this.$router.currentRoute.name === null || this.$router.currentRoute.name === undefined) {
      return []
    } else {
      return this.$router.currentRoute.name.split('/')
    }
  }

  get crumbs (): Array<string> {
    if (this.specificItems !== undefined) { return this.specificItems }
    const pathArray : Array<string> = this.$route.path.split('/')
    pathArray.shift()
    for (const c in pathArray) {
      switch (pathArray[c]) {
        case 'support': pathArray[c] = this.$t('title.support') as string; break
        case 'depots': pathArray[c] = this.$t('title.depots') as string; break
        case 'config': pathArray[c] = this.$t('title.config') as string; break
        case 'log': pathArray[c] = this.$t('title.log') as string; break
        case 'depotsconfig': pathArray[c] = this.$t('title.depotsconfig') as string; break
        case 'clientsconfig': pathArray[c] = this.$t('title.clientsconfig') as string; break
        case 'clientslog': pathArray[c] = this.$t('title.clientslog') as string; break
        case 'clientsaddnew': pathArray[c] = this.$t('title.addNewClient') as string; break
        case 'products': pathArray[c] = this.$t('title.products') as string; break
        case 'settings': pathArray[c] = this.$t('title.settings') as string; break
      }
    }
    return pathArray.filter(p => p !== '')
  }
}
</script>
