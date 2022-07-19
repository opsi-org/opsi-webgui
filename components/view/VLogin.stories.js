export default {
  title: 'View/V Login',
  parameters: { docs: { description: { component: 'Login view' } } }
}

const PrimaryTemplate = () => ({
  template: '<ViewVLogin />'
})

// named export Primary to create respective story
export const VLogin = PrimaryTemplate.bind({})
