<template>
  <div data-testid="MSelections">
    <b-badge
      class="selection_badge btn border-0"
      :disabled="selections.length < 1"
      :variant="variant"
      size="sm"
      tabindex="0"
      :title="$t('treeselect.selectioncount', { type: $t('title.'+ type) })"
      @click="$bvModal.show(type + '-selection-' + id)"
    >
      {{ selections.length }}
    </b-badge>
    <b-modal
      :id="type + '-selection-' + id"
      class="modalselection"
      data-testid="MSelectionsModal"
      :title="$t('treeselect.selectioncount', { type: $t('title.'+ type) })"
      centered
      scrollable
      hide-footer
      no-fade
    >
      <b-form-textarea
        rows="2"
        max-rows="30"
        no-resize
        plaintext
        :value="selections.join('\n')"
      />
      <div class="float-right">
        <slot name="clear" />
      </div>
    </b-modal>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'

@Component export default class MSelections extends Vue {
  @Prop({ }) id!: string
  @Prop({ default: 'transparent' }) variant!: string
  @Prop({ }) type!: string
  @Prop({ }) selections!: Array<string>
}
</script>
<style>
.selection_badge {
  margin-top: var(--min-line-height);
  line-height: 1.5 !important;
  width: 20px !important;
  border: unset !important;
  padding: 0px !important;
  font-size: small !important;
  background-color: inherit !important;
  color: inherit !important;
  border-color: unset !important;
}

.selection_badge.btn {
  max-height: 20px !important;
  min-height: 20px !important;
}
</style>
