<template>
  <div data-testid="TSDefault" :class="{'TSDefault-wrapper form-control d-flex flex-nowrap':true, [type]:true , 'is-origin': isOrigin, 'has-counter':showSelectionCount===true}">
    <b-icon v-if="icon" :icon="icon" variant="transparent" font-scale="1.5" />
    <IconILoading v-if="$fetchState.pending" :small="true" />
    <ModalMSelections
      v-else-if="multi && showSelectionCount===true"
      :id="id"
      :type="type"
      :selections="(type==='propertyvalues')?selectionWrapper:selectionDefault"
    />
    <!-- :always-open="(id=='PropertyValue-method')" -->
    <LazyTreeTSDefaultWithAdding
      v-if="options"
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
      :delete-removes="false"
      :backspace-removes="false"
      :multiple="multi"
      :options="options"
      :open-on-focus="false"
      :branch-nodes-first="true"
      :max-height="300"
      :always-open="false"
      :disabled="disabled"
      :cache-options="false"
      :normalizer="normalizer"
      :load-options="loadOptionsChildren"
      :no-results-text="textNoResult? textNoResult : $t('treeselect.noresult')"
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
        <b-button
          v-if="editable && treeselectSearchQueryFilled"
          variant="outline-primary"
          class="BTN-before-list border-0"
          :title="$t('button.tsdefault.add.tooltip')"
          @click="triggerSelection()"
        >
          <b-icon :icon="iconnames.add" />
          {{ $t('button.tsdefault.add') }}
        </b-button>
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
          <template v-if="type=='depots' && node.label===opsiconfigserver">
            <b> {{ node.label }} </b>
          </template>
          <template v-else>
            {{ node.label }}
          </template>
        </div>
      </div>
    </LazyTreeTSDefaultWithAdding>
  </div>
</template>

<script lang="ts">
import { Component, namespace, Prop, Watch, Vue } from 'nuxt-property-decorator'
import { Constants } from '../../mixins/uib-mixins'
// import { arrayEqual } from '../../.utils/utils/scompares'

const cache = namespace('data-cache')

interface Group {
  id: string
  text: string
  // isBranch?: boolean
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
  $t:any

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
  @Prop({ default: () => { return {} } }) store!: StoreSelection
  @Prop({ default: () => { return ['empty'] } }) fetchData!: Function
  @Prop({ default: () => { return [] } }) fetchChildren!: Function
  @Prop({}) selectFunction?: Function
  @Prop({}) deselectFunction?: Function
  @Prop({}) syncFunction?: Function

  model: object = { default: [], nested: [] }
  options: Array<Group> = []
  data!: Array<any> // to be fetched
  treeselectSearchQueryFilled:boolean = false

  @cache.Getter public opsiconfigserver!: Array<string>

  async fetch () {
    this.$fetchState.pending = true
    this.data = await this.fetchData()
    this.updateLocalFromParent()
    this.syncWrapper()
    this.selection = [...this.selection] // needed for deselection
    this.$fetchState.pending = false
  }

  @Watch('selectionDefault', { deep: true }) async selectionChanged () {
    await this.$fetch()
  }

  get selection () { return this.model[(this.nested) ? 'nested' : 'default'] }
  set selection (s) { this.model[(this.nested) ? 'nested' : 'default'] = s }
  set selectionWrapper (s) { (Array.isArray(s)) ? this.selection = s : this.selection = [s] } // can be overwritten by children
  get selectionWrapper () { return this.selection }
  get placeholderWrapper () {
    if (this.multi && !this.text) { return '' }
    let txt = this.text ? this.text : '' + this.selectionWrapper
    if (!this.isOrigin) { txt += ' * ' }
    return txt
  }

  treeselectSearchQueryChanged (filled) { this.treeselectSearchQueryFilled = filled }

  syncWrapper () {
    if (this.syncFunction) { // e.g. from TSDefaultGroups
      this.syncFunction(this.selection, this.options)
    }
  }

  triggerSelection () {
    const treeselectComponent = this.$refs[`id-select-${this.id}`] as any
    if (treeselectComponent) {
      treeselectComponent?.select()
    } else {
      // eslint-disable-next-line no-console
      console.error('cannot find select element. to trigger select-function (Please try again using Enter-key)')
    }
  }

  selectWrapper (s:any) {
    this.$fetchState.pending = true
    if (this.selectFunction) { // e.g. from TSDefaultGroups
      this.selectFunction(s, this)
      this.syncWrapper()
    } else { this.selectDefault(s) }
    this.$fetchState.pending = false
  }

  deselectWrapper (s:any) {
    if (!this.editable && !this.multi) { return }
    this.$fetchState.pending = true

    if (this.deselectFunction) { // e.g. from TSDefaultGroups
      this.deselectFunction(s, this)
      this.syncWrapper()
    } else { this.deselectDefault(s) }
    this.$fetchState.pending = false
  }

  updateLocalFromParent () {
    if (this.isList === false) { // already correct format
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
    if (!this.nested) { // not TSDefaultGroups // e.g. productproperty-value
      if (this.isOrigin) {
        this.selection = [...this.selectionDefault]
      } else {
        this.selection = [...this.selection]
      }
    }
  }

  normalizer (node: Group) {
    return {
      id: node.id,
      type: node.type,
      isNew: node.isNew || false,
      hasAnySelection: node.hasAnySelection || false,
      isDisabled: (node.isDisabled === true) || (node.id === this.$t('values.mixed')) || false,
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
      return Object.values(node.children)
    }
    return node.children
  }

  async loadOptionsChildren ({ action, parentNode, callback }: any) {
    if (this.lazyLoad !== true) {
      callback()
      return
    }
    if (action === 'LOAD_CHILDREN_OPTIONS') {
      this.$fetchState.pending = true
      const c = await this.fetchChildren(parentNode)
      if (c) {
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
    if (!s) { return }

    if (!Array.isArray(this.selectionWrapper)) {
      this.selectionWrapper = [this.selectionWrapper]
    }
    if (Object.keys(s).length <= 0) {
      this.selectionWrapper = []
    }
    if (this.selectionWrapper.includes(s.text)) {
      this.deselectDefault(s)
      return
    }
    // select element
    if (!this.nested && !Object.values(this.options.map((o:any) => o.id)).includes(s.id)) {
      this.options = [...this.options, s]
    }
    if (!this.multi) {
      this.selectionWrapper.length = 0
    }

    if (this.selectionWrapper.includes(this.$t('values.mixed')) && s.text !== this.$t('values.mixed')) {
      this.selectionWrapper = [s.text]
    } else {
      this.selectionWrapper.push(s.text)
    }

    this.$emit('change', this.selectionWrapper)
  }

  deselectDefault (deselection: any, isObject = false) {
    if (!this.editable && !this.multi) { return }

    if (this.selectionWrapper.includes(deselection.text) || this.selectionWrapper.includes(deselection)) {
      if (isObject || this.selectionWrapper.includes(deselection.text)) {
        this.selectionWrapper.splice(this.selectionWrapper.indexOf(deselection.text), 1) // deleting
      } else {
        this.selectionWrapper.splice(this.selectionWrapper.indexOf(deselection), 1) // deleting
      }
      this.$emit('change', this.selectionWrapper)
    }
  }

  clearSelected () {
    this.selectionWrapper = []
    this.$emit('change', this.selectionWrapper)
  }

  resetSelected () {
    this.$emit('change', this.selectionDefault, true)
  }

  isGroup (s) {
    return s.isBranch === true || ['HostGroup', 'ProductGroup'].includes(s.type)
  }
}
</script>

<style>
.TSDefault-wrapper {
  line-height: inherit !important;
  font-size: inherit !important;
  font-weight: inherit !important;
}
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
  background-color: var(--component, white);
}

.TSDefault-wrapper .vue-treeselect__menu .vue-treeselect__option--highlight {
  color: var(--color);
  background-color: var(--hover);
}

.TSDefault-wrapper .hasSelection {
  color: var(--light);
  background-color: var(--primary);
}

.TSDefault-wrapper .vue-treeselect__menu .vue-treeselect__option--highlight .hasSelection{
  color: var(--light)!important;
  background-color: var(--primary);
}

.form-inline{
  flex-flow: nowrap;
}
.TSDefault-wrapper:not(.is-origin) {
  border: 1px solid var(--warning, yellow);
}
.TSDefault-wrapper{
  /* border: 1px solid var(--primary); */
  border-radius: 5px;
  min-width: var(--component-width) !important;
  max-width: var(--component-width) !important;
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
  color: var(--color)!important;
  /* color: inherit !important; */
}
.TSDefault-wrapper .treeselect .vue-treeselect__label-container {
  margin-left: 10px;
  width: calc(100% - 10px);
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
.TSDefault-wrapper .vue-treeselect__option-arrow-container:hover .vue-treeselect__option-arrow{
 color: var(--color, black) !important;
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
  min-width: calc(var(--component-width) + 50px) !important;
  margin-top: 15px;
  overflow: auto;
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

.TSDefault-wrapper .vue-treeselect--single .vue-treeselect__option--selected {
  color: var(--light);
  background-color: var(--primary);
}
.TSDefault-wrapper .vue-treeselect--single .vue-treeselect__label-container svg {
  display: none;
}

.TSDefault-wrapper .vue-treeselect--single .vue-treeselect__option--highlight .hasSelection{
  color: var(--dark);
  background-color: var(--primary);
}

</style>
