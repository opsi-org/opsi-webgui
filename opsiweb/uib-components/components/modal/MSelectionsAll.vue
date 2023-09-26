<template>
  <div data-testid="MSelectionsAll">
    <b-button
      data-testid="MSelectionsAllButton"
      variant="outline-primary"
      size="sm"
      tabindex="0"
      :title="withText ? '' : $t('title.selectedElements')"
      @click="show = !show"
    >
      <b-icon :icon="icon.info" /> <span v-if="withText"> {{ $t('title.viewselection') }}</span>
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
      <GridGFormItem v-if="showDepots" :label="$t('title.depots')" variant="longlabel" labelclass="depots">
        <template #value>
          <b-form-textarea
            v-if="selectionDepots.length>0"
            rows="1"
            max-rows="10"
            size="sm"
            no-resize
            plaintext
            :value="[...selectionDepots].sort().join('\n')"
          />
          <span v-else>{{ $t('keep-english.empty') }}</span>
        </template>
      </GridGFormItem>
      <GridGFormItem v-if="showClients" :label="$t('title.clients')" variant="longlabel" labelclass="clients">
        <template #value>
          <b-form-textarea
            v-if="selectionClients.length>0"
            rows="1"
            max-rows="10"
            size="sm"
            no-resize
            plaintext
            :value="[...selectionClients].sort().join('\n')"
          />
          <span v-else>{{ $t('keep-english.empty') }}</span>
        </template>
      </GridGFormItem>
    </b-modal>
  </div>
</template>

<script lang="ts">
import { Component, namespace, Prop, Vue } from 'nuxt-property-decorator'
import { Icons } from '../../mixins/icons'
const selections = namespace('selections')

@Component({ mixins: [Icons] })
export default class MSelectionsAll extends Vue {
  show:boolean = false
  @Prop({ default: true }) showDepots!: boolean
  @Prop({ default: true }) showClients!: boolean
  @Prop({ default: false }) withText!: boolean
  icon:any
  $mq:any

  @selections.Getter public selectionDepots!: Array<string>
  @selections.Getter public selectionClients!: Array<string>
}
</script>
