<script>
import Treeselect from '@riophae/vue-treeselect'

export default {
  extends: Treeselect,
  props: {
    editable: Boolean
  },
  data () {
    return { overridesLastNodeId: 0 }
  },
  watch: {
    'trigger.searchQuery' () {
      if (this.searchable) {
        this.$emit('search-not-empty', this.trigger.searchQuery.length > 0)
      }
    }
  },
  methods: {
    overridesFindValue () {
      if (this.$refs.control) {
        const childRefs = this.$refs.control.$refs
        if (childRefs['value-container']) {
          const valueContainer = childRefs['value-container']
          if (valueContainer.$refs.input) {
            return valueContainer.$refs.input.value
          }
        }
      }

      return null
    },
    overridesCheckValueInNodes (value) {
      let childHasValue = false
      this.traverseAllNodesDFS((node) => {
        if (node.label === value) {
          childHasValue = true
        }
      })
      return childHasValue
    },
    select (node) {
      /**
       * Here we override the select(node) method from
       * the library, we will inject a new node if a node
       * doesn't exist and then proxy this method to the original!
       */
      const value = this.overridesFindValue()
      if (typeof value === 'string' && value.length === 0) {
        // This function gets called internally a lot, so we need
        // to make sure it's proxied when there is no value
        if (this.options.length > 0) {
          return Treeselect.mixins[0].methods.select.call(this, node)
        }
        // eslint-disable-next-line no-console
        console.debug('Nothing to add')

        return
      }

      if (value && value !== '') {
        if (this.overridesCheckValueInNodes(value)) {
          // If there is a value, we just fallback to the default function
          this.resetSearchQuery()
          return Treeselect.mixins[0].methods.select.call(this, node)
        }
      }

      if (!this.editable) { return }
      /**
       * Finally, here's the solution to your question.
       * We can emit a new node here, call your append function
       * sending it the ID and making this work.
       */
      // const id = `new-node-${++this.overridesLastNodeId}`

      const elem = { id: value, text: value, type: 'ObjectToGroup', isNew: true }
      this.$emit('new-node', elem)
      // this.$emit('new-node', { value, id })
      /**
       * Additionally, to make the select select our value
       * we need to 'emit' it to v-model as well
       */
      if (!this.multiple) {
        this.$emit('input', [value])
      } else {
        this.$emit('input', [...this.value])
      }
      /**
       * Finally, let's reset the input
       */
      this.resetSearchQuery()
    }
  }
}
</script>
