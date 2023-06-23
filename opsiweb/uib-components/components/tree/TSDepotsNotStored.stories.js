export default {
  title: 'Tree/TS Depots Not Stored',
  parameters: { docs: { description: { component: 'Treeselect for depot selection, where selection not stored' } } }
}

const PrimaryTemplate = () => ({
  template: '<TreeTSDepotsNotStored />'
})

export const TSDepotsNotStored = PrimaryTemplate.bind({})
