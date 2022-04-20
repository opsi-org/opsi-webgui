<template>
  <div class="ml-2 mt-2">
    <slot />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'
@Component
export default class DComponentGroup extends Vue {
}
</script>
