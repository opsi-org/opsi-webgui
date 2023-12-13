<template>
  <div>
    <!-- <AlertAAlertLocal
      v-if="(selectionDepots.length>1 || selectionClients.length > 1 || selectionProducts.length > 1) && !multiSelection"
      show
      variant="warning"
      class="multiselectionwarning"
    >
      <span class="text-small">{{ $t('message.error.multiSelectedItems') }}</span>
    </AlertAAlertLocal> -->
    <div v-if="type==='checkbox'" class="d-flex flex-nowrap justify-content-center border">
      <b-form-checkbox
        ref="refCBMultiSelectionMode"
        :checked="cbValue"
        data-testid="CBMultiselection"
        class="pt-1"
        size="sm"
        switch
        @click.native.prevent="changeSelectionMode"
      >
        <span class="sr-only">{{ cbValue ? $t('form.multiselection.enable'): $t('form.multiselection.disabled') }}</span>
        <span class="text-small">{{ $t('form.multiselection') }}</span>
        <b-icon
          id="help-cbmultiselection"
          data-testid="ButtonBTNHelp"
          :icon="icon.help"
          type="help"
          font-scale="0.9"
        />
      </b-form-checkbox>
      <b-tooltip target="help-cbmultiselection" data-testid="TTHelp">
        <span v-for="item, index in helpModes" :key="index">
          <GridGFormItem :label="item.label" :value="item.description" variant="longvalue" />
        </span>
      </b-tooltip>
    </div>
    <b-button v-else-if="type==='button'" :title="$t('form.multiselection.disable.tootltip')" @click="changeSelectionMode"> {{ $t('form.multiselection.disable') }} </b-button>
    <b-modal
      id="modal-confirmMultiSelectionChange"
      :title="$t('form.multiselection.modal.title')"
      :ok-title="$t('button.continue')"
      :cancel-title="$t('label.cancel')"
      ok-variant="success"
      cancel-variant="primary"
      @ok="toggleSelectionMode"
      @hidden="cancelSelectionModeModal"
    >
      <div class="d-block">{{ $t('form.multiselection.modal.content', {
        'btn.ok': $t('button.continue'),
        'btn.cancel': $t('label.cancel'),
      }) }}</div>
    </b-modal>
  </div>
</template>

<script lang="ts">
import { Component, namespace, Prop, Vue, Watch } from 'nuxt-property-decorator'
import { Icons } from '../../mixins/icons'
const selections = namespace('selections')

@Component({ mixins: [Icons] })
export default class CBMultiselection extends Vue {
  icon: any
  $t: any

  @Prop({ default: 'checkbox' }) type!: string
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  @Prop({ default: undefined }) action: Function|undefined

  // localMultiSelection:boolean = true
  @selections.Getter public selectionDepots!: Array<string>
  @selections.Getter public selectionClients!: Array<string>
  @selections.Getter public selectionProducts!: Array<string>
  @selections.Mutation public setSelectionDepots!: (s: Array<string>) => void
  @selections.Mutation public setSelectionClients!: (s: Array<string>) => void
  @selections.Mutation public setSelectionProducts!: (s: Array<string>) => void

  @selections.Getter public multiSelection!: boolean
  @selections.Mutation public setMultiSelection!: (isMultiSelection: boolean) => void

  set cbValue (val: boolean) {
    // do not remove. ckeckbox needs a setter (even if empty)
  }

  get cbValue (): boolean {
    return this.multiSelection
  }

  @Watch('multiSelection') multiSelectionChanged () {
    if (this.multiSelection !== true) {
      if (this.selectionDepots.length > 1) { this.setSelectionDepots([this.selectionDepots[0]]) }
      if (this.selectionClients.length > 1) { this.setSelectionClients([this.selectionClients[0]]) }
      if (this.selectionProducts.length > 1) { this.setSelectionProducts([this.selectionProducts[0]]) }
    }
  }

  changeSelectionMode (ev) {
    if (this.multiSelection === true) {
      if (this.selectionDepots.length > 1 || this.selectionClients.length > 1 || this.selectionProducts.length > 1) {
        this.showModal()
        return
      }
    }
    this.setMultiSelection(!this.multiSelection)
    if (this.action) { this.action() }
  }

  showModal () { this.$root.$emit('bv::show::modal', 'modal-confirmMultiSelectionChange', '#btnShow') }
  hideModal () { this.$root.$emit('bv::hide::modal', 'modal-confirmMultiSelectionChange', '#btnShow') }

  cancelSelectionModeModal (s) {
    this.setMultiSelection(this.multiSelection)
  }

  toggleSelectionMode () {
    this.setMultiSelection(!this.multiSelection)
  }

  get helpModes () {
    return [
      { label: this.$t('label.on'), description: this.$t('description.multiselection.on') },
      { label: this.$t('label.off'), description: this.$t('description.multiselection.off') }
    ]
  }
}
</script>
<style>
.quickpanelwarning {
  line-height: 0.9;
}
</style>
