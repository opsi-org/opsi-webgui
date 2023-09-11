<template>
  <b-input-group data-testid="TSDefault" size="sm" class="TreeWrapper border">
    <LazyTreeTSDefaultWithAdding
      v-if="options"
      :id="`treeselect-${id}`"
      :ref="`treeselect-${id}`"
      v-model="selectionWrapper"
      :always-open="alwaysOpen"
      :flat="flat"
      :placeholder="placeholderWrapper"
      class="treeselect treeselect_with_wrapper"
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
      :disabled="disabled"
      :cache-options="false"
      :normalizer="normalizer"
      :load-options="loadOptionsChildren"
      :no-children-text="$t('treeselect.nochildren')"
      :no-options-text="$t('treeselect.nooption')"
      :no-results-text="(textNoResult? textNoResult : $t('treeselect.noresult'))"
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
            (validate && node.label ? !validate(node.label) : false),
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
          :w100="true"
          class="BTN-before-list"
          :action="resetSelected"
        />
        <b-button
          v-if="editable && treeselectSearchQueryFilled"
          variant="outline-primary"
          class="BTN-before-list border-0 w-100"
          :title="$t('button.tsdefault.add.tooltip')"
          @click="triggerSelection()"
        >
          <b-icon :icon="icon.add" />
          {{ $t('button.tsdefault.add') }}
        </b-button>
      </div>
      <div
        slot="option-label"
        slot-scope="{ node }"
        :class="{
          'test':true,
          'form-control is-invalid': (validate && node.label ? !validate(node.label) : false),
        }"
      >
        <div :ref="'tree-item-'+node.id">
          <b-icon v-if="node.isBranch||false" :icon="icon.group" :class="(node.raw.hasAnySelection)? 'hasSelection':''" />
          <b-icon v-else :icon="(type === 'products') ? icon.product: (type=='clients') ? icon.client: (type==='depots') ? icon.server:''" />
          <template v-if="type=='depots' && node.label===opsiconfigserver">
            <b> {{ node.label }} </b>
          </template>
          <template v-else>
            {{ node.label ? node.label : node.id }}
          </template>
        </div>
      </div>
    </LazyTreeTSDefaultWithAdding>
  </b-input-group>
</template>

<script lang="ts">
import { Component, namespace, Prop, Watch, Vue } from 'nuxt-property-decorator'
import { Icons } from '../../mixins/icons'

const cache = namespace('data-cache')

interface Group {
  id: string
  text: string
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

@Component({ mixins: [Icons] })
export default class TSDefault extends Vue {
  icon: any // from mixin
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
  @Prop({ default: 'id' }) valueFormat!: string
  @Prop({ default: 'LEAF_PRIORITY' }) valueConsistsOf!: string
  @Prop({ default: '' }) placeholder?: string
  @Prop({ default: 0 }) limitVisibleSelection!: number
  @Prop({ default: true }) showSelectionCount!: boolean
  @Prop({ default: false }) disabled!: boolean
  @Prop({ default: false }) alwaysOpen!: boolean
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
    await this._fetch() // Workaround, cause $fetch sometimes not triggered/executed in selectionChanged-method
  }

  async _fetch () {
    this.$fetchState.pending = true
    this.data = await this.fetchData()
    this.updateLocalFromParent()
    this.syncWrapper()
    this.selection = [...this.selection] // needed for deselection
    this.$fetchState.pending = false
  }

  @Watch('selectionDefault', { deep: true }) async selectionChanged () {
    await this._fetch() // Workaround... cause $fetch sometimes not executed....
  }

  get selection () { return this.model[(this.nested) ? 'nested' : 'default'] }
  set selection (s) { this.model[(this.nested) ? 'nested' : 'default'] = s }
  set selectionWrapper (s) {
    if (Array.isArray(s)) {
      this.selection = s
    } else {
      this.selection = [s]
    }
  }

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
    // placeholder class vue-treeselect__input
    // const treeselectComponent = this.$refs[`id-select-${this.id}`] as any
    const tid = `treeselect-${this.id}`
    const treeselectComponent = this.$refs[tid] as any
    // console.log('treeselcomp', tid, treeselectComponent)
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
    if (this.lazyLoad) {
      return {
        id: node.id,
        type: node.type,
        isNew: node.isNew ?? false,
        hasAnySelection: node.hasAnySelection ?? false,
        isDisabled: (node.isDisabled === true) || (node.id === this.$t('values.mixed')) || false,
        label: node.text ? node.text.replace(/_+$/, '') : node.id,
        children: this.getChildren(node)
      }
    }

    this.normalizerWithChildren(node)
  }

  normalizerWithChildren (node) {
    return {
      id: node.id,
      type: node.type,
      isNew: node.isNew ?? false,
      hasAnySelection: node.hasAnySelection ?? false,
      isDisabled: (node.isDisabled === true) || (node.id === this.$t('values.mixed')) || false,
      label: node?.text && node.text.replace ? node.text.replace(/_+$/, '') : node.id,
      children: node.children
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
.TreeWrapper.input-group{
  position: inherit;
  align-items: normal;
  margin-right: 5px;
  width:fit-content;
  flex-wrap: nowrap;
  min-height: var(--min-height-button) !important;
  min-width: var(--min-height-button) !important;
  font-size: var(--text-small);
}
.TreeWrapper .vue-treeselect__placeholder {
  display: block;
  color:var(--color);
  padding: 0%;
}
.TreeWrapper>.search-filled .vue-treeselect__placeholder {
  top: -10px;
}
.TreeWrapper>.search-filled .vue-treeselect__input {
  color: var(--general-fg-disabled) !important;
}
</style>
