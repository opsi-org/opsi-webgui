export default {
  title: 'Tree/TS Default',
  parameters: { docs: { description: { component: 'Default Treeselect' } } }
}

const PrimaryTemplate = () => ({

  computed: {
    allOptionsUnique () { return ['0', '1', '2', '3', '4'] },
    selection () { return ['1'] }
  },
  // type=""
  // :text="'undefined'"
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

// named export Primary to create respective story
export const TSDefault = PrimaryTemplate.bind({})
