export default {
  title: 'Table/T Productproperties',
  parameters: { docs: { description: { component: 'Table for ProductProperties' } } }
}

const PrimaryTemplate = () => ({
  template: '<TableTProductProperties />'
})

// named export Primary to create respective story
export const TProductProperties = PrimaryTemplate.bind({})
