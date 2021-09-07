<template>
  <b-breadcrumb v-if="crumbs.length > 0" class="View-Breadcrumb" :items="crumbs" />
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
import { Vue, Component } from 'nuxt-property-decorator'
// import { BBreadcrumb } from 'bootstrap-vue'
// import { ITableRow, ITableHeaders } from '~/types/tsettings'

// export interface IBreadcrumb {
//     path: string,
//     to: string,
//     text: string,
// }
@Component
export default class BBreadcrumbRow extends Vue {
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
    const pathArray : any = this.$route.path.split('/')
    pathArray.shift()
    for (const c in pathArray) {
      switch (pathArray[c]) {
        case 'support': pathArray[c] = this.$t('title.support'); break
        case 'depots': pathArray[c] = this.$t('title.depots'); break
        case 'config': pathArray[c] = this.$t('title.config'); break
        case 'log': pathArray[c] = this.$t('title.log'); break
        case 'depotsconfig': pathArray[c] = this.$t('title.depotsconfig'); break
        case 'clientsconfig': pathArray[c] = this.$t('title.clientsconfig'); break
        case 'clientslog': pathArray[c] = this.$t('title.clientslog'); break
        case 'clientsaddnew': pathArray[c] = this.$t('title.addNewClient'); break
        case 'products': pathArray[c] = this.$t('title.products'); break
        case 'settings': pathArray[c] = this.$t('title.settings'); break
      }
    }
    return pathArray.filter((p: string) => p !== '')
  }
}
</script>

<style scoped>
</style>
