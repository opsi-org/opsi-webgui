<template>
  <div>
    <b-badge
      class="selection_badge"
      variant="transparent"
      size="sm"
      @click="$bvModal.show(type + 'selection')"
    >
      {{ selections.length }}
    </b-badge>
    <b-modal
      :id="type + 'selection'"
      class="modalselection"
      :title="'Selected ' + type"
      centered
      scrollable
      hide-footer
      no-fade
    >
      {{ selections }}
    </b-modal>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'

@Component export default class MSelections extends Vue {
  @Prop({ }) type!: string
  @Prop({ }) selections!: Array<string>
}
</script>
