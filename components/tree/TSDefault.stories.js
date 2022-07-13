export default {
  title: 'Tree/TS Default',
  parameters: { docs: { description: { component: 'Default Treeselect' } } }
}

const PrimaryTemplate = () => ({
  template: '<TreeTSDefault />'
})

// named export Primary to create respective story
export const TSDefault = PrimaryTemplate.bind({})
