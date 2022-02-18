<template>
  <div class="form-inline" style="margin-right:30px" data-testid="TSTreeselect">
    <b-icon :icon="icon" variant="transparent" font-scale="1.5" />
    <b-badge class="selection_badge" variant="transparent" size="sm">
      {{ type === 'depots' ? selectionDepots.length: selectionProducts.length }}
    </b-badge>
    <treeselect
      v-model="groupSelection"
      :placeholder="$t(placeholder)"
      class="treeselect"
      :multiple="true"
      :clearable="false"
      :options="options"
      :normalizer="normalizer"
      value-format="object"
      :max-height="400"
      @select="groupSelect"
      @deselect="groupDeselect"
    >
      <div slot="before-list">
        <ButtonBTNClearSelection
          v-if="type === 'depots' ? selectionDepots.length>0: selectionProducts.length>0"
          :clearselection="clearSelected"
        />
      </div>
      <div slot="option-label" slot-scope="{ node }">
        <div :ref="'tree-item-'+node.id">
          <b-icon v-if="node.isBranch" icon="diagram2" />
          <b-icon v-else :icon="type === 'depots' ? 'laptop': 'grid-fill'" />
          <small> {{ node.label }} </small>
        </div>
      </div>
    </treeselect>
  </div>
</template>

<script lang="ts">
import { Component, namespace, Watch, Prop, Vue } from 'nuxt-property-decorator'
import { filterObject, filterObjectLabel } from '../../.utils/utils/sfilters'
import { arrayEqual } from '../../.utils/utils/scompares'
const selections = namespace('selections')

interface Group {
  id: string
  text: string
  isBranch?: boolean
  type: string
  isDisabled?: boolean
  children: null | Array<any>
}

@Component
export default class TSTreeselect extends Vue {
  @Prop({ }) options!: Array<object>
  @Prop({ }) placeholder!: string
  @Prop({ }) type!: string
  @Prop({ }) icon!: string

  groupSelection: Array<any> = []
  groupIdList: Array<string> = []

  @selections.Getter public selectionDepots!: Array<string>
  @selections.Mutation public setSelectionDepots!: (s: Array<string>) => void
  @selections.Mutation public pushToSelectionDepots!: (s: string) => void
  @selections.Mutation public delFromSelectionDepots!: (s: string) => void
  @selections.Getter public selectionProducts!: Array<string>
  @selections.Mutation public setSelectionProducts!: (s: Array<string>) => void
  @selections.Mutation public pushToSelectionProducts!: (s: string) => void
  @selections.Mutation public delFromSelectionProducts!: (s: string) => void

  @Watch('selectionProducts', { deep: true }) selectionProductsChanged () {
    this.syncStoreToTree()
  }

  beforeUpdate () {
    filterObjectLabel(this.options, 'ObjectToGroup', 'type', 'text', this.groupIdList)
    this.syncStoreToTree()
  }

  normalizer (node: Group) {
    return {
      id: node.id,
      type: node.type,
      label: node.text.replace(/_+$/, ''),
      children: (node.children)
        ? Object.values(node.children).sort(function (a: Group, b: Group) {
          if (a.text < b.text) { return -1 }
          if (a.text > b.text) { return 1 }
          return 0
        })
        : {}
    }
  }

  syncStoreToTree () {
    let storeSelect: Array<string> = []
    if (this.type === 'depots') { storeSelect = this.selectionDepots } else { storeSelect = this.selectionProducts }
    let treeData = this.groupSelection.filter(item => item.type === 'ObjectToGroup')
    treeData = [...new Set(treeData)]
    if (arrayEqual(storeSelect, treeData)) {
      // eslint-disable-next-line no-useless-return
      return
    }
    const elementsInTree: Array<string> = []
    for (const index in storeSelect) {
      if (this.groupIdList.includes(storeSelect[index])) {
        filterObject(
          this.options, storeSelect[index],
          'text', elementsInTree)
      }
    }
    this.groupSelection = elementsInTree
  }

  groupChange (value: object, type: string) {
    const idList : Array<string> = []
    let storeSel: Array<string> = []
    if (this.type === 'depots') { storeSel = this.selectionDepots } else { storeSel = this.selectionProducts }
    filterObjectLabel([value], 'ObjectToGroup', 'type', 'text', idList)

    for (const i in idList) {
      const objectId = idList[i]
      if (type === 'select') {
        if (this.type === 'depots') { this.pushToSelectionDepots(objectId) } else { this.pushToSelectionProducts(objectId) }
      }
      if (type === 'deselect') {
        if (storeSel.includes(objectId)) {
          if (this.type === 'depots') { this.delFromSelectionDepots(objectId) } else { this.delFromSelectionProducts(objectId) }
        }
      }
    }
  }

  groupSelect (selection: object) {
    this.groupChange(selection, 'select')
  }

  groupDeselect (deselection: object) {
    this.groupChange(deselection, 'deselect')
  }

  clearSelected () {
    if (this.type === 'depots') {
      this.setSelectionDepots([])
    } else {
      this.setSelectionProducts([])
    }
  }
}
</script>

<style>
.form-inline{
  flex-flow: nowrap;
}
.treeselect{
  max-width: 280px;
}
.treeselect .vue-treeselect__multi-value-item {
  display: none;
}
.treeselect .vue-treeselect__placeholder {
    color: gray;
}
/* .treeselect .vue-treeselect-helper-hide {
  display: inline;
} */
.selection_badge{
  margin-top: 20px;
}
</style>
