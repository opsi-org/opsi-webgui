<template>
  <div data-testid="SBLoglevel">
    <b-form-spinbutton
      id="loglevel"
      v-model="level"
      size="sm"
      :aria-label="$t('button.change.loglevel')"
      class="loglevel_spinbutton"
      min="0"
      max="8"
      step="1"
      inline
      @change="$emit('update:loglevel', level)"
    />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'

@Component
export default class SLoglevel extends Vue {
  level: number = 5
}
</script>

<style>
.loglevel_spinbutton{
  min-width: var(--component-width) !important;
  padding: 0 !important;
  font-size: var(--text-small);
}
</style>
