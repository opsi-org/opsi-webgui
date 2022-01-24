export default {
  title: 'Grid/G Two Column Layout',
  parameters: { docs: { description: { component: 'Grid for two column layout' } } }
}

const PrimaryTemplate = () => ({
  template: '<GridGTwoColumnLayout />'
})

// named export Primary to create respective story
export const GTwoColumnLayout = PrimaryTemplate.bind({})
