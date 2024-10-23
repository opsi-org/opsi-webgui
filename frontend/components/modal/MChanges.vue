<template>

  <el-button
    :disabled="!changesExists"
    @click="dialogVisible = true"
    :type="changesExists ? 'danger' : 'success'"
  >
    <IconIIcon :icon="icons.trackChanges"/>
    {{$t('button.track.changes')}}
  </el-button>
  <el-dialog
    data-testid="MTrackChangesModal"
    v-model="dialogVisible"
  >
    <template #header>
      <div class="flex">
        <IconIIcon :icon="icons.info" class="min-w-5 min-h-5 mr-2"/>
        <h3>
          {{$t('button.track.changes')}}
        </h3>
      </div>
    </template>
    <!-- {{  modelValue }} -->
      <el-tabs v-model="activeName" lazy>
        <el-tab-pane :label="$t('title.hostparameters')" name="1">
          <el-scrollbar v-if="modelValue?.changesHostParam" class="max-h-96 overflow-scroll mb-2rounded-lg p-2 shadow-sm">
            <pre class="m-0 text-sm">{{ modelValue.changesHostParam }}</pre>
          </el-scrollbar>
          <span v-else>{{ $t("empty") }}</span>
        </el-tab-pane>
        <el-tab-pane :label="$t('title.prodactionsprops')" name="2" v-if="modelValue?.changesProducts.length > 0">
          <ModalMChangesTable v-if="modelValue" v-model="modelValue.changesProducts" />
        </el-tab-pane>
      </el-tabs>
    </el-dialog>
</template>

<script setup lang="ts">
// import { useNotification } from '~/composables/mixins/useComponent';
import { useIcons } from '~/composables/mixins/useIcons';

// const { notifyError } = useNotification()
const icons = useIcons()
const $t = useI18n().t
// const {username} = storeToRefs(storeAuth())
const modelValue = defineModel<Record<string,any>>()

const dialogVisible = ref<boolean>(false)

const changesExists = computed(() => {
  return modelValue.value?.changesHostParam?.length > 0 || modelValue.value?.changesProducts?.length > 0
})
const activeName = ref( (modelValue.value?.changesHostParam?.length > 0)? '1' : '2')
</script>
