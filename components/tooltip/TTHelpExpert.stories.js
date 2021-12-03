export default {
  title: 'Tooltip/T T Helpexpert',
  parameters: { docs: { description: { component: 'Tooltip for Expertmode Help' } } }
}

const PrimaryTemplate = () => ({
  template: '<TooltipTTHelpExpert target="expert-help" />'
})

// named export Primary to create respective story
export const TTHelpExpert = PrimaryTemplate.bind({})
