<template>
  <div>
    <b-form-checkbox
      v-if="configtype === 'BoolConfig'"
      v-model="localval"
    />
    <TreeTSDefaultWithAdding
      v-else
      v-model="localval"
      :multiple="row.multiValue"
      :editable="row.editable"
      :options="options"
      :no-results-text="row.editable? $t('No results found... Press enter to add') : $t('No results found.')"
      @new-node="addNewValue"
    />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'

@Component
export default class TCUnicodeParam extends Vue {
  @Prop() row!: any
  @Prop() type!: String
  @Prop() configtype!: String
  hide: boolean = true
  options: Array<object> = []
  localval:any

  beforeMount () {
    const possiblevalues: any = []
    for (const val in this.row.possibleValues) {
      const v = this.row.possibleValues[val]
      possiblevalues.push({ id: v, label: v })
    }
    this.options = possiblevalues
    this.localval = this.getlocalvalue()
  }

  getlocalvalue () {
    if (this.type === 'clients') {
      if (this.row.clients) {
        const val: any = Object.values(this.row.clients)[0]
        if (this.row.multiValue) {
          return val
        } else {
          return val[0]
        }
      } else {
        return this.row.defaultValue
      }
    } else {
      return this.row.value
    }
  }

  addNewValue (newval:any) {
    if (this.row.editable) {
      const value = newval.text
      this.options = [...this.options, { id: value, label: value }]
      if (this.row.multiValue) {
        this.localval.push(value)
      } else {
        this.localval = value
      }
    }
  }
}
</script>

<style>
</style>
