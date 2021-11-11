export default {
  title: 'View/V Config',
  parameters: { docs: { description: { component: 'Host Attributes' } } }
}

const PrimaryTemplate = () => ({
  template: '<ViewVConfig />'
})

// named export Primary to create respective story
export const VConfig = PrimaryTemplate.bind({})
