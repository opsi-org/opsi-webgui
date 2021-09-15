<template>
  <b-container fluid>
    <p v-if="error">
      {{ errortext }}
    </p>
    <b-table
      v-else
      :busy="isBusy"
      :stacked="stacked"
      borderless
      :items="tableitems"
      :fields="tablefields"
    >
      <template #table-busy>
        <IconILoading />
      </template>
      <template #cell(opsiHostKey)="row">
        <b-input-group>
          <b-form-input v-model="row.item.opsiHostKey" :class="{'d-none' : !showValue}" size="sm" readonly />
          <b-button :pressed.sync="showValue" size="sm" variant="outline-primary">
            <b-icon v-if="showValue" icon="eye-slash" />
            <b-icon v-else icon="eye" />
          </b-button>
        </b-input-group>
      </template>
      <template #cell(notes)="row">
        <b-form-textarea
          v-model="row.item.notes"
          size="sm"
          rows="2"
          max-rows="3"
          no-resize
          readonly
        />
      </template>
      <template #cell()="row">
        <b-form-input v-model="row.value" size="sm" readonly />
      </template>
    </b-table>
  </b-container>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'

@Component
export default class TSimple extends Vue {
  @Prop({ }) tableitems!: Array<object>
  @Prop({ }) tablefields!: Array<string>
  @Prop({ }) stacked!: boolean
  @Prop({ }) isBusy!: boolean
  @Prop({ }) error!: boolean
  @Prop({ }) errortext!: string
  showValue : boolean = false
}
</script>
