<template>
  <b-form-spinbutton
    v-model="level"
    data-testid="SBLoglevel"
    class="loglevel_spinbutton"
    min="0"
    max="8"
    step="1"
    inline
    @change="$emit('update:loglevel', level)"
  />
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
  min-width: 145px !important;
}
</style>
