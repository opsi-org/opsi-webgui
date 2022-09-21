<template>
  <div>
    <span v-if="row.multiValue || row.editable"> {{ row }} OPTIONS::: {{ options }}</span>
    <b-form-select v-else v-model="localval" :options="options" />
    <!-- <b-form-select v-if="!row.multiValue && !row.editable" v-model="localval" :options="options" />
    <span v-else> {{ row }}</span> -->
    <!-- <treeselect :multiple="row.multiValue" :options="options" /> -->
    <!-- <b-row>
      <b-col>
        <b-form-select v-model="localval" :multiple="row.multiValue" :options="row.possibleValues" />
      </b-col>
      <b-col v-if="row.editable">
        <b-form-input v-model="newVal" :placeholder="$t('Type new value and press ENTER')" />
      </b-col>
    </b-row> -->
  </div>
  <!-- <b-form-checkbox
    v-model="localboolval"
    data-testid="CBBoolParam"
    class="CBBoolParam"
    @change="$emit('update:boolval', localboolval)"
  /> -->
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'

@Component
export default class SUnicodeParam extends Vue {
  @Prop() row!: any
  @Prop() type!: String

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

  get options () {
    if (this.row.multiValue || this.row.editable) {
      const possiblevalues: any = []
      for (const val in this.row.possibleValues) {
        const v = this.row.possibleValues[val]
        possiblevalues.push({ id: v, label: v })
      }
      return possiblevalues
    } else {
      return this.row.possibleValues
    }
  }
}
</script>

<style>
</style>
