export default {
  title: 'Grid/G Host Parameter',
  parameters: { docs: { description: { component: 'Grid for Host Parameters' } } }
}

const PrimaryTemplate = () => ({
  template: `
  <GridGHostParam />
  `
})

// named export Primary to create respective story
export const GHostParam = PrimaryTemplate.bind({})
