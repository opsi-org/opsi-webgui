export default {
  title: 'Tablecell/T C Productpropertyvalue',
  parameters: { docs: { description: { component: 'Table cell for Productpropertyvalue' } } }
}

const PrimaryTemplate = () => ({
  template: '<TableCellTCProductPropertyValue />'
})

// named export Primary to create respective story
export const TCProductPropertyValue = PrimaryTemplate.bind({})
