export default {
  title: 'Grid/G Host Param',
  parameters: { docs: { description: { component: 'Grid for Host Parameters' } } }
}

const PrimaryTemplate = () => ({
  template: `
  <GridGHostParam />
  `
})

export const GHostParam = PrimaryTemplate.bind({})
