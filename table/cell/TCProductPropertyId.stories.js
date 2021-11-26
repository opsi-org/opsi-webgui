export default {
  title: 'Tablecell/T C Productpropertyid',
  parameters: { docs: { description: { component: 'Table cell for Productpropertyid' } } }
}

const PrimaryTemplate = () => ({
  template: '<TableCellTCProductPropertyId />'
})

// named export Primary to create respective story
export const TCProductPropertyId = PrimaryTemplate.bind({})
