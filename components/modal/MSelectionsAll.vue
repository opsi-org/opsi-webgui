<template>
  <div data-testid="MSelectionsAll">
    <b-button
      variant="primary"
      class="mt-2 border-0 text-left"
      :class="{ 'pl-3': $mq=='mobile' }"
      size="md"
      tabindex="0"
      :title="withText ? '' : $t('title.selectedElements')"
      @click="show = !show"
    >
      <b-icon :icon="iconnames.info" /> <span v-if="withText"> {{ $t('title.selectedElements') }}</span>
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
  @Prop({ default: false }) withText!: boolean
  iconnames:any
  $mq:any

  @selections.Getter public selectionDepots!: Array<string>
  @selections.Getter public selectionClients!: Array<string>
  @selections.Getter public selectionProducts!: Array<string>
}
</script>
