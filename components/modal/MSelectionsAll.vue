<template>
  <div data-testid="MSelectionsAll">
    <b-button
      variant="outline-primary"
      class="mt-2 border-0"
      size="md"
      tabindex="0"
      @click="show = !show"
    >
      <!-- class="h-100" -->
      <!-- {{ selection.length }} -->
      <b-icon :icon="iconnames.info" />
    </b-button>

    <b-modal
      v-model="show"
      class="modalselection"
      :title="$t('title.selectedElements')"
      centered
      scrollable
      hide-footer
      hide-title
      no-fade
    >
      <div v-if="showDepots">
        <h6 class="depots">
          {{ $t('title.depots') }}
        </h6>
        <b-form-textarea
          rows="2"
          max-rows="30"
          no-resize
          plaintext
          :value="[...selectionDepots].sort().join('\n')"
        />
        <br>
      </div>
      <div v-if="showClients">
        <h6 class="clients">
          {{ $t('title.clients') }}
        </h6>
        <b-form-textarea
          rows="2"
          max-rows="30"
          no-resize
          plaintext
          :value="[...selectionClients].sort().join('\n')"
        />
        <br>
      </div>
      <div v-if="showProducts">
        <h6>
          {{ $t('title.products') }}
        </h6>
        <b-form-textarea
          rows="2"
          max-rows="30"
          no-resize
          plaintext
          :value="[...selectionProducts].sort().join('\n')"
        />
      </div>
    </b-modal>
  </div>
</template>

<script lang="ts">
import { Component, namespace, Prop, Vue } from 'nuxt-property-decorator'
import { Constants } from '../../mixins/uib-mixins'
const selections = namespace('selections')

@Component({ mixins: [Constants] })
export default class MSelectionsAll extends Vue {
  show:boolean = false
  @Prop({ default: true }) showDepots!: string
  @Prop({ default: true }) showClients!: string
  @Prop({ default: false }) showProducts!: string
  // @Prop({ }) type!: string
  // @Prop({ }) selections!: Array<string>

  @selections.Getter public selectionDepots!: Array<string>
  @selections.Getter public selectionClients!: Array<string>
  @selections.Getter public selectionProducts!: Array<string>
}
</script>
<style>
.selection_badge {
  margin-top: var(--min-line-height);
  line-height: 1.5 !important;
  width: 20px !important;
  max-width: 20px !important;
  height: 20px !important;
  max-height: 20px !important;
  min-height: 20px !important;
  border: unset !important;
  padding: 0px !important;
  font-size: small !important;
  background-color: inherit !important;
  color: inherit !important;
}
</style>
