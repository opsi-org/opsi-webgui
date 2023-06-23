export default {
  title: 'Tree/TS Default',
  parameters: { docs: { description: { component: 'Treeselect' } } }
}

const PrimaryTemplate = () => ({

  computed: {
    allOptionsUnique () { return ['0', '1', '2', '3', '4'] },
    selection () { return ['1'] }
  },
  template: `
  <TreeTSDefault :selectionDefault="selection"
    :id="'treeselect-id'"
    :always-open="true"
    :show-selection-count="selection.length>1"
    :limit-visible-selection="1"
    :multi="false"
    :editable="false"
    :disabled="false"
    :is-origin="true"
    :is-list="true"
    :fetch-data="() => allOptionsUnique"
    @change=""
  />`
})

export const TSDefault = PrimaryTemplate.bind({})
