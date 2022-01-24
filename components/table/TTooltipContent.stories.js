export default {
  title: 'Table/T Tooltip Content',
  parameters: { docs: { description: { component: 'Table for Tooltip Content' } } }
}

const PrimaryTemplate = () => ({
  template: '<TableTTooltipContent />'
})

// named export Primary to create respective story
export const TTooltipContent = PrimaryTemplate.bind({})
