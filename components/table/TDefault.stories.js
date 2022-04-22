export default {
  title: 'Table/T Default',
  parameters: { docs: { description: { component: 'Table Default' } } }
}

const PrimaryTemplate = () => ({
  template: '<TableTDefault />'
})

// named export Primary to create respective story
export const TDefault = PrimaryTemplate.bind({})
