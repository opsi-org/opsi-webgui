<template>
  <b-form-checkbox v-model="checked" class="multiselect" size="sm" switch @change="$emit('update:multiselect', checked)">
    Multiselection
  </b-form-checkbox>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'

@Component
export default class CBMultiSelection extends Vue {
  checked: boolean = false
}
</script>

<style>
.multiselect {
  margin-top: 8px;
  margin-right: 8px;
}
</style>
