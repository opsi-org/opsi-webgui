<template>
  <b-form-checkbox v-model="multiselect" class="multiselect" size="sm" switch @change="$emit('update:multiselect', multiselect)">
    Multiselection
    <span class="sr-only">{{ multiselect ? 'Enable multiselection': 'Disable multiselection' }}</span>
  </b-form-checkbox>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'

@Component
export default class CBMultiSelection extends Vue {
  // checked: boolean = false
  @Prop() multiselect!: boolean;
}
</script>

<style>
.multiselect {
  margin-top: 8px;
  margin-right: 8px;
}
</style>
