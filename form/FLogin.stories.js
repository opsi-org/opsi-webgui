export default {
  title: 'Form/F Login',
  parameters: { docs: { description: { component: 'Form for Login' } } }
}

const PrimaryTemplate = () => ({
  template: '<FormFLogin />'
})

// named export Primary to create respective story
export const FLogin = PrimaryTemplate.bind({})
