export default {
  title: 'Tablecell/T C Productversion',
  parameters: { docs: { description: { component: 'Table cell for ProductVersion' } } }
}

const PrimaryTemplate = () => ({
  template: '<TableCellTCProductVersionCell />'
})

// named export Primary to create respective story
export const TCProductVersionCell = PrimaryTemplate.bind({})
