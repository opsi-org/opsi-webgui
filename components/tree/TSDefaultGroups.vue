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
    if (this.valueFormat !== 'object') { return }
    const resultObjects = []
    // filter all elements which values of selectionKey are represented in store
    filterObjectByValues(options, this.store.selection, this.selectionKey, resultObjects)
    selection.length = 0 // reset selection
    for (const i in resultObjects) {
      selection.push(resultObjects[i])
    }
    this.selection = selection
  }

  async selectGroups (s: any, thiss:any) {
    if (!s) { return }
    if (thiss.isGroup(s)) {
      if (s.children == null) {
        await thiss.loadOptionsChildren({ action: 'LOAD_CHILDREN_OPTIONS', parentNode: s, callback: () => { return {} } })
      }
      if (groupSelectionDeep && s.children != null) {
        const subgroups = Object.values(s.children).filter(e => thiss.isGroup(e))
        for (const g in subgroups) {
          await this.selectGroups(subgroups[g], thiss)
        }
      }
      return this.groupChange(s, typeSelect)
    }
    if (!this.store.selection.includes(s[this.selectionKey])) {
      this.store.pushSelection(s[this.selectionKey])
    }
  }

  deselectGroups (deselection: any, thiss:any) {
    if (thiss.isGroup(deselection)) {
      this.groupChange(deselection, typeDeselect)
      return
    }

    if (this.store.selection.includes(deselection[this.selectionKey])) {
      this.store.delSelection(deselection[this.selectionKey])
    }
  }

  groupChange (value: object, type: string) {
    const idList : Array<string> = []
    filterObjectLabel([value], 'ObjectToGroup', 'type', this.selectionKey, idList) // get all texts elements where type is ObjectToGroup
    for (const i in idList) {
      const objectId = idList[i]
      if (type === typeSelect) {
        this.store.pushSelection(objectId)
      }
      if (type === typeDeselect) {
        this.store.delSelection(objectId)
      }
    }
    this.store.selection = [...this.store.selection]
  }
}
</script>

<style>
</style>
