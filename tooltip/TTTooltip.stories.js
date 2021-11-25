export default {
  title: 'Tooltip/T T Tooltip',
  parameters: { docs: { description: { component: 'Tooltip' } } }
}

const PrimaryTemplate = () => ({
  template: '<TooltipTTTooltip />'
})

// named export Primary to create respective story
export const TTTooltip = PrimaryTemplate.bind({})
