<template>
  <div data-testid="TInfiniteScrollCollapse">
    <BarBPageHeader
      navbartype="collapse"
      :collapsed="visible"
      :aria-controls="title+'-collapse'"
      :aria-expanded="visible"
      :title="title"
      @click.native="visible = !visible"
    />
    <b-collapse :id="title+'-collapse'" v-model="visible" accordion="table-accordion">
      <TableTInfiniteScroll
        v-bind="$props"
      >
        <template
          v-for="slotName in Object.keys($scopedSlots)"
          #[slotName]="slotScope"
        >
          <slot :name="slotName" v-bind="slotScope" />
        </template>
      </TableTInfiniteScroll>
    </b-collapse>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'

@Component
export default class TInfiniteScrollCollapse extends Vue {
  @Prop({ }) title!: string
  @Prop({ }) tableitems!: Array<object>
  visible: boolean = false
}
</script>
