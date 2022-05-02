<template>
  <div data-testid="SBLoglevel">
    <label for="loglevel" class="sr-only"> {{ $t('button.change.loglevel') }} </label>
    <b-form-spinbutton
      id="loglevel"
      v-model="level"
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
}
</style>
