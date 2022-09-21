<template>
  <div>
    <b-input-group>
      <b-form-select v-model="localval" :multiple="row.multiValue" :options="row.possibleValues" />
      <b-button v-if="row.editable" v-b-tooltip.hover :pressed.sync="hide" variant="transparent" :title="$t('Add new value')">
        {{ $t('+') }}
      </b-button>
      <b-form-input :class="hide ? 'd-none' : 'd-block'" :placeholder="$t('Type new value and press ENTER here')" />
    </b-input-group>
    <!-- <treeselect v-if="row.multiValue || row.editable" v-model="localval" :multiple="row.multiValue" :options="options" />
    <b-form-select v-else v-model="localval" :options="options" /> -->
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'

@Component
export default class SUnicodeParam extends Vue {
  @Prop() row!: any
  @Prop() type!: String
  hide: boolean = true

  get localval () {
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

  // get localval () {
  //   let values: any = []
  //   if (this.type === 'clients') {
  //     if (this.row.clients) {
  //       values = Object.values(this.row.clients)[0]
  //     } else {
  //       values = this.row.defaultValue
  //     }
  //   } else {
  //     values = this.row.value
  //   }
  //   if (this.row.multiValue || this.row.editable) {
  //     const val: any = []
  //     if (values.length > 1) {
  //       for (const v in values) {
  //         const value = this.row.possibleValues[v]
  //         val.push({ id: value, label: value })
  //       }
  //       return val
  //     } else {
  //       return []
  //     }
  //   } else {
  //     return values
  //   }
  // }

  // get options () {
  //   if (this.row.multiValue || this.row.editable) {
  //     const possiblevalues: any = []
  //     for (const val in this.row.possibleValues) {
  //       const v = this.row.possibleValues[val]
  //       possiblevalues.push({ id: v, label: v })
  //     }
  //     return possiblevalues
  //   } else {
  //     return this.row.possibleValues
  //   }
  // }
}
</script>

<style>
</style>
