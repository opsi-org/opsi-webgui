export default {
  title: 'Tree/T S Depots',
  parameters: { docs: { description: { component: 'Treeselect for depot selection' } } }
}

const PrimaryTemplate = () => ({
  template: '<TreeTSDepots />'
})

// named export Primary to create respective story
export const TSDepots = PrimaryTemplate.bind({})
