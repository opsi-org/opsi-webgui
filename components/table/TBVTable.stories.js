export default {
  title: 'Table/T B V Table',
  parameters: { docs: { description: { component: 'Table' } } }
}

const PrimaryTemplate = () => ({
  template: '<TableTBVTable />'
})

// named export Primary to create respective story
export const TBVTable = PrimaryTemplate.bind({})
