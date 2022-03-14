<template>
  <div class="form-inline TSDefault-wrapper" style="margin-right: 30px">
    <b-icon :icon="icon" variant="transparent" font-scale="1.5" />

    <ModalMSelections
      :type="type"
      :selections="selectionDefault"
    />
    <TreeTSDefaultWithAdding
      :id="`id-select-${id}`"
      v-model="selectionWrapper"
      :flat="flat"
      :placeholder="text ? text
        : lazyLoad? '' : $t(editable ? 'client.dropdown.searchOrAdd' : 'client.dropdown.search')
      "
      class="treeselect"
      :searchable="!lazyLoad"
      :editable="editable"
      :clearable="clearable"
      :multiple="multi"
      :options="options"
      :open-on-focus="true"
      :branch-nodes-first="true"
      :max-height="400"
      :always-open="false"

      :cache-options="false"
      :normalizer="normalizer"
      :auto-load-root-options="type!='clients'"
      :load-options="loadOptionsChildren"
      :limit="limitVisibleSelection"
      :limit-text="(limitVisibleSelection<=0)? ()=>'' : (count) => $t('components.treeselect .limitText', { count })"
      :no-results-text="
        textNoResult
          ? textNoResult
          : $t(editable? 'client.dropdown.noResultTextEditable': 'client.dropdown.noResultText')
      "
      :value-format="valueFormat"
      :value-consists-of="valueConsistsOf"

      @new-node="selectWrapper"
      @select="selectWrapper"
      @deselect="deselectWrapper"
    >
      <div
        v-if="limitVisibleSelection>0"
        slot="value-label"
        slot-scope="{ node }"
        :class="{
          'form-control is-invalid':
            validate && node.label ? !validate(node.label) : false,
        }"
      >
        {{ Array.isArray(node.label) ? node.label[0] : node.label }}
      </div>

      <div
        v-if="multi"
        slot="before-list"
      >
        <ButtonBTNClearSelection
          v-if="selection.length>0"
          :clearselection="clearSelected"
          label="Clear Selection"
        />
      </div>
      <div
        slot="option-label"
        slot-scope="{ node }"
        :class="{
          'form-control is-invalid':
            validate && node.label ? !validate(node.label) : false,
        }"
      >
        <!-- @click="alert('hi')" -->
        <div :ref="'tree-item-'+node.id">
          <b-icon v-if="node.isBranch||false" icon="diagram2" />
          <b-icon v-else :icon="type === 'products' ? 'grid-fill':'laptop'" />
          <small> {{ node.label }} </small>
        </div>
      </div>
    </TreeTSDefaultWithAdding>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'nuxt-property-decorator'
import { filterObject } from '../../.utils/utils/sfilters'

interface Group {
  id: string
  text: string
  isBranch?: boolean
  type: string
  isDisabled?: boolean
  isNew?: boolean
  children?: null | Array<any>
}
interface StoreSelection {
  selection: Array<string>
  pushSelection: Function
  delSelection: Function
}

@Component
export default class TSDefault extends Vue {
  node: any
  $axios: any

  @Prop({}) selectionDefault!: Array<string>
  @Prop({}) type!: string
  @Prop({}) id!: string
  @Prop({}) text!: string
  @Prop({}) textNoResult!: string
  @Prop({}) validate!: Function
  @Prop({}) validateDescription!: string
  @Prop({}) icon!: string
  @Prop({ default: 'id' }) valueFormat!: string
  @Prop({ default: 'LEAF_PRIORITY' }) valueConsistsOf!: string
  @Prop({ default: '' }) placeholder?: string
  @Prop({ default: 0 }) limitVisibleSelection!: number
  @Prop({ default: false }) clearable!: boolean
  @Prop({ default: false }) multi!: boolean
  @Prop({ default: false }) editable!: boolean
  @Prop({ default: false }) lazyLoad!: boolean
  @Prop({ default: false }) flat!: boolean
  @Prop({ default: true }) isList!: boolean
  @Prop({ default: false }) nested!: boolean
  @Prop({ default: () => {} }) store!: StoreSelection
  @Prop({ default: () => { return ['empty'] } }) fetchData!: Function
  @Prop({ default: () => { return [] } }) fetchChildren!: Function
  @Prop({}) selectFunction?: Function
  @Prop({}) deselectFunction?: Function
  @Prop({}) syncFunction?: Function

  searchText: string = ''
  model: object = { default: [], nested: [] }
  options: Array<Group> = []
  data!: Array<any> // to be fetched

  async fetch () {
    this.data = await this.fetchData()
    this.updateLocalFromParent()
    this.syncWrapper()
  }

  mounted () {
    this.syncWrapper()
  }

  @Watch('selectionDefault', { deep: true }) selectionChanged () {
    this.syncWrapper()
  }

  get selectionWrapper () { // can be overwritten by children
    return this.selection
  }

  set selectionWrapper (s) { // can be overwritten by children
    this.selection = s
  }

  get selection () {
    console.log('TSDefault get selection ', (this.nested) ? 'nested' : 'default')
    return this.model[(this.nested) ? 'nested' : 'default']
  }

  set selection (s) {
    console.log('TSDefault set selection ', (this.nested) ? 'nested' : 'default')
    this.model[(this.nested) ? 'nested' : 'default'] = s
  }

  syncWrapper () {
    console.log('syncWrapper')
    if (this.syncFunction) {
      this.syncFunction({ selection: this.selectionWrapper, options: this.options })
    }
  }

  selectWrapper (s:any) {
    if (this.selectFunction) {
      this.selectFunction(s, this)
    } else { this.selectDefault(s) }
  }

  deselectWrapper (s:any) {
    if (this.deselectFunction) {
      this.deselectFunction(s, this)
    } else { this.deselectDefault(s) }
  }

  updateLocalFromParent (updateOptions = true, updateSelections = true) {
    if (updateOptions) {
      if (this.isList === false) {
        this.options = [...this.data]
      } else {
        this.options.length = 0
        this.data.forEach((element) => {
          this.options.push({ id: element, text: element, type: 'ObjectToGroup' })
        })
        if (!this.nested) {
          const resultObjects = []
          for (const sitem in this.selectionDefault) {
            filterObject(this.data, sitem, 'id', resultObjects)
          }

          // only one level
          const optionIds = this.options.map((e:any) => e.id)
          for (const s in resultObjects) {
            if (!optionIds.includes(resultObjects[s])) {
              const elem = {
                id: resultObjects[s],
                text: resultObjects[s],
                type: 'ObjectToGroup',
                isNew: true
              }
              this.options.push(elem)
            }
          }
        }
      }
    }
    if (updateSelections && !this.nested) {
      this.selection = [...this.selectionDefault]
    }
  }

  normalizer (node: Group) {
    return {
      id: node.id,
      type: node.type,
      isNew: node.isNew || false,
      isBranch: node.type === 'HostGroup' || node.type === 'ProductGroup' || node.isBranch || false,
      isDisabled: (node.isDisabled === true) || false,
      label: node.text ? node.text.replace(/_+$/, '') : node.id,
      // children: node.children
      //   ? this.getChildren(node).sort(function (a: Group, b: Group) {
      //     if (a.text < b.text) { return -1 }
      //     if (a.text > b.text) { return 1 }
      //     return 0
      //   })
      //   : {}
      children: this.lazyLoad
        ? this.getChildren(node)
        : node.children
          ? this.getChildren(node).sort(function (a: Group, b: Group) {
            if (a.text < b.text) { return -1 }
            if (a.text > b.text) { return 1 }
            return 0
          })
          : {}
    }
  }

  getChildren (node) {
    if (!node.children) {
      return node.children
    }

    if (node.type === 'ProductGroup') {
      return Object.values(node.children)
    }
    return node.children
  }

  async loadOptionsChildren ({ action, parentNode, callback }: any) {
    console.log('loadchildren?')
    if (this.lazyLoad !== true) {
      callback()
      return
    }
    if (action === 'LOAD_CHILDREN_OPTIONS') {
      parentNode.children = await this.fetchChildren(parentNode)
      // const children = await this.fetchChildren(parentNode)
      // parentNode.children = children.map(n => { const nn= this.normalizer(n); console.log(nn); return nn })
      this.syncWrapper()
      callback()
    }
  }

  selectDefault (s: any) {
    console.log('TSDefault s', s)
    if (!s) {
      return
    }

    if (!Array.isArray(this.selection)) {
      this.selection = [this.selection]
    }
    if (Object.keys(s).length <= 0) {
      console.log('why?')
      this.selection = []
    }
    if (!this.selection.includes(s.id)) {
      if (!this.nested && !Object.values(this.options.map((o:any) => o.id)).includes(s.id)) {
        console.log('new item')
        this.options.push(s)
      }
      if (!this.multi) {
        console.log('not multi')
        this.selection.length = 0
      }
      // console.log(this.options, ' includes ', s)
      this.selection.push(s.text)
      console.log('add to selection', JSON.stringify(this.selection))
    } else {
      console.log('deselect')
      this.deselectDefault(s)
    }
    this.$emit('change', this.selection)
  }

  deselectDefault (deselection: any, isObject = false) {
    console.log('TSDefault deselect')
    if (this.selection.includes(deselection.id) || this.selection.includes(deselection)) {
      if (isObject) {
        this.selection.splice(this.selection.indexOf(deselection.id), 1) // deleting
      } else {
        this.selection.splice(this.selection.indexOf(deselection), 1) // deleting
      }
      this.$emit('change', this.selection)
    }
  }

  clearSelected () {
    console.log('TSDefault clearSelected')
    this.selection = []
    this.$emit('change', this.selection)
  }
}
</script>

<style>

.form-inline{
  flex-flow: nowrap;
}
/* .treeselect .vue-treeselect__placeholder {
    color: gray;
} */
.TSDefault-wrapper{
  border: 1px solid #ddd;
  border-radius: 5px;
  min-width: 100px !important;
  max-width: 200px !important;
  /* border: 1px solid green; */
  padding-left: 10px;
  padding-right: 15px;
}
.TSDefault-wrapper .treeselect .vue-treeselect__option--disabled .vue-treeselect__label-container{
  cursor: pointer;
  color: black;
}
.TSDefault-wrapper .treeselect .vue-treeselect__placeholder {
  max-height: max-content !important;
  padding-bottom: 0px;
  margin-top: -6px !important;
}
.TSDefault-wrapper .treeselect .vue-treeselect-helper-hide,
.TSDefault-wrapper .treeselect .vue-treeselect__control-arrow-container {
  display: inline !important;
}
.TSDefault-wrapper .treeselect .vue-treeselect__control{
  max-height: 10px !important;
  height: 10px !important;
  margin-top: 0px !important;
  padding-top: 0px !important;
  padding-left: 0px !important;
  padding-right: 0px !important;
  background: transparent !important;
}
.TSDefault-wrapper .treeselect {
  max-width: max-content !important;
  max-height: 20px;
  width: 72% !important;
}
.TSDefault-wrapper .treeselect > .vue-treeselect__control{
  border: none !important;
  border-radius: 0px !important;
}
.TSDefault-wrapper .treeselect .vue-treeselect__menu {
  min-width: 380px !important;
  margin-left: -52px;
  margin-top: 8px;
}

.TSDefault-wrapper .treeselect .vue-treeselect__input-container {
  margin-left: 55px;
  margin-top: -5px;
  max-width: 50px;
}
.TSDefault-wrapper .treeselect .vue-treeselect__multi-value {
  margin-bottom: 0px !important;
}
.TSDefault-wrapper .treeselect .vue-treeselect__multi-value-item-container :not(.vue-treeselect__placeholder) {
  display: none;
}
/* .treeselect .vue-treeselect-helper-hide {
  display: inline;
} */
/* .TSDefault-wrapper .selection_badge {
  margin-top: 20px;
} */
</style>
