export default {
  title: 'Tooltip/TT Help',
  parameters: { docs: { description: { component: 'Tooltip for Help' } } }
}

const PrimaryTemplate = () => ({
  template: `
    <div>
    <button id="target">tooltip test button</button>
      <TooltipTTHelp id="target" tooltipContent="simple string content">
        <template #tooltipContentHTML >
          <div class="bg-primary">Custom html content</div>
        </template>
      </TooltipTTHelp>
    </div>
    `
})

// named export Primary to create respective story
export const TTHelp = PrimaryTemplate.bind({})
