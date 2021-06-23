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
  height:700px;
  overflow-y: scroll;
}
</style>
