export default {
  title: 'Tree/TS Treeselect',
  parameters: { docs: { description: { component: 'Treeselect for group selection, where selection stored in vuexstore' } } }
}

const PrimaryTemplate = () => ({
  template: '<TreeTSTreeselect icon="hdd-network" placeholder="Test Placeholder" />'
})

// named export Primary to create respective story
export const TSTreeselect = PrimaryTemplate.bind({})
