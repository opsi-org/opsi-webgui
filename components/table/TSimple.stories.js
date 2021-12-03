export default {
  title: 'Table/T Simple',
  parameters: { docs: { description: { component: 'Table Simple' } } }
}

const PrimaryTemplate = () => ({
  template: '<TableTSimple />'
})

// named export Primary to create respective story
export const TSimple = PrimaryTemplate.bind({})
