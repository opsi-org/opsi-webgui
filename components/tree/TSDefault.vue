<template>
  <div :class="{'form-control':true, 'form-inline':true, 'TSDefault-wrapper':true, [type]:true , 'is-origin': isOrigin, 'has-counter':showSelectionCount===true}">
    <b-icon v-if="icon" :icon="icon" variant="transparent" font-scale="1.5" />
    <IconILoading v-if="$fetchState.pending" :small="true" />
    <ModalMSelections
      v-else-if="showSelectionCount===true"
      :id="id"
      :type="type"
      :selections="selectionDefault"
    />
    <TreeTSDefaultWithAdding
      :id="`id-select-${id}`"
      :ref="`id-select-${id}`"
      v-model="selectionWrapper"
      :flat="flat"
      :placeholder="placeholderWrapper"
      class="treeselect"
      :class="{ 'disable-roots': disableRootObjects, [type]:true, 'search-filled': treeselectSearchQueryFilled }"
      :searchable="!lazyLoad"
      :editable="editable"
      :loading-text="$t('message.loading')"
      :clearable="clearable"
      :multiple="multi"
      :options="options"
      :open-on-focus="false"
      :branch-nodes-first="true"
      :max-height="400"
      :always-open="false"
      :disabled="disabled"

      :cache-options="false"
      :normalizer="normalizer"
      :load-options="loadOptionsChildren"
      :no-results-text="
        textNoResult
          ? textNoResult
          : $t(editable? 'treeselect.noResultTextEditable': 'treeselect.noresult')
      "
      :limit="limitVisibleSelection"
      :limit-text="(limitVisibleSelection<=0)? ()=>'' : (count) => $t('treeselect.limitText', { count })"

      :value-format="valueFormat"
      :value-consists-of="valueConsistsOf"

      @search-not-empty="treeselectSearchQueryChanged"
      @new-node="selectWrapper"
      @select="selectWrapper"
      @deselect="deselectWrapper"
    >
      <div
        v-if="limitVisibleSelection>0 && multi"
        slot="value-label"
        slot-scope="{ node }"
        :class="{
          'form-control is-invalid':
            validate && node.label ? !validate(node.label) : false,
        }"
      >
        {{ Array.isArray(node.label) ? node.label[0] : node.label }}
      </div>
      <div slot="before-list">
        <ButtonBTNClearSelection
          v-if="multi && !treeselectSearchQueryFilled"
          class="BTN-before-list"
          :disabled="selection.length<=0"
          :clearselection="clearSelected"
        />
        <ButtonBTNReset
          v-if="!isOrigin"
          class="BTN-before-list"
          :action="resetSelected"
        />
      </div>
      <div
        slot="option-label"
        slot-scope="{ node }"
        :class="{
          'test':true,
          'form-control is-invalid':
            validate && node.label ? !validate(node.label) : false,
        }"
      >
        <div :ref="'tree-item-'+node.id">
          <b-icon v-if="node.isBranch||false" :icon="iconnames.group" :class="(node.raw.hasAnySelection)? 'hasSelection':''" />
          <b-icon v-else :icon="(type === 'products') ? iconnames.product: (type=='clients') ? iconnames.client: (type==='depots') ? iconnames.depot:''" />
          <small v-if="type=='depots' && node.label===opsiconfigserver"> <b> {{ node.label }} </b></small>
          <small v-else> {{ node.label }} </small>
        </div>
      </div>
    </TreeTSDefaultWithAdding>
  </div>
</template>

<script lang="ts">
import { Component, namespace, Prop, Watch, Vue } from 'nuxt-property-decorator'
import { Constants } from '../../mixins/uib-mixins'

const cache = namespace('data-cache')

interface Group {
  id: string
  text: string
  isBranch?: boolean
  type: string
  isDisabled?: boolean
  isNew?: boolean
  hasAnySelection?: boolean
  children?: null | Array<any>
}
interface StoreSelection {
  selection: Array<string>
  pushSelection: Function
  delSelection: Function
}

@Component({ mixins: [Constants] })
// export default class TSDefault extends mixins(Constants) {
export default class TSDefault extends Vue {
  iconnames: any // from mixin
  node: any
  $axios: any
  $fetch: any
  $fetchState: any

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
  @Prop({ default: true }) showSelectionCount!: boolean
  @Prop({ default: false }) disabled!: boolean
  @Prop({ default: false }) clearable!: boolean
  @Prop({ default: true }) isOrigin!: boolean
  @Prop({ default: false }) multi!: boolean
  @Prop({ default: false }) editable!: boolean
  @Prop({ default: false }) lazyLoad!: boolean
  @Prop({ default: false }) flat!: boolean
  @Prop({ default: true }) isList!: boolean
  @Prop({ default: false }) nested!: boolean
  @Prop({ default: false }) disableRootObjects!: boolean
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
  treeselectSearchQueryFilled:boolean = false

  @cache.Getter public opsiconfigserver!: Array<string>

  async fetch () {
    // console.warn(this.id, 'TSDefault fetch')
    this.$fetchState.pending = true
    // this.data = []
    this.data = await this.fetchData()
    this.updateLocalFromParent()
    this.syncWrapper()
    this.selection = [...this.selection] // needed for deselection
    this.$fetchState.pending = false
    // console.log(this.id + ' TSDefault fetch end')
  }

  @Watch('selectionDefault', { deep: true }) async selectionChanged () {
    // console.log(this.id + ' TSDefault selectionDefaultChanged this.selection ', JSON.stringify(this.selection))
    // console.log(this.id + ' TSDefault selectionDefaultChanged this.selectionDefault ', JSON.stringify(this.selectionDefault))
    // console.log(this.id + ' TSDefault selectionDefaultChanged this.selectionWrapper ', JSON.stringify(this.selectionWrapper))
    await this.$fetch()
  }

  get selection () { return this.model[(this.nested) ? 'nested' : 'default'] }
  set selection (s) { this.model[(this.nested) ? 'nested' : 'default'] = s }
  // can be overwritten by children
  set selectionWrapper (s) { (Array.isArray(s)) ? this.selection = s : this.selection = [s] }
  get selectionWrapper () { return this.selection }
  get placeholderWrapper () {
    if (this.multi && !this.text) { return '' }
    let txt = this.text ? this.text : '' + this.selectionWrapper
    if (!this.isOrigin) { txt += ' * ' }
    return txt
  }

  treeselectSearchQueryChanged (filled) { this.treeselectSearchQueryFilled = filled }

  syncWrapper () {
    // console.log(this.id + ' TSDefault syncWrapper')
    if (this.syncFunction) { // e.g. from TSDefaultGroups
      this.syncFunction(this.selection, this.options)
    }
  }

  selectWrapper (s:any) {
    this.$fetchState.pending = true
    // console.log(this.id + ' TSDefault selectWrapper TRY select: ', JSON.stringify(s))
    if (this.selectFunction) { // e.g. from TSDefaultGroups
      this.selectFunction(s, this)
      this.syncWrapper()
    } else { this.selectDefault(s) }
    this.$fetchState.pending = false
  }

  deselectWrapper (s:any) {
    // console.log(this.id + ' -----------------TSDefault deselectWrapper ', this.editable, this.multi)
    if (!this.editable && !this.multi) { return }
    this.$fetchState.pending = true
    // console.log(this.id + ' TSDefault deselectWrapper TRY deselect: ', JSON.stringify(s))
    if (this.deselectFunction) { // e.g. from TSDefaultGroups
      this.deselectFunction(s, this)
      this.syncWrapper()
    } else { this.deselectDefault(s) }
    this.$fetchState.pending = false
  }

  updateLocalFromParent (updateOptions = true, updateSelections = true) {
    // console.log(this.id + ' TSDefault updateLocalFromParent')
    if (updateOptions) {
      if (this.isList === false) {
        this.options = [...this.data]
        return
      }

      // build treestructure from list
      this.options.length = 0
      this.data.forEach((element) => { this.options.push({ id: element, text: element, type: 'ObjectToGroup' }) })
      if (this.nested) { return }

      // const resultObjects = []
      // for (const sitem in this.selectionDefault) {
      //   filterObject(this.options, sitem, 'id', resultObjects)
      // }

      // if its not nested: add selection to options if not already inside (e.g. newValue)
      const optionIds = this.options.map((e:any) => e.id)
      for (const i in this.selectionDefault) {
        const s = this.selectionDefault[i]
        if (!optionIds.includes(s)) {
          const elem = { id: s, text: s, type: 'ObjectToGroup', isNew: true }
          this.options.push(elem)
        }
      }
    }
    if (updateSelections && !this.nested) { // not TSDefaultGroups
      // console.log(this.id, ' updateLocal ', this.selection)
      this.selection = [...this.selectionDefault]
    }
  }

  normalizer (node: Group) {
    return {
      id: node.id,
      type: node.type,
      isNew: node.isNew || false,
      hasAnySelection: node.hasAnySelection || false,
      isBranch: node.type === 'HostGroup' || node.type === 'ProductGroup' || node.isBranch || false,
      isDisabled: (node.isDisabled === true) || (node.id === this.$t('values.mixed')) || false,
      // isDefaultExpanded: node.hasAnySelection || false,
      label: node.text ? node.text.replace(/_+$/, '') : node.id,
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
    if (!node.children) { return node.children } // null/undefined

    if (node.type === 'ProductGroup') {
      // console.log('access PG chilren')
      return Object.values(node.children)
    }
    return node.children
  }

  async loadOptionsChildren ({ action, parentNode, callback }: any) {
    // loadchildren only for hostgroups
    // console.log(this.id + ' TSDefault loadchildren parentNode ', parentNode.id)
    if (this.lazyLoad !== true) {
      callback()
      return
    }
    if (action === 'LOAD_CHILDREN_OPTIONS') {
      this.$fetchState.pending = true
      const c = await this.fetchChildren(parentNode)
      if (c) {
        // console.log(this.id + ' TSDefault loadchildren result != undefined', c)
        parentNode.children = Array.isArray(c) ? c : Object.values(c)
      }
      if (parentNode.text === 'clientlist' && parentNode.parent == null) {
        // console.log(this.id + ' TSDefault loadchildren clientlist children are', parentNode.children)
      }

      this.syncWrapper()
      callback()
      this.$fetchState.pending = false
    }
  }

  selectDefault (s: any) {
    // console.log(this.id + ' TSDefault selectDefault s', s)
    if (!s) { return }

    if (!Array.isArray(this.selectionWrapper)) {
      this.selectionWrapper = [this.selectionWrapper]
    }
    if (Object.keys(s).length <= 0) {
      // console.log(this.id + ' TSDefault selectDefault why?')
      this.selectionWrapper = []
    }
    if (this.selectionWrapper.includes(s.text)) {
      // console.log(this.id + ' TSDefault selectDefault deselect')
      this.deselectDefault(s)
      return
    }
    // select element
    if (!this.nested && !Object.values(this.options.map((o:any) => o.id)).includes(s.id)) {
      // this.options.push(s)
      this.options = [...this.options, s]
      // console.log(this.id + ' TSDefault selectDefault new item to options', JSON.stringify(this.options))
    }
    if (!this.multi) {
      // console.log(this.id + ' TSDefault selectDefault not multi')
      this.selectionWrapper.length = 0
    }
    console.log(this.options, ' includes ', s)
    if (this.selectionWrapper.includes(this.$t('values.mixed')) && s.text !== this.$t('values.mixed')) {
      this.selectionWrapper = [s.text]
    } else {
      this.selectionWrapper.push(s.text)
    }
    // console.log(this.id + ' TSDefault selectDefault add to selectionWrapper', JSON.stringify(this.selectionWrapper))
    this.$emit('change', this.selectionWrapper)
  }

  deselectDefault (deselection: any, isObject = false) {
    // console.log(this.id + ' -----------------TSDefault deselectDefault ', this.editable, this.multi)
    if (!this.editable && !this.multi) { return }

    // console.log(this.id + ' TSDefault deselectDefault ', deselection, this.selection)
    if (this.selectionWrapper.includes(deselection.text) || this.selectionWrapper.includes(deselection)) {
      if (isObject || this.selectionWrapper.includes(deselection.text)) {
        this.selectionWrapper.splice(this.selectionWrapper.indexOf(deselection.text), 1) // deleting
      } else {
        this.selectionWrapper.splice(this.selectionWrapper.indexOf(deselection), 1) // deleting
      }
      this.$emit('change', this.selectionWrapper)
      // await this.$fetch()
    }
  }

  clearSelected () {
    // console.log(this.id + ' TSDefault clearSelected')
    this.selectionWrapper = []
    this.$emit('change', this.selectionWrapper)
  }

  resetSelected () {
    // console.log(this.id + ' TSDefault resetSelected')
    // this.$fetch()
    this.$emit('change', this.selectionDefault, true)
  }

  isGroup (s) {
    return s.isBranch === true || ['HostGroup', 'ProductGroup'].includes(s.type)
  }
}
</script>

<style>

/* hide checkbox and disable click for hostgroups: groups, clientdirectory, clientlist (need to have .disable-roots class)*/
.TSDefault-wrapper .treeselect.disable-roots .vue-treeselect__indent-level-0 >.vue-treeselect__option > .vue-treeselect__label-container > .vue-treeselect__checkbox-container { display:none }
.TSDefault-wrapper .treeselect.disable-roots .vue-treeselect__indent-level-0 >.vue-treeselect__option > .vue-treeselect__label-container {
  cursor: not-allowed;
  pointer-events: none;
  /* color: var(--dark); */
  color: var(--color, var(--dark, inherit));
}

/* hide checkbox and disable click for hostgroups: groups, clientdirectory, clientlist (need to have .disable-roots class)*/
.TSDefault-wrapper .treeselect.disable-roots .vue-treeselect__indent-level-0 >.vue-treeselect__option--highlight > .vue-treeselect__label-container > .vue-treeselect__checkbox-container { display:none }

.TSDefault-wrapper .treeselect.disable-roots .vue-treeselect__indent-level-0 >.vue-treeselect__option--highlight > .vue-treeselect__label-container {
  color: var(--color);
}

.TSDefault-wrapper,
.TSDefault-wrapper .treeselect,
.TSDefault-wrapper .vue-treeselect__menu-container,
.TSDefault-wrapper .vue-treeselect__menu {
  background-color: var(--component, inherit);
}

.TSDefault-wrapper .vue-treeselect__menu .vue-treeselect__option--highlight {
  /* color: white;
  background-color: var(--primary); */
  color: var(--color);
  background-color: var(--hover);
}

/* .TSDefault-wrapper .hasSelection {
  color: var(--primary);
} */

/* .TSDefault-wrapper .vue-treeselect__menu .vue-treeselect__option--highlight .hasSelection{
  color: var(--light) !important;
} */

.TSDefault-wrapper .vue-treeselect__menu {
  border: 1px solid var(--primary) !important;
  /* border-radius: 5px; */
}

.form-inline{
  flex-flow: nowrap;
}
.TSDefault-wrapper:not(.is-origin) {
  border: 1px solid var(--orange);
}
.TSDefault-wrapper{
  /* border: 1px solid var(--primary); */
  border-radius: 5px;
  min-width: 200px !important;
  max-width: 200px !important;
  flex-flow: inherit !important;
  padding-left: 10px;
  padding-right: 15px;
  margin-right: 10px;
  line-height: 1.5 !important;
  min-height: 40px !important;
}
.TSDefault-wrapper.propertyvalues {
  max-width: 100% !important;
  width: 100% !important;
}
.TSDefault-wrapper .treeselect .BTN-before-list{
  width: 100% !important;
  text-align: left;
}
.TSDefault-wrapper .treeselect .vue-treeselect__option--disabled .vue-treeselect__label-container{
  cursor: pointer;
  color: inherit !important;
}
.TSDefault-wrapper .treeselect .vue-treeselect__placeholder {
  max-height: max-content !important;
  padding-bottom: 5px;
  margin-top: -6px !important;
  /* color: inherit !important; */
  color: var(--color, var(--dark, inherit));
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
  background-color: var(--component, var(--background, inherit));
  color: var(--color, var(--light, inherit));
}

.TSDefault-wrapper .treeselect {
  max-width: max-content !important;
  max-height: 20px;
  width: 72% !important;
  cursor: pointer;
}
.TSDefault-wrapper .treeselect.propertyvalues {
  max-width: calc(100% - 10px) !important;
  width: calc(100% - 10px) !important;
}
.TSDefault-wrapper.propertyvalues.has-counter .treeselect.propertyvalues {
  max-width: calc(100% - 32px) !important;
  width: calc(100% - 32px) !important;
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
  padding-bottom: 5px;
}
.TSDefault-wrapper .treeselect.treeselect.propertyvalues .vue-treeselect__input-container {
  margin-left: 0px;
  max-width: 100%;
}
.TSDefault-wrapper .treeselect .vue-treeselect__input {
  width: 100%;
  max-width: 100%;
  margin-top: 5px;
  color: var(--color) !important;
}
/* .TSDefault-wrapper .vue-treeselect__value-container, */
.TSDefault-wrapper .treeselect .vue-treeselect__multi-value {
  margin-bottom: 0px !important;
  background-color: var(--component, inherit);
}

.TSDefault-wrapper .treeselect.search-filled .vue-treeselect__multi-value-item,
.TSDefault-wrapper .treeselect.search-filled .vue-treeselect__single-value,
.TSDefault-wrapper .treeselect.search-filled .vue-treeselect__placeholder,
.TSDefault-wrapper .treeselect.search-filled.propertyvalues .vue-treeselect__limit-tip,
.TSDefault-wrapper .treeselect:not(.propertyvalues) .vue-treeselect__multi-value-item-container :not(.vue-treeselect__placeholder),
.TSDefault-wrapper .treeselect .vue-treeselect__icon.vue-treeselect__value-remove {
  display: none !important;
}
.TSDefault-wrapper .treeselect .vue-treeselect__multi-value-item {
  cursor: not-allowed;
  pointer-events: none;
}
.TSDefault-wrapper .treeselect .vue-treeselect__single-value,
.TSDefault-wrapper .treeselect .vue-treeselect__multi-value {
  margin-top: -5px;
}
.TSDefault-wrapper .treeselect .vue-treeselect__multi-value-item.vue-treeselect__multi-value-item,
.TSDefault-wrapper .treeselect .vue-treeselect__multi-value-item.vue-treeselect__multi-value-item-new {
  background: var(--primary);
  color: var(--light);
  min-height: 20px;
}
.TSDefault-wrapper .treeselect.propertyvalues .vue-treeselect__multi-value-item-container :not(.vue-treeselect__placeholder) {
  max-height: 20px;
  white-space: normal;
}

</style>
