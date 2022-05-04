<template>
  <b-form-checkbox
    v-model="multiselect"
    data-testid="CBMultiselection"
    class="CBMultiselection"
    size="sm"
    switch
    @change="$emit('update:multiselect', multiselect)"
  >
    {{ $t('button.multiselection') }}
    <span class="sr-only">{{ multiselect ? $t('button.multiselectEnable'): $t('button.multiselectDisable') }}</span>
  </b-form-checkbox>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'

@Component
export default class CBMultiSelection extends Vue {
  @Prop() multiselect!: boolean
}
</script>

<style>
.CBMultiselection {
  margin-top: 8px;
  margin-right: 8px;
}
</style>
