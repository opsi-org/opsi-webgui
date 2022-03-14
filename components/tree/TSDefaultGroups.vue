<template>
  <div>
    <TreeTSDefault
      v-bind="$props"
      :select-function="selectGroups"
      :deselect-function="deselectGroups"
      :sync-function="syncStoreToTree"
      @change="emitChange"
    />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Watch } from 'nuxt-property-decorator'
import { arrayEqual } from '../../.utils/utils/scompares'
import { filterObjectLabel, filterObjectByValues } from '../../.utils/utils/sfilters'
// import { filterObjectLabel, filterObject } from '../../.utils/utils/sfilters'
// import { makeToast } from '../../.utils/utils/scomponents'
// import { arrayEqual } from '../../.utils/utils/scompares'
import TSDefault from './TSDefault.vue'


@Component
export default class TSDefaultGroups extends TSDefault {
  node: any
  $axios: any
  @Prop({ default: true }) lazyLoad!: boolean
  @Prop({ default: true }) multi!: boolean
  @Prop({ default: true }) nested!: boolean
  @Prop({ default: false }) editable!: boolean
  @Prop({ default: false }) isList!: boolean
  @Prop({ default: 'object' }) valueFormat!: string
  @Prop({ default: 'text' }) selectionKey!: string

  emitChange (s) {
    console.log('TSDefaultGroups receive change', s)
    this.$emit('change', s)
  }

  get selectionKeys () {
    return this.selection.map(s => s[this.selectionKey])
  }

  set selectionKeys (s) {
    throw new Error('Internal error: cannot set selectionKeys')
  }


  // get selectionModel () { // overwrites parent
  //   return this.selectionKeys
  // }

  // set selectionModel (s) { // overwrites parent
  //   this.selectionKeys = s
  // }


  syncStoreToTree ({ selection, options }) {
    console.log('syncStoreToTree')
    if (this.valueFormat !== 'object') {
      return
    }

    console.log('storeselection', this.store.selection)
    console.log('selection', selection)

    const storeSelect = this.store.selection
    let treeSelect = selection.filter(item => item.type === 'ObjectToGroup')
    treeSelect = treeSelect.map(e => e.text)
    treeSelect = [...new Set(treeSelect)]
    if (arrayEqual(storeSelect, treeSelect)) {
      return
    }
    const resultObjects = []
    filterObjectByValues(options, storeSelect, this.selectionKey, resultObjects)
    console.log('sync given options ', JSON.stringify(options))
    console.log('sync found objects ', JSON.stringify(resultObjects))
    for (const i in resultObjects) {
      selection.push(resultObjects[i])
    }
    // // const elementsInTree: Array<string> = []
    // for (const index in storeSelect) {

    //   if (thiss.data.includes(storeSelect[index]) && !this.selection.includes(storeSelect[index])
    //   ) {
    //     this.selection.push(storeSelect[index])
    //   //   filterObject(
    //   //     this.options, storeSelect[index],
    //   //     'text', elementsInTree)
    //   }
    // }
    // this.selection = treeSelect // elementsInTree
  }


  isGroup (s) {
    return s.isBranch === true || ['HostGroup', 'ProductGroup'].includes(s.type)
  }

  async selectGroups (s: any, thiss:any) {
    console.log('TSDefaultGroups s', s)
    if (!s) { return }

    if (this.isGroup(s)) {
      console.log('TSDefaultGroups isBranch ... load children and select')
      await thiss.loadOptionsChildren({ action: 'LOAD_CHILDREN_OPTIONS', parentNode: s, callback: () => {} })
    }
    this.groupChange(s, 'select')
  }

  deselectGroups (deselection: any) {
    console.log('TSDefaultGroups deselect')
    this.groupChange(deselection, 'deselect')
  }

  groupChange (value: object, type: string) {
    console.log('TSDefaultGroups groupChange')
    const idList : Array<string> = []
    const storeSel = this.store.selection
    filterObjectLabel([value], 'ObjectToGroup', 'type', 'text', idList) // get all texts elements where type is ObjectToGroup

    for (const i in idList) {
      const objectId = idList[i]
      if (type === 'select') {
        console.log('PUSHSELECTION', objectId)
        this.store.pushSelection(objectId)
      }
      if (type === 'deselect') {
        if (storeSel.includes(objectId)) {
          this.store.delSelection(objectId)
        }
      }
    }
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
