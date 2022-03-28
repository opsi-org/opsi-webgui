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
import { Component, Prop } from 'nuxt-property-decorator'
import { arrayEqual } from '../../.utils/utils/scompares'
import { filterObjectLabel, filterObjectByValues } from '../../.utils/utils/sfilters'
import TSDefault from './TSDefault.vue'
const typeSelect = 'select'
const typeDeselect = 'deselect'
const groupSelectionDeep = true
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

  emitChange (s) {
    console.log(this.id + ' TSDefaultGroups receive change', s)
    this.$emit('change', s, this)
  }

  get selectionKeys () {
    return this.selection.map(s => s[this.selectionKey])
  }

  set selectionKeys (s) {
    throw new Error(this.id + ' Internal error: cannot set selectionKeys')
  }

  syncStoreToTree (selection:Array<any>, options:any) {
    console.log(this.id + ' sync StoreToTree')
    if (this.valueFormat !== 'object') {
      return
    }

    console.log(this.id + ' sync storeselection', this.store.selection)
    console.log(this.id + ' sync selection', JSON.stringify(selection))

    const storeSelect = this.store.selection
    let treeSelect = selection.filter(item => item.type === 'ObjectToGroup')
    treeSelect = treeSelect.map(e => e.text)

    treeSelect = [...new Set(treeSelect)]
    if (arrayEqual(storeSelect, treeSelect)) {
      return
    }

    const resultObjects = []
    filterObjectByValues(options, storeSelect, this.selectionKey, resultObjects)
    console.log(this.id + ' sync found objects ', JSON.stringify(resultObjects))
    selection.length = 0
    for (const i in resultObjects) {
      // if (resultObjects[i][this.selectionKey]) {
      //   if (!selection.includes(resultObjects[i][this.selectionKey])) {
      //     console.log('add object key ', resultObjects[i][this.selectionKey])
      //     selection.push(resultObjects[i][this.selectionKey])
      //   }
      // } else
      console.log(this.id + ' sync add key ', resultObjects[i])
      selection.push(resultObjects[i])
      // if (!selection.includes(resultObjects[i])) {
      // }
    }
    // const elementsInTree: Array<string> = []
    // for (const index in storeSelect) {

    //   if (options.includes(storeSelect[index]) && !this.selection.includes(storeSelect[index])
    //   ) {
    //     this.selection.push(storeSelect[index])
    //   //   filterObject(
    //   //     this.options, storeSelect[index],
    //   //     'text', elementsInTree)
    //   }
    // }
    this.selection = selection // elementsInTree
  }

  async selectGroups (s: any, thiss:any) {
    console.log(this.id + ' TSDefaultGroups s', s)
    if (!s) { return }
    if (thiss.isGroup(s)) {
      console.log(this.id + ' TSDefaultGroups isBranch ... load children and select')
      if (s.children == null) {
        await thiss.loadOptionsChildren({ action: 'LOAD_CHILDREN_OPTIONS', parentNode: s, callback: () => {} })
      }
      if (groupSelectionDeep && s.children != null) {
        const subgroups = s.children.filter(e => thiss.isGroup(e))
        for (const g in subgroups) {
          await this.selectGroups(subgroups[g], thiss)
        }
      }
      return this.groupChange(s, typeSelect) // todo nested !!
    }
    console.log(this.id + ' select not a group: ', s)
    if (!this.store.selection.includes(s[this.selectionKey])) {
      console.log(this.id + ' PUSHSELECTION', s[this.selectionKey])
      this.store.pushSelection(s[this.selectionKey])
    }
  }

  deselectGroups (deselection: any, thiss:any) {
    console.log(this.id + ' TSDefaultGroups deselect')
    if (thiss.isGroup(deselection)) {
      this.groupChange(deselection, typeDeselect)
      return
    }
    console.log(this.id + ' TSDefaultGroups deselect not a group ', deselection)
    if (this.store.selection.includes(deselection[this.selectionKey])) {
      console.log(this.id + ' TSDefaultGroups DELSELECTION', deselection[this.selectionKey])
      this.store.delSelection(deselection[this.selectionKey])
    }
    // thiss.selection.length = 0
    // this.selection.length = 0
    // await thiss.$fetch()
  }

  groupChange (value: object, type: string) {
    console.log(this.id + ' TSDefaultGroups groupChange ', value, type)
    const idList : Array<string> = []
    const storeSel = this.store.selection
    console.log(this.id + ' TSDefaultGroups store ', storeSel)
    filterObjectLabel([value], 'ObjectToGroup', 'type', this.selectionKey, idList) // get all texts elements where type is ObjectToGroup
    console.log(this.id + ' TSDefaultGroups foundIds ', idList)

    for (const i in idList) {
      const objectId = idList[i]
      console.log(this.id + ' TSDefaultGroups id ', objectId, type)
      if (type === typeSelect) {
        console.log(this.id + ' PUSHSELECTION', objectId)
        this.store.pushSelection(objectId)
      }
      if (type === typeDeselect) {
        console.log(this.id + ' DELSELECTION', objectId)
        this.store.delSelection(objectId)
      }
    }

    this.store.selection = [...this.store.selection]
    // thiss.selection.length = 0
    // this.selection.length = 0
    // await thiss.$fetch()
  }
}
</script>

<style>
/*
.form-inline{
  flex-flow: nowrap;
}
.TSDefault-wrapper{
  border: 1px solid #ddd;
  border-radius: 5px;
  min-width: 100px !important;
  max-width: 200px !important;
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
} */
/* .treeselect .vue-treeselect-helper-hide {
  display: inline;
} */
/* .TSDefault-wrapper .selection_badge {
  margin-top: 20px;
} */
</style>
