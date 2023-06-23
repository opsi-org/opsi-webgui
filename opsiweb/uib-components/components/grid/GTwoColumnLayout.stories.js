export default {
  title: 'Grid/G Two Column Layout',
  parameters: { docs: { description: { component: 'Grid for two column layout' } } }
}

const PrimaryTemplate = () => ({
  template: `
  <GridGTwoColumnLayout :showchild="true" parent-id="pid">
    <template #parent><div style="border:1px solid black">Parent</div></template>
    <template #child><div style="border:1px solid blue">Child</div></template>
  </GridGTwoColumnLayout>
  `
})

export const GTwoColumnLayout = PrimaryTemplate.bind({})
