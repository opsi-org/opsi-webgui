<template>
  <div data-testid="MSelections">
    <b-button
      :disabled="selections.length < 1"
      :variant="variant"
      class="border-0 mt-1"
      size="sm"
      tabindex="0"
      :title="$t('treeselect.selectioncount', { type: id })"
      @click="$bvModal.show(type + '-selection-' + id)"
    >
      {{ selections.length }}
    </b-button>

    <b-modal
      :id="type + '-selection-' + id"
      class="modalselection"
      data-testid="MSelectionsModal"
      :title="$t('treeselect.selectioncount', { type: id })"
      centered
      scrollable
      hide-footer
      no-fade
    >
      <b-form-textarea
        rows="2"
        size="sm"
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
