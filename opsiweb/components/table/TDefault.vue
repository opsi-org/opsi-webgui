<template>
  <b-container fluid>
    <b-table
      v-bind="$props"
      borderless
      :busy="isBusy"
      :stacked="stacked"
      :small="small"
      :items="tableitems"
      :fields="tablefields"
    >
      <template #table-busy>
        <IconILoading />
      </template>
      <template #cell(opsiHostKey)="row">
        <b-input-group>
          <b-form-input v-model="row.item.opsiHostKey" size="sm" readonly :type="hideValue ? 'text': 'password' " />
          <b-button :pressed.sync="hideValue" size="sm">
            <b-icon v-if="hideValue" icon="eye-slash" />
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
      <template v-if="valueIsInputField" #cell()="row">
        <b-form-input v-model="row[valueKey]" size="sm" readonly />
      </template>
      <template
        v-for="slotName in Object.keys($scopedSlots)"
        #[slotName]="slotScope"
      >
        <slot :name="slotName" v-bind="slotScope" />
      </template>
    </b-table>
  </b-container>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'

@Component
export default class TDefault extends Vue {
  @Prop({ }) tableitems!: Array<object>
  @Prop({ }) tablefields!: Array<string>
  @Prop({ }) stacked!: boolean
  @Prop({ }) isBusy!: boolean
  @Prop({ default: 'label' }) labelKey?: boolean
  @Prop({ default: 'value' }) valueKey?: boolean
  @Prop({ default: false }) small?: boolean
  @Prop({ default: true }) valueIsInputField?: boolean
  hideValue : boolean = false
}
</script>
