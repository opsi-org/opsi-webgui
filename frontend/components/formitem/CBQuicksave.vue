<template>
  <div>
    <el-switch
      v-if="props.type==='checkbox'"
      v-model="cbValue"
      inline-prompt
      active-text="quicksave"
      inactive-text="cache"
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
        <span class="text-small">{{ $t('note.multiselect') }}</span>
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
import { useIcons } from '~/composables/mixins/useIcons';
const $t = useI18n().t
const settings = storeSettings()
const changes = storeChanges()

const emit = defineEmits(['action'])
const props = defineProps({
  type: { type: String, default: 'checkbox' }
})

const _dummy = ref(false)
const cbValue = computed({
  // get: () => _dummy.value,
  get: () => settings.quicksave,
  set: () => {}
})

// watch(()=>settings.quicksave, (val)=>{
//   if (val === true) {
//     if (changes.changesHostParam.length > 0) {
//       showModal()
//     } else if (changes.changesProducts.length > 0) {
//       showModal()
//     } else {

//     }
//   }
// })

 const changeSelectionMode = () => {
  if (settings.quicksave === false) {
    if (changes.changesHostParam.length > 1 || changes.changesProducts.length) {
      showModal()
      return
    }
  }
  settings.setQuicksave(!settings.quicksave)
  emit('action') // optional !?
}
/*
  showModal () { this.$root.$emit('bv::show::modal', 'modal-confirmMultiSelectionChange', '#btnShow') }
  hideModal () { this.$root.$emit('bv::hide::modal', 'modal-confirmMultiSelectionChange', '#btnShow') }
*/
const showModal = () => {
  // TODO
  alert('cbmultiselect cannot set Quicksave mode, cause there exists changes. showModal')
}
const hideModal = () => {
  alert('cbmultiselect hideModal')
  // TODO
}

</script>
<style scoped>
/* .quickpanelwarning {
  line-height: 0.9;
} */
</style>
