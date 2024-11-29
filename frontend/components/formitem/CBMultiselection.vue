<template>
  <div>
    <el-switch
      v-if="props.type==='checkbox'"
      v-model="cbValue"
      inline-prompt
      active-text="multi"
      inactive-text="single"
      size="large"
      v-bind="$props"
      @change="changeSelectionMode"
      />


  </div>
  <!-- <div>
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
  </div> -->
</template>

<script setup lang="ts">
// import { useIcons } from '~/composables/mixins/useIcons';
const $t = useI18n().t
const selections = storeSelections()
/*
import { Component, namespace, Prop, Vue, Watch } from 'nuxt-property-decorator'
import { Icons } from '../../mixins/icons'
const selections = namespace('selections')

@Component({ mixins: [Icons] })
export default class CBMultiselection extends Vue {
  icon: any
  $t: any
 */


/*
  @Prop({ default: 'checkbox' }) type!: string
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  @Prop({ default: undefined }) action: Function|undefined
 */
const emit = defineEmits(['action'])
const props = defineProps({
  type: { type: String, default: 'checkbox' }
})
/*
  // localMultiSelection:boolean = true
  @selections.Getter public selectionDepots!: Array<string>
  @selections.Getter public selectionClients!: Array<string>
  @selections.Getter public selectionProducts!: Array<string>
  @selections.Mutation public setSelectionDepots!: (s: Array<string>) => void
  @selections.Mutation public setSelectionClients!: (s: Array<string>) => void
  @selections.Mutation public setSelectionProducts!: (s: Array<string>) => void

  @selections.Getter public multiSelection!: boolean
  @selections.Mutation public setMultiSelection!: (isMultiSelection: boolean) => void
 */
/*
  set cbValue (val: boolean) {
    // do not remove. ckeckbox needs a setter (even if empty)
  }

  get cbValue (): boolean {
    return this.multiSelection
  }
*/
const _dummy = ref(false)
const cbValue = computed({
  // get: () => _dummy.value,
  get: () => selections.multiSelection,
  set: () => {}
})

/*
  @Watch('multiSelection') multiSelectionChanged () {
    if (this.multiSelection !== true) {
      if (this.selectionDepots.length > 1) { this.setSelectionDepots([this.selectionDepots[0]]) }
      if (this.selectionClients.length > 1) { this.setSelectionClients([this.selectionClients[0]]) }
      if (this.selectionProducts.length > 1) { this.setSelectionProducts([this.selectionProducts[0]]) }
    }
  }
 */
watch(()=>selections.multiSelection, (val)=>{
  if (val !== true) {
    if (selections.selectionDepots.length > 1) {
      selections.setSelectionDepots([selections.selectionDepots[0]])
    }
    if (selections.selectionClients.length > 1) {
      selections.setSelectionClients([selections.selectionClients[0]])
    }
    if (selections.selectionProducts.length > 1) {
      selections.setSelectionProducts([selections.selectionProducts[0]])
    }
  }
})
/*
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
 */

 const changeSelectionMode = () => {
  if (selections.multiSelection === true) {
    if (selections.selectionDepots.length > 1 || selections.selectionClients.length > 1 || selections.selectionProducts.length > 1) {
      showModal()
      return
    }
  }
  selections.setMultiSelection(!selections.multiSelection)
  emit('action') // optional !?
}
/*
  showModal () { this.$root.$emit('bv::show::modal', 'modal-confirmMultiSelectionChange', '#btnShow') }
  hideModal () { this.$root.$emit('bv::hide::modal', 'modal-confirmMultiSelectionChange', '#btnShow') }
*/
const showModal = () => {
  // TODO
  alert($t('multiselection.unabletosingleselect'))
}
// const hideModal = () => {
//   alert('cbmultiselect hideModal')
//   // TODO
// }

// function cancelSelectionModeModal () {
//   selections.setMultiSelection(selections.multiSelection)
// }

// function toggleSelectionMode () {
//   selections.setMultiSelection(!selections.multiSelection)
// }

// const helpModes = computed(()=> {
//     return [
//       { label: $t('label.on'), description: $t('description.multiselection.on') },
//       { label: $t('label.off'), description: $t('description.multiselection.off') }
//     ]
// })
</script>
