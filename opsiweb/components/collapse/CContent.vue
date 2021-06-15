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
    <b-collapse :id="title+'-collapse'" v-model="visible" accordion="content-accordion">
      <slot name="content" />
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
    }
  },
  data: () => ({
    visible: false
  })
})
</script>
