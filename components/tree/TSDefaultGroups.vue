<template>
  <TreeTSDefault
    v-bind="$props"
    :select-function="selectGroups"
    :deselect-function="deselectGroups"
    :sync-function="syncStoreToTree"
    @change="emitChange"
  />
</template>

<script lang="ts">
import { Component, Prop } from 'nuxt-property-decorator'
import { filterObjectLabel, filterObjectByValues } from '../../.utils/utils/sfilters'
import TSDefault from './TSDefault.vue'
const typeSelect = 'select'
const typeDeselect = 'deselect'
const groupSelectionDeep = true // cause needs more care and tests
@Component
export default class TSDefaultGroups extends TSDefault {
  node: any
  $axios: any
  @Prop({ }) id!: string
  @Prop({ default: true }) lazyLoad!: boolean
  @Prop({ default: true }) multi!: boolean
  @Prop({ default: true }) nested!: boolean
  @Prop({ default: false }) editable!: boolean
  @Prop({ default: false }) isList!: boolean
  @Prop({ default: 'object' }) valueFormat!: string
  @Prop({ default: 'text' }) selectionKey!: string

  /**
   * passes the emit call from TSDefault to Caller of TSDefaultGroups - e.g TSHostGroups
   * @param s selectionlist
   */
  emitChange (s) { this.$emit('change', s, this) }

  /**
   * used from TSDefault (Parent) to keep store and component in sync
   * nested search and select for store-elements in options-data
   * @param selection the local selected tree elements
   * @param options the tree data
   */
  syncStoreToTree (selection:Array<any>, options:any) {
    // console.log(this.id + ' sync StoreToTree')
    // console.log(this.id + ' sync storeselection', this.store.selection)
    // console.log(this.id + ' sync selection', JSON.stringify(selection))
    // console.log(this.id + ' sync valueFormat', this.valueFormat)
    if (this.valueFormat !== 'object') { return }

    // let treeSelection = selection.filter(item => item.type === 'ObjectToGroup')
    // treeSelection = [...new Set(treeSelection.map(e => e[this.selectionKey]))]
    // if (arrayEqual(this.store.selection, treeSelection)) { return }

    const resultObjects = []
    // filter all elements which values of selectionKey are represented in store
    filterObjectByValues(options, this.store.selection, this.selectionKey, resultObjects)
    // console.log(this.id + ' sync found other objects with same texts: ', JSON.stringify(resultObjects))
    selection.length = 0 // reset selection
    for (const i in resultObjects) {
      selection.push(resultObjects[i])
    }
    // console.log(this.id + ' sync set local selection to  ', selection)
    this.selection = selection
  }

  async selectGroups (s: any, thiss:any) {
    // console.log(this.id + ' TSDefaultGroups selectGroup s', s)
    if (!s) { return }
    if (thiss.isGroup(s)) {
      // console.log(this.id + ' TSDefaultGroups selectGroup isBranch ... load children and select')
      if (s.children == null) {
        await thiss.loadOptionsChildren({ action: 'LOAD_CHILDREN_OPTIONS', parentNode: s, callback: () => {} })
      }
      if (groupSelectionDeep && s.children != null) {
        // console.log(this.id, 'TSDefaultGroups selectGroup s.children ', s.children)
        const subgroups = Object.values(s.children).filter(e => thiss.isGroup(e))
        for (const g in subgroups) {
          await this.selectGroups(subgroups[g], thiss)
        }
      }
      return this.groupChange(s, typeSelect)
    }
    // console.log(this.id + ' TSDefaultGroups selectGroup select not a group: ', s)
    if (!this.store.selection.includes(s[this.selectionKey])) {
      // console.log(this.id + ' TSDefaultGroups selectGroup PUSHSELECTION', s[this.selectionKey])
      this.store.pushSelection(s[this.selectionKey])
    }
  }

  deselectGroups (deselection: any, thiss:any) {
    // console.log(this.id + ' TSDefaultGroups deselectGroups')
    if (thiss.isGroup(deselection)) {
      this.groupChange(deselection, typeDeselect)
      return
    }
    // console.log(this.id + ' TSDefaultGroups deselectGroups not a group ', deselection)
    if (this.store.selection.includes(deselection[this.selectionKey])) {
      // console.log(this.id + ' TSDefaultGroups deselectGroups DELSELECTION', deselection[this.selectionKey])
      this.store.delSelection(deselection[this.selectionKey])
    }
  }

  groupChange (value: object, type: string) {
    // console.log(this.id + ' TSDefaultGroups groupChange ', value, type)
    const idList : Array<string> = []
    // const storeSel = this.store.selection
    // console.log(this.id + ' TSDefaultGroups groupChange store ', storeSel)
    filterObjectLabel([value], 'ObjectToGroup', 'type', this.selectionKey, idList) // get all texts elements where type is ObjectToGroup
    // console.log(this.id + ' TSDefaultGroups foundIds ', idList)

    for (const i in idList) {
      const objectId = idList[i]
      // console.log(this.id + ' TSDefaultGroups groupChange id ', objectId, type)
      if (type === typeSelect) {
        // console.log(this.id + ' TSDefaultGroups groupChange PUSHSELECTION', objectId)
        this.store.pushSelection(objectId)
      }
      if (type === typeDeselect) {
        // console.log(this.id + ' TSDefaultGroups groupChange DELSELECTION', objectId)
        this.store.delSelection(objectId)
      }
    }

    this.store.selection = [...this.store.selection]
  }
}
</script>

<style>
</style>
