export default {
  title: 'Tooltip/TT Help',
  parameters: { docs: { description: { component: 'Tooltip for Help' } } }
}

const PrimaryTemplate = () => ({
  template: `
    <div>
    <button id="target">tooltip test</button>
    <TooltipTTHelp target="target" />
    </div>
    `
})

// named export Primary to create respective story
export const TTHelp = PrimaryTemplate.bind({})
