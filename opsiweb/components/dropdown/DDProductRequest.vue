<template>
  <b-dropdown
    v-bind="$props"
    no-caret
    lazy
    dropleft
    variant="outline-primary"
    size="sm"
    alt="Show column"
    class="fixed_column_selection widthmax"
  >
    <template #button-content>
      {{(request.length == 1) ? request[0]:">1" }}
    </template>

    <!-- @click="actionRequestProducts=a; addSelectedToChanged(actionRequestProducts)" -->
    <b-dropdown-item
      v-for="a in requestoptions"
      :key="a"
      @click="save(rowitem, a)"
    >
      {{a}}
    </b-dropdown-item>
    <!-- <li v-if="$mq=='mobile'">
    </li> -->
  </b-dropdown>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'
import { BDropdown } from 'bootstrap-vue'
import { ITableRowProducts } from '~/types/tsettings'
@Component export default class DDProductRequest extends BDropdown {
  @Prop({ }) rowitem!: ITableRowProducts|undefined
  @Prop({ default: () => { return ['---'] } }) request!: Array<string>
  @Prop({ default: () => { return ['---', 'none', 'setup', 'uninstall', 'update', 'once', 'always', 'custom'] } }) requestoptions!: Array<string>
  @Prop({ default: () => { return () => {} } }) save!: Function
}
</script>

<style>

.widthmax {
  width: 100%;
}
</style>
