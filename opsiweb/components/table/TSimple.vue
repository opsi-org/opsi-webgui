<template>
  <b-container fluid>
    <p v-if="error">
      {{ errortext }}
    </p>
    <!-- :show-empty="error" -->
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
      <!-- <template #empty>
        {{ errortext }}
      </template> -->
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
export default class TSimple extends Vue {
  @Prop({ }) tableitems!: Array<object>
  @Prop({ }) tablefields!: Array<string>
  @Prop({ }) stacked!: boolean
  @Prop({ }) isBusy!: boolean
  @Prop({ default: 'label' }) labelKey?: boolean
  @Prop({ default: 'value' }) valueKey?: boolean
  @Prop({ default: false }) small?: boolean
  @Prop({ default: true }) valueIsInputField?: boolean
  hideValue : boolean = false
  @Prop({ }) error!: boolean
  @Prop({ }) errortext!: string
  showValue : boolean = false
}
</script>
