export default {
  title: 'Tooltip/TT Help Expert',
  parameters: { docs: { description: { component: 'Tooltip for Expertmode Help' } } }
}

const PrimaryTemplate = () => ({
  template: `
    <div>
    <button id="target">tooltip test</button>
    <TooltipTTHelpExpert target="target" />
    </div>
    `
})

// named export Primary to create respective story
export const TTHelpExpert = PrimaryTemplate.bind({})
