<template>
  <b-breadcrumb class="View-Breadcrumb" :items="crumbs" />
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
    const pathArray = this.$route.path.split('/')
    pathArray.shift()

    // console.error("path", pathArray)
    // const breadcrumbs = pathArray.reduce((breadcrumbArray, path, idx):any => {
    //   if (!this.$route.matched[idx]) {
    //     return breadcrumbArray
    //   }
    //   // if (this.$route.matched[idx].meta.breadCrumb) {
    //   //   const counting = ''
    //   //   // if (this.$route.matched[idx].meta.counting) {
    //   //   //   counting = ` (${this.selectedItemsReadable.length}/${Object.keys(this.rowsReadable).length})`;
    //   //   //   if (this.totalCount)
    //   //   //     counting = this.totalCount;
    //   //   // }
    //   //   const bc:object = {
    //   //     path,
    //   //     to: breadcrumbArray[idx - 1]
    //   //       ? '/' + breadcrumbArray[idx - 1].path + '/' + path
    //   //       : '/' + path,
    //   //     // text: this.$t(this.$route.matched[idx].meta.breadCrumb) + counting || path
    //   //     text: path
    //   //   }
    //   //   console.log('bc ', bc)
    //   //   breadcrumbArray.push(bc)
    //   // }
    //   return path
    //   // return breadcrumbArray
    // }, [])
    return pathArray.filter(p => p !== '')
    // return breadcrumbs
  }
}
</script>

<style scoped>
/* .View-Breadcrumb-RightCol{
  text-align: end;
  display: contents;
}
.View-Breadcrumb-RightCol_Mobile{
  text-align: end;
  flex-flow:column wrap;
}
.View-Breadcrumb{
  height: 100%;
  align-content: center;
}
.View-Breadcrumb{
  border: unset;
  text-shadow: unset;
  background-color: unset;
  background-image: unset;
  background-image: unset;
  background-repeat: unset;
  -webkit-filter: unset;
  filter: unset;
}
.ViewsLayoutRow{
  margin-right: auto;
  margin-left:  auto;
}
.breadcrumb{
  padding:0px;
  border-radius: unset;
  font-size: unset;
  margin-left: 0px;
  margin-right: 0px;
}
.View-Breadcrumb-RightCol-SpaceBetween{
 padding-left: 5px;
}
.breadcrumb.View-Row-Breadcrumb{
  border: 1px solid var(--primary);
  background-color: var(--transparent);
  min-height: 30px;
  padding-left: 5px;
  padding-right: 5px;
  width: 100%;
  font-size: medium;
}
.breadcrumb.View-Breadcrumb{
  margin-bottom: 0px;
  font-size: x-large;
}
.view-main  {
  min-width: 100%;
  width: calc(100% - 25px);
}
.view-main  .container-fluid {
  width: unset;
}
*/
</style>
