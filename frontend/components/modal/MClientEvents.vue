
import type { select } from 'bootstrap-vue-next/dist/src/utils';

<template>
  <el-dialog
    v-model="modelValue"
    style="
      --el-color-info: var(--el-color-primary);
    "
    append-to-body
    v-bind="$props"
    >
    <template #header>
      <div class="flex">
        <IconIIcon :icon="events[props.event]?.icon" class="min-w-9 min-h-9"/>
        <h3>
          {{ $t(events[props.event]?.titlemodal) }}
        </h3>
      </div>
    </template>

    Event: {{ event }} <br />
    ID: {{ id }} <br />
    <!-- Events {{  events[props.event] }} <br /> -->

    <el-input
      v-if="props.event=='showpopup'"
      v-model="events.showpopup.params.params[0]"
      :rows="2"
      type="textarea"
      placeholder="Please input"
    />
    <div v-else-if="props.event=='ondemand'"
    >
      <el-radio-group v-model="events.ondemand.params.onlyIdFromParams">
        <el-radio :label="1">Only passed id</el-radio>
        <el-radio :label="2">All selected</el-radio>
      </el-radio-group>
      <el-card :shadow="(events.ondemand.params.onlyIdFromParams == 1) ? 'always' : 'never'"
        body-class="p-1 pt-3"
        :body-style="(events.ondemand.params.onlyIdFromParams != 1) ? 'color: var(--el-text-color-disabled)' : ''"
         >
        <ul >
          <li>{{ id }}</li>
        </ul>

      </el-card>
      <el-card :shadow="(events.ondemand.params.onlyIdFromParams == 2) ? 'always' : 'never'" body-class="p-0"
        :body-style="(events.ondemand.params.onlyIdFromParams != 2) ? 'color: var(--el-text-color-disabled)' : ''">
      <ul>
        <li v-for="c in selection" :key="c" class="p-2 ">
          <el-button
          :disabled="events.ondemand.params.onlyIdFromParams != 2"
          class="text-small"
          variant="outline-primary"
          :title="$t('button.delete')"
          size="small"
          @click="selectionDelete(c)"
          >x</el-button>
          {{ c }}
        </li>
      </ul>
      </el-card>
      <!-- checkboy for only selected client, or all selected clients -->
      <!-- <el-checkbox-group v-model="events[props.event]?.params?.params">
        <el-checkbox v-for="c in selection" :key="c" :label="c" class="modal-client-p text-small">
          {{ c }}
        </el-checkbox> -->
    </div>
    <!-- <MClientEventContentPopup v-if="props.event=='showpopup'" :id="props.id" v-model="events[]"/> -->
    <!-- :title="$t(events[props.event]?.titlemodal)" -->
    <!-- <el-form :model="form">
      <el-form-item label="Promotion name" :label-width="formLabelWidth">
        <el-input v-model="form.name" autocomplete="off" />
      </el-form-item>
      <el-form-item label="Zones" :label-width="formLabelWidth">
        <el-select v-model="form.region" placeholder="Please select a zone">
          <el-option label="Zone No.1" value="shanghai" />
          <el-option label="Zone No.2" value="beijing" />
        </el-select>
      </el-form-item>
    </el-form>
  -->
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="updateModel(false)">Cancel</el-button>
        <el-button type="primary" @click="callEvent()">
          Confirm
        </el-button>
      </span>
    </template>
  </el-dialog>

</template>

<script setup lang="ts">
import { useIcons } from '~/composables/mixins/useIcons';
import { useNotification } from '../../composables/mixins/useComponent';
const icon = useIcons()

const { selectionClients } = storeToRefs(storeSelections())
const selection = ref(JSON.parse(JSON.stringify(selectionClients.value)))
function selectionDelete(client: string) {
  const index = selection.value.indexOf(client)
  if (index > -1) {
    selection.value.splice(index, 1)
  }
}
const modelValue = defineModel<boolean>()
const props = defineProps({
  event: { type: String, default: '' },
  id: { type: String, default: '' },
  // type: { type: String, default: 'servers' },
})

function updateModel(value: boolean) {
  modelValue.value = value
}

const events = ref({
  showpopup: {
    tooltip: 'button.event.showpopup.tooltip',
    titlemodal: 'button.event.showpopup',
    icon: icon.message,

    params: {
      method: 'showPopup',
      params: ['Dummy text']
    }
  },
  ondemand: {
    tooltip: 'button.event.ondemand.tooltip',
    titlemodal: 'button.event.ondemand',
    icon: icon.ondemand,
    params: {
      method: 'fireEvent',
      params: ['on_demand'],
      onlyIdFromParams: 1,
      // client_ids: this.selectionClients
    }
  },
  reboot: {
    tooltip: 'button.event.reboot.tooltip',
    titlemodal: 'button.event.reboot',
    icon: icon.reboot,
    params: {
      method: 'reboot',
      params: [],
      // client_ids: this.selectionClients
    }
  },
  deployclientagent: {
    tooltip: 'button.event.deployclientagent.tooltip',
    titlemodal: 'button.event.deployclientagent',
    icon: icon.deploy,
    params: {
      method: 'deployClientAgent',
      params: [],
      // client_ids: this.selectionClients
    }
  },
  rename: {
    tooltip: 'button.event.rename.tooltip',
    titlemodal: 'button.event.rename',
    icon: icon.edit,
    params: {
      method: 'rename',
      params: [],
      // client_ids: this.selectionClients
    }
  },
  delete: {
    tooltip: 'button.event.delete.tooltip',
    titlemodal: 'button.event.delete',
    icon: icon.delete,
    params: {
      method: 'delete',
      params: [],
      // client_ids: this.selectionClients
    }
  },
})
function callEvent() {
  useNotification().success('[Dummy!] callEvent: ' + props.event)
  // const {data, error} = await useApiGETBody<Array<T_ClientAttr>>(`/opsidata/hosts?hosts=${id}`)
  // const {data, error} = await useClient().getClientIdList(storeSel.selectionDepots)
  // if (error) {
  //   console.log(error)
  //   useNotification().error(error)
  //   return
  // }
  // fetchedData.value = data.value
  updateModel(false)
}
</script>