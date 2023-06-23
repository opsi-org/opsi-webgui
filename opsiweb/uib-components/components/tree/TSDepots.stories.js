export default {
  title: 'Tree/TS Depots',
  parameters: { docs: { description: { component: 'Treeselect for depot selection' } } }
}

const PrimaryTemplate = () => ({
  template: '<TreeTSDepots />'
})

export const TSDepots = PrimaryTemplate.bind({})
