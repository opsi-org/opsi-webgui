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
        <IconIIcon :icon="eventWrapper.icon" class="min-w-9 min-h-9"/>
        <h3>
          {{ $t(eventWrapper.titlemodal) }}
        </h3>
      </div>
    </template>

    <!-- Event: {{ event }} <br />
    ID: {{ id }} <br /> -->
    <div v-if="props.event=='showpopup'"
    >
      <el-input
        v-model="events.showpopup.params.params[0]"
        :rows="2"
        type="textarea"
        placeholder="Please input"
      />
      {{ id }} <br/>
      {{ $t('button.event.modal.footer', {event}) }} <br/>
    </div>

    <div v-if="props.event=='ondemand'">
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
        {{ $t('button.event.modal.footer', {event}) }} <br/>
    </div>
    <div v-if="props.event=='ondemand-all'">
      <el-card shadow="always" body-class="p-0">
      <ul>
        <li v-for="c in selection" :key="c" class="p-2 ">
          <el-button
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
        {{ $t('button.event.modal.footer', {event}) }} <br/>
      <!-- checkboy for only selected client, or all selected clients -->
      <!-- <el-checkbox-group v-model="eventWrapper.params?.params">
        <el-checkbox v-for="c in selection" :key="c" :label="c" class="modal-client-p text-small">
          {{ c }}
        </el-checkbox> -->
    </div>

    <div v-if="props.event=='reboot'">
      {{ id }} <br />
      {{ $t('button.event.modal.footer', {event}) }} <br/>
    </div>

    <div v-if="props.event=='deployclientagent'">
      <el-form label-width="120px">
        <el-form-item :label="$t('form.clientId')" ><el-input class="border-0" disabled :placeholder="id"/></el-form-item>
        <el-form-item :label="$t('form.username')" ><el-input class="border-0" v-model="events.deployclientagent.params.user" /></el-form-item>
        <el-form-item :label="$t('form.password')" class="flex">
          <el-input class="border-0" v-model="events.deployclientagent.params.password" :type="(events.deployclientagent.params.passwordVisible) ? 'password' : ''" >

            <template #append>
              <el-button @click="events.deployclientagent.params.passwordVisible = !events.deployclientagent.params.passwordVisible" class="text-on-primary"> <IconIIcon :icon="events.deployclientagent.params.passwordVisible ? icon.valueHide : icon.valueShow"></IconIIcon></el-button>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item :label="$t('form.type')" ><el-input class="border-0" v-model="events.deployclientagent.params.type" /></el-form-item>
      </el-form>
    </div>

    <div v-if="props.event=='rename'">
      <el-form>
        <el-form-item label="Old name" :label-width="150">
          <el-input :placeholder="id" disabled />
        </el-form-item>
        <el-form-item label="New name" :label-width="150">
          <el-input v-model="events.rename.params.newName" autocomplete="off" />
        </el-form-item>
        <!-- <el-form-item label="Domain" :label-width="150">
          <el-input disabled v-model="events.rename.params.newDomain" autocomplete="off" />
        </el-form-item> -->
      </el-form>
    </div>
    <div v-if="props.event=='delete'">
      {{ $t('message.confirm.deleteClient', {client: id}) }} <br/>
    </div>
    <!-- <MClientEventContentPopup v-if="props.event=='showpopup'" :id="props.id" v-model="events[]"/> -->
    <!-- :title="$t(eventWrapper.titlemodal)" -->
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
        <el-button @click="updateModel(false)">{{  $t('label.cancel') }}</el-button>
        <el-button :type="eventWrapper.buttonConfirmVariant" :disabled="confirmDisabled" @click="callEvent()"> {{  $t(eventWrapper.buttonConfirm) }}</el-button>
      </span>
    </template>
  </el-dialog>

</template>

<script setup lang="ts">
import { useIcons } from '~/composables/mixins/useIcons';
import { useNotification } from '../../composables/mixins/useComponent';
const icon = useIcons()

const modelValue = defineModel<boolean>()
const props = defineProps({
  event: { type: String, default: '' },
  id: { type: String, default: '' },
})

const { selectionClients } = storeToRefs(storeSelections())
const selection = ref(JSON.parse(JSON.stringify(selectionClients.value)))
const events = ref({
  showpopup: {
    tooltip: 'button.event.showpopup.tooltip',
    titlemodal: 'button.event.showpopup',
    icon: icon.message,
    buttonConfirm: 'button.confirm',
    buttonConfirmVariant: 'primary',

    params: {
      method: 'showPopup',
      params: ['Dummy text']
    }
  },
  ondemand: {
    tooltip: 'button.event.ondemand.tooltip',
    titlemodal: 'button.event.ondemand',
    icon: icon.ondemand,
    buttonConfirm: 'button.confirm',
    buttonConfirmVariant: 'primary',
    params: {
      method: 'fireEvent',
      params: ['on_demand'],
      onlyIdFromParams: 1,
    }
  },
  reboot: {
    tooltip: 'button.event.reboot.tooltip',
    titlemodal: 'button.event.reboot',
    icon: icon.reboot,
    buttonConfirm: 'button.confirm',
    buttonConfirmVariant: 'primary',
    params: {
      method: 'reboot',
      params: [],
      // client_ids: this.selectionClients
    }
  },
  deployclientagent: {
    tooltip: 'button.event.deployclientagent.tooltip',
    titlemodal: 'label.clientagent',
    icon: icon.deploy,
    buttonConfirm: 'button.confirm',
    buttonConfirmVariant: 'primary',
    params: {
      method: 'deployClientAgent',
      // params: ['','',''],
      user: 'Administrator',
      password: '',
      type: 'windows',
      passwordVisible: false,

      // client_ids: this.selectionClients
    }
  },
  rename: {
    tooltip: 'button.event.rename.tooltip',
    titlemodal: 'title.renameClient',
    icon: icon.edit,
    buttonConfirm: 'label.rename',
    buttonConfirmVariant: 'primary',
    params: {
      method: 'rename',
      params: [],
      newName: props.id.split('.')[0],
      newDomain: props.id.split('.')[1] + '.'+props.id.split('.')[2],
      // client_ids: this.selectionClients
    }
  },
  delete: {
    tooltip: 'button.event.delete.tooltip',
    titlemodal: 'title.deleteClient',
    icon: icon.delete,
    buttonConfirm: 'label.delete',
    buttonConfirmVariant: 'danger',
    params: {
      method: 'delete',
      params: [],
      // client_ids: this.selectionClients
    }
  },
})

const confirmDisabled = computed(() => {
  if (props.event === 'ondemand-all')
    return selection.value.length === 0
  if (props.event === 'ondemand' && events.value.ondemand.params.onlyIdFromParams == 2)
    return selection.value.length === 0
  return false
})

const eventWrapper = computed(() => {
  if (props.event === 'ondemand-all')
    return events.value['ondemand']
  return events.value[props.event]
})
function updateModel(value: boolean) {
  modelValue.value = value
}

function selectionDelete(client: string) {
  const index = selection.value.indexOf(client)
  if (index > -1) {
    selection.value.splice(index, 1)
  }
}

function callEvent() {
  useNotification().success('[Dummy!] callEvent: ' + props.event)
  // TODO: call api
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