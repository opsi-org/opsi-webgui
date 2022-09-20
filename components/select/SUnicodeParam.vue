<template>
  <div>
    <!-- {{ row }} -->
    <b-row>
      <b-col>
        <b-form-select v-model="localval" :multiple="row.multiValue" :options="row.possibleValues" />
      </b-col>
      <b-col v-if="row.editable">
        <b-form-input v-model="newVal" :placeholder="$t('Type new value and press ENTER')" />
      </b-col>
    </b-row>
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
        if (this.row.multiValue) {
          return Object.values(this.row.clients)[0]
        } else {
          return Object.values(this.row.clients)[0][0]
        }
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
