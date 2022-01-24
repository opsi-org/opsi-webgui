export default {
  title: 'Tablecell/T C Actionresult',
  parameters: { docs: { description: { component: 'Table cell for actionResult' } } }
}

const PrimaryTemplate = () => ({
  template: '<TableCellTCActionResult />'
})

// named export Primary to create respective story
export const TCActionResult = PrimaryTemplate.bind({})
