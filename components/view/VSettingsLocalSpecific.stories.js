export default {
  title: 'View/V Settings Local Specific',
  parameters: { docs: { description: { component: 'Local specific settings view' } } }
}

const PrimaryTemplate = () => ({
  template: '<ViewVSettingsLocalSpecific />'
})

// named export Primary to create respective story
export const VSettingsLocalSpecific = PrimaryTemplate.bind({})
