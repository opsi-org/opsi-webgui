export default {
  title: 'Tablecell/T C Installationstatus',
  parameters: { docs: { description: { component: 'Tablecell for installationStatus' } } }
}

const PrimaryTemplate = () => ({
  template: '<TableCellTCInstallationStatus />'
})

// named export Primary to create respective story
export const TCInstallationStatus = PrimaryTemplate.bind({})
