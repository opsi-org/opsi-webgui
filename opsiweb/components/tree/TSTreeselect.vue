<template>
  <treeselect
    :id="tid"
    v-model="groupSelection"
    class="Group_TreeSelect"
    :multiple="true"
    :options="filteredGroupItems"
    :placeholder="placeholder +' '+ addPlaceholder"
    :normalizer="normalizer"
    value-format="object"
    :before-clear-all="beforeClearAll"
    value-consists-of="LEAF_PRIORITY"
    :no-children-text="(dataType=='HostGroups')?$t('clients.group.noChildren'):$t('products.group.noChildren')"
    :no-options-text="(dataType=='HostGroups')?$t('clients.group.noOptions'):$t('products.group.noOptions')"
    :no-results-text="(dataType=='HostGroups')?$t('clients.group.noSearchResults'):$t('products.group.noSearchResults')"
    @select="groupSelect"
    @deselect="groupDeselect"
  >
    <div slot="option-label" slot-scope="{ node }">
      <div :ref="'tree-item-'+node.id">
        <b-icon v-if="node.isBranch" icon="hdd-network-fill" />
        <b-icon v-else icon="laptop" />
        <small> {{ node.label }} </small>
      </div>
    </div>
  </treeselect>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'

@Component
export default class TSTreeselect extends Vue {
  elementWithValue (element: any, matchingValue: any, key: any, type = 'any') {
    if (element[key] === matchingValue) {
      return true
    } else if (element.children != null) {
      let i
      let result = type !== 'any'
      const shouldBe = type !== 'any'
      for (i = 0; result === shouldBe && i < Object.values(element.children).length; i++) {
        result = this.elementWithValue(Object.values(element.children)[i], matchingValue, key, type)
      }
      return result
    }
    return false
  }

  compareByKeyText (a: any, b: any) {
    const textA = a.text.toUpperCase()
    const textB = b.text.toUpperCase()
    if (textA > textB) { return 1 } else if (textA < textB) { return -1 } else { return 0 }
  }

  normalizer (node: any) {
    const newDisabled = (
      (this.elementWithValue(node, true, 'disabled', 'all')) ||
            ((node.children) && !(this.elementWithValue(node, 'ObjectToGroup', 'type'))))
    return {
      id: node.id,
      label: node.text.replace(/_+$/, ''),
      isDisabled: newDisabled,
      children: (node.children) ? Object.values(node.children).sort(this.compareByKeyText) : {}
    }
  }
}
</script>

<style>

</style>
