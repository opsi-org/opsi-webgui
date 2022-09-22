<template>
  <b-form-checkbox
    v-model="localboolval"
    data-testid="CBBoolParam"
    class="CBBoolParam"
    @change="updateBoolConfig"
  />
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'

@Component
export default class CBBoolParam extends Vue {
  @Prop() row!: any
  @Prop() type!: String
  localboolval:boolean = false

  beforeMount () {
    this.localboolval = this.getlocalvalue()
  }

  getlocalvalue () {
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

  updateBoolConfig () {
    const newConfig = { configId: this.row.configId, value: this.localboolval }
    this.$emit('update:boolconfig', newConfig)
  }
}
</script>

<style>
</style>
