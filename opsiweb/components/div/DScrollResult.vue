<template>
  <div class="content-scroll">
    <slot name="content" />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'
@Component
export default class CDivScrollable extends Vue {
}
</script>

<style>
.content-scroll{
  max-height: 670px !important;
  overflow-x: hidden;
  overflow-y: scroll;
}
</style>
