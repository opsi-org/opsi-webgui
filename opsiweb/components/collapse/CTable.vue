<template>
  <div>
    <BarBPageHeader
      navbartype="collapse"
      :collapsed="visible"
      :aria-controls="title+'-collapse'"
      :aria-expanded="visible"
      :title="title"
      @click.native="visible = !visible"
    />
    <b-collapse :id="title+'-collapse'" v-model="visible" accordion="table-accordion">
      <TableTDefault :tableitems="tableitems" />
    </b-collapse>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'

@Component
export default class CTable extends Vue {
  @Prop({ }) title!: string
  @Prop({ }) tableitems!: Array<object>
  visible: boolean = false
}
</script>
