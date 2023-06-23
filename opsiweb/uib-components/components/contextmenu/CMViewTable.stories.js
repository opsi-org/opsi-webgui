export default {
  title: 'contextmenu/CM View Table',
  parameters: { docs: { description: { component: 'Context menu for table' } } }
}

const DefaultVisibleTemplate = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  computed: { args () { return args } },
  mounted () {
    setTimeout(() => {
      this.$refs.cmviewtable.openMenu({ x: 100, y: 50, preventDefault: () => {} }, this.args.clientId)
    }, 200)
  },
  template: `<ContextmenuCMViewTable ref="cmviewtable" primary-key="clientId">
    <template #contextcontent-1>
    <li>specific content</li>
    </template>
    <template #contextcontent-general-1>
    <li>general content</li>
    </template>
  </ContextmenuCMViewTable>`
})

export const CMViewTable = DefaultVisibleTemplate.bind({})
CMViewTable.args = { clientId: 'client1.domain.local' }
