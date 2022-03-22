<template>
  <div>
    <b-badge
      class="selection_badge btn"
      variant="transparent"
      size="sm"
      tabindex="0"
      :title="$t('treeselect.selectioncount', { type: $t('title.'+ type) })"
      @click="$bvModal.show(type + 'selection')"
    >
      {{ selections.length }}
    </b-badge>
    <b-modal
      :id="type + 'selection'"
      class="modalselection"
      :title="$t('treeselect.selectioncount', { type: $t('title.'+ type) })"
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
<style>
.selection_badge {
  margin-top: var(--min-line-height);
  line-height: 1.5 !important;
}
</style>
