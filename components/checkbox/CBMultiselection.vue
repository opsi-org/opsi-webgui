<template>
  <b-form-checkbox v-model="checked" switch @change="$emit('update:multiselect', checked)">
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
