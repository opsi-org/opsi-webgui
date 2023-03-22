export default {
  title: 'Tooltip/T T Tooltip',
  parameters: { docs: { description: { component: 'Tooltip' } } }
}

const PrimaryTemplate = () => ({
  template: `
    <div>
    <button id="target">tooltip test</button>
    <TooltipTTTooltip target="target" tooltip="tooltip text content"/>
    </div>
    `
})

// named export Primary to create respective story
export const TTTooltip = PrimaryTemplate.bind({})
