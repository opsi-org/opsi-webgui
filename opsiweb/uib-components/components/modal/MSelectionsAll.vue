<template>
  <div data-testid="MSelectionsAll">
    <b-button
      data-testid="MSelectionsAllButton"
      variant="primary"
      class="global_topbar_button px-2 text-left btn btn-primary border-0"
      :class="{ 'pt-0 pb-0 pl-3  w-100': $mq=='mobile'}"
      size="md"
      tabindex="0"
      :title="withText ? '' : $t('title.selectedElements')"
      @click="show = !show"
      >
      <!-- class="border-0 global_topbar_button"
      :class="{ 'pl-3': $mq=='mobile' }" -->
      <b-icon :icon="iconnames.info" /> <span v-if="withText"> {{ $t('title.selectedElements') }}</span>
    </b-button>

    <b-modal
      v-model="show"
      class="modalselection"
      data-testid="MSelectionsModal"
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
  @Prop({ default: true }) navbar!: boolean
  @Prop({ default: true }) showDepots!: boolean
  @Prop({ default: true }) showClients!: boolean
  @Prop({ default: false }) showProducts!: boolean
  @Prop({ default: false }) withText!: boolean
  iconnames:any
  $mq:any

  @selections.Getter public selectionDepots!: Array<string>
  @selections.Getter public selectionClients!: Array<string>
  @selections.Getter public selectionProducts!: Array<string>
}
</script>
