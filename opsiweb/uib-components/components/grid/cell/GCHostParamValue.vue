<template>
  <div>
    <b-form-checkbox
      v-if="configtype === 'BoolConfig'"
      v-model="localval"
      :disabled="config?.read_only"
      data-testid="GCHostParamBool"
      @input="selectValue"
    />
    <TreeTSDefaultWithAdding
      v-else
      v-model="localval"
      :disabled="config?.read_only"
      data-testid="GCHostParamUnicode"
      class="treeselect_notstored treeselect"
      :multiple="row.multiValue"
      :editable="row.editable"
      :limit="1"
      :limit-text="(count) => $t('treeselect.limitText', { count })"
      :clearable="false"
      :options="options"
      :no-results-text="row.editable? $t('treeselect.editable') : $t('treeselect.noresult')"
      @new-node="addNewValue"
      @input="selectValue"
    />
  </div>
</template>

<script lang="ts">
import { Component, namespace, Prop, Vue } from 'nuxt-property-decorator'
import { IObjectString2Boolean } from '../../../.utils/types/tgeneral'
const config = namespace('config-app')

@Component
export default class GCHostParamVal extends Vue {
  @Prop() row!: any
  @Prop() type!: string
  @Prop() configtype!: string
  hide: boolean = true
  options: Array<object> = []
  localval:any
  @config.Getter public config!: IObjectString2Boolean

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
    if (this.type === 'clients' || this.type === 'depots') {
      if (this.row.objects) {
        const val: any = Object.values(this.row.objects)[0]
        return val
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

  selectValue () {
    const change = { configId: this.row.configId, value: this.localval }
    this.$emit('change', change)
  }
}
</script>
