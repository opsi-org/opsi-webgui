export default {
  title: 'Tooltip/TT Product Cell',
  parameters: { docs: { description: { component: 'Tooltip for ProductCell' } } }
}

const PrimaryTemplate = () => ({
  template: `
    <div>
    <button id="target">tooltip test</button>
    <TooltipTTProductCell target="target" :details="{foo:{foo:'bar', baz:'baz'}}"/>
    </div>
    `
})

// named export Primary to create respective story
export const TTProductCell = PrimaryTemplate.bind({})
