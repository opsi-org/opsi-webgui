export default {
  title: 'Tooltip/T T Productcell',
  parameters: { docs: { description: { component: 'Tooltip for ProductCell' } } }
}

const PrimaryTemplate = () => ({
  template: '<TooltipTTProductCell />'
})

// named export Primary to create respective story
export const TTProductCell = PrimaryTemplate.bind({})
