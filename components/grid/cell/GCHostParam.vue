<template>
  <div>
    <b-form-checkbox
      v-if="configtype === 'BoolConfig'"
      v-model="localval"
      data-testid="GCHostParamBool"
      @change="selectValue"
    />
    <TreeTSDefaultWithAdding
      v-else
      v-model="localval"
      data-testid="GCHostParamUnicode"
      class="treeselect_hostparam"
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
import { Component, Prop, Vue } from 'nuxt-property-decorator'

@Component
export default class GCHostParamVal extends Vue {
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

  async selectValue () {
    const change = { configId: this.row.configId, value: this.localval }
    await this.$emit('change', change)
  }
}
</script>

<style>
.treeselect_hostparam .vue-treeselect__control {
  background-color: var(--component, var(--background, black));
  color: var(--color, var(--light, white));
  border:1px solid var(--border, #ced4da );
}
.treeselect_hostparam .vue-treeselect__menu {
  background-color: var(--component, var(--background, black));
  color: var(--color, var(--light, white));
}
.treeselect_hostparam .vue-treeselect__single-value {
  color: var(--color, var(--light, white));
}
.treeselect_hostparam .vue-treeselect__input {
  color: var(--color) !important;
}
.treeselect_hostparam .vue-treeselect__menu .vue-treeselect__option--highlight {
  color: var(--color);
  background-color: var(--hover);
}
.treeselect_hostparam.vue-treeselect--single .vue-treeselect__option--selected{
  color: var(--light);
  background-color: var(--primary);
}
</style>
