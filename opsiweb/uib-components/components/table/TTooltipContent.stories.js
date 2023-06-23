export default {
  title: 'Table/T Tooltip Content',
  parameters: { docs: { description: { component: 'Table for Tooltip Content' } } }
}

const PrimaryTemplate = () => ({
  template: `<TableTTooltipContent
    type="version"
    :details="{server:{server:'baz',client1:'foo', client2:'bar'}}"
    :depot-version-diff="true" />
  `
})
// TODO: more stories/tests

export const TTooltipContent = PrimaryTemplate.bind({})
