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
import Vue from 'vue'
export default Vue.extend({
  props: {
    title: {
      type: String,
      default: ''
    },
    tableitems: {
      type: Array,
      default () {
        return []
      }
    }
  },
  data: () => ({
    visible: false
  })
})
</script>
