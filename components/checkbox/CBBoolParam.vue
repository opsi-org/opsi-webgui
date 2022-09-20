<template>
  <b-form-checkbox
    v-model="localboolval"
    data-testid="CBBoolParam"
    class="CBBoolParam"
    @change="$emit('update:boolval', localboolval)"
  />
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'

@Component
export default class CBBoolParam extends Vue {
  @Prop() row!: any
  @Prop() type!: String
  get localboolval () {
    if (this.type === 'clients') {
      if (this.row.clients) {
        return Object.values(this.row.clients)[0]
      } else {
        return this.row.defaultValue
      }
    } else {
      return this.row.value
    }
  }
}
</script>

<style>
</style>
