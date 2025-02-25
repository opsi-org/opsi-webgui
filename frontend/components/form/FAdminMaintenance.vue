<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
-->
<template>
  <div
    v-for="(actions, section) in adminTasks"
    :key="section"
    v-loading="isLoading[section]"
  >
    <h3 class="mt-4 text-lg font-semibold">
      {{ $t('title.' + section) }}
    </h3>

    <el-form
      v-if="section === 'applicationState'"
      label-width="50%"
      :label-position="mq.isMobile.value ? 'top' : 'left'"
    >
      <el-form-item
        v-for="(action, index) in actions"
        :key="index"
        :label="$t('label.' + section + '.' + action)"
      >
        <template v-if="action === 'current'">
          <el-text :type="currentAppStateColor">{{ currentAppState }}</el-text>
          <!-- Maybe add < br> < pre > { { currentAppStateObject } } /< pre >. -->
        </template>
        <template v-if="action === 'setup'">
          <el-form label-position="left" label-width="auto">
            <el-form-item label="">
              <el-radio-group v-model="newAppState.type">
                <el-radio
                  :label="item"
                  v-for="item in applicationStateValues"
                  :disabled="storeConfigapp().config?.read_only"
                  :key="item"
                  >{{ $t('label.' + item) }}</el-radio
                >
              </el-radio-group>
            </el-form-item>
            <template v-if="newAppState.type === 'maintenance'">
              <el-form-item :label="$t('label.addressexcept')">
                <el-select
                  v-model="newAppState.address_exceptions"
                  multiple
                  filterable
                  clearable
                  allow-create
                  default-first-option
                  :reserve-keyword="false"
                  :placeholder="$t('placeholder.netwrkadr')"
                >
                  <el-option
                    v-for="item in newAppState.address_exceptions"
                    :key="item"
                    :label="item"
                    :value="item"
                  />
                </el-select>
              </el-form-item>
              <el-form-item :label="$t('label.retryaftersec')">
                <el-input
                  v-model="newAppState.retry_after"
                  :disabled="storeConfigapp().config?.read_only"
                >
                </el-input>
              </el-form-item>
            </template>

            <div
              v-if="newAppState.type"
              class="button-container"
              style="display: flex; justify-content: flex-end"
            >
              <el-button
                @click="resetForm(section)"
                :disabled="storeConfigapp().config?.read_only"
              >
                {{ $t('button.reset') }}
              </el-button>
              <el-button
                type="success"
                @click="setAppState"
                :disabled="storeConfigapp().config?.read_only"
              >
                {{ $t('button.apply') }}
              </el-button>
            </div>
          </el-form>
        </template>
      </el-form-item>
    </el-form>
    <el-form
      v-else
      label-width="50%"
      :label-position="mq.isMobile.value ? 'top' : 'left'"
    >
      <el-form-item
        v-for="(value, key) in actions"
        :key="key"
        :label="$t('label.' + key)"
      >
        <el-checkbox
          v-if="typeof value == 'boolean'"
          v-model="actions[key]"
          :disabled="storeConfigapp().config?.read_only"
        />
        <el-input
          v-else-if="key === 'password'"
          v-model="actions[key]"
          :disabled="storeConfigapp().config?.read_only"
          show-password
        />
        <el-input-group v-else-if="key === 'server_id'" class="w-100 flex">
          <el-radio-group
            class="flex-shrink-0"
            v-model="serverIDValue"
            :disabled="storeConfigapp().config?.read_only"
          >
            <el-radio
              v-for="item in serverIDValues"
              :label="item"
              :key="item"
              :disabled="storeConfigapp().config?.read_only"
              >{{ $t('label.' + item) }}</el-radio
            >
            <!-- for transation keys: $t('label.backup'), $t('label.local'), $t('label.new') -->
          </el-radio-group>
          <el-input
            class="ml-2"
            v-if="actions[key] !== 'backup' && actions[key] !== 'local'"
            :placeholder="$t('placeholder.enterNewID')"
            required
            v-model="serverIDValueNew"
          />
        </el-input-group>
        <el-input-group v-else-if="key === 'file_id'" class="w-100 flex">
          <el-upload
            :action="UPLOADURL"
            v-model:file-list="files"
            ref="uploadFileRef"
            :limit="2"
            :auto-upload="false"
            :on-change="handleChangeFile"
            :disabled="storeConfigapp().config?.read_only"
          >
            <el-button :disabled="storeConfigapp().config?.read_only">{{
              $t('placeholder.fileupload')
            }}</el-button>
          </el-upload>
        </el-input-group>
        <el-input v-else v-model="actions[key]" />
      </el-form-item>
      <div
        class="button-container"
        style="display: flex; justify-content: flex-end"
      >
        <el-button
          @click="resetForm(section)"
          :disabled="storeConfigapp().config?.read_only"
        >
          {{ $t('button.reset') }}
        </el-button>
        <el-button
          type="success"
          :disabled="storeConfigapp().config?.read_only"
          @click="
            () => {
              section === 'createBackup'
                ? executeCreateBackup()
                : executeRestoreBackup()
            }
          "
        >
          {{
            section === 'createBackup'
              ? $t('button.create')
              : $t('button.restore')
          }}
        </el-button>
      </div>
    </el-form>
  </div>
</template>

<script setup lang="ts">
  import type {
    UploadInstance,
    UploadProps,
    UploadUserFile,
  } from 'element-plus'
  import { useNotification } from '~/composables/mixins/useComponent'
  import { useMBus } from '~/composables/mixins/useMessagebus'
  const { notifySuccess, notifyError } = useNotification()

  interface AppState {
    type: string
    address_exceptions: string[]
    retry_after: number
  }

  interface TFileId {
    file_id: string
  }
  const serverIDValues = ['backup', 'local', 'new'] // for translation key search: $t('label.backup'), $t('label.local'), $t('label.new')
  const serverIDValue = ref('backup')
  const serverIDValueNew = ref('')
  const applicationStateValues = ['normal', 'maintenance'] // for translation key search: $t('label.normal'), $t('label.maintenance')

  const adminTasks = reactive({
    applicationState: ['current', 'setup'], // for translation key search: $t('title.applicationState'), $t('label.applicationState.current'), $t('label.applicationState.setup')
    createBackup: {
      // for translation key search: $t('title.createBackup')
      config_files: true, // for translation key search: $t('label.config_files')
      redis_data: false, // for translation key search: $t('label.redis_data')
      maintenance_mode: false, // for translation key search: $t('label.maintenance_mode')
      password: '', // for translation key search: $t('label.password')
    },
    restoreBackup: {
      // for translation key search: $t('title.restoreBackup')
      file_id: '', // for translation key search: $t('label.file_id')
      config_files: false, // for translation key search: $t('label.config_files')
      redis_data: false, // for translation key search: $t('label.redis_data')
      server_id: serverIDValue.value, // for translation key search: $t('label.server_id')
      password: '', // for translation key search: $t('label.password')
    },
  })
  watch(
    () => serverIDValue.value,
    (newVal) => {
      adminTasks.restoreBackup.server_id = newVal
    },
  )
  watch(
    () => serverIDValueNew.value,
    (newVal) => {
      adminTasks.restoreBackup.server_id = newVal
    },
  )
  const $t = useI18n().t
  const mq = useMQ()
  const currentAppState = ref('')
  const currentAppStateObject = ref<any>()
  const isLoading = ref({
    applicationState: false,
    createBackup: false,
    restoreBackup: false,
  })
  const newAppState = ref<AppState>({
    type: '',
    address_exceptions: [],
    retry_after: 0,
  })
  const uploadFileRef = ref<UploadInstance>()
  const files = ref<UploadUserFile[]>()
  const ERRORTEXT = $t('message.error.fetch')
  const UPLOADURL = useFullUrlPath('/file-transfer/multipart', '')
  const _msgbus = useMBus(wsBusMsgObjectChanged, false, $t)

  onMounted(async () => {
    await fetchAppState()
  })
  watch(
    () => files.value,
    () => {
      console.warn('new files', files.value)
    },
  )

  const currentAppStateColor = computed(() => {
    if (currentAppState.value === 'normal') return 'success'
    if (currentAppState.value === 'maintenance') return 'warning'
    return 'danger'
  })

  async function wsBusMsgObjectChanged(msg: any = undefined) {
    if (msg && msg.channel === 'event:app_state_changed') {
      console.warn('message bus: ', msg)
      console.warn('message bus: ', msg.data.state)
      currentAppState.value = msg.data.state.type
      currentAppStateObject.value = msg.data.state
    }
  }

  const handleChangeFile: UploadProps['onChange'] = (
    uploadFile,
    uploadFiles,
  ) => {
    files.value = uploadFiles.slice(-1) // limit to one file

    if (!uploadFileRef.value || !(uploadFileRef.value as any)[0]) {
      notifyError({ message: $t('message.error.file.upload') })
      return
    }
    ;(uploadFileRef.value as any)[0].submit()
  }

  const fetchAppState = async () => {
    isLoading.value.applicationState = true
    const { data, error } = await useApiGET<AppState>('/app-state')
    if (error || !data.value) {
      notifyError({ message: error?.response?.data?.message })
      currentAppState.value = ERRORTEXT
      isLoading.value.applicationState = false
      return
    }
    currentAppState.value = data.value.type
    currentAppStateObject.value = data.value
    isLoading.value.applicationState = false
  }

  const setAppState = async () => {
    isLoading.value.applicationState = true
    const { data, error } = await useApiPOST('/app-state', newAppState.value)
    if (error) {
      notifyError({ message: error?.response?.data?.message })
      isLoading.value.applicationState = false
      return
    }
    currentAppState.value = (data.value as { type: any }).type
    isLoading.value.applicationState = false
  }

  async function executeCreateBackup() {
    isLoading.value.createBackup = true

    const { data, error } = await useApiPOST<string>(
      '/backup/create',
      adminTasks.createBackup,
    )
    if (error) {
      notifyError({ message: error?.response?.data?.message })
      return
    }
    if (data.value) {
      console.warn('response', data.value)
      const downloadLink = document.createElement('a')
      downloadLink.setAttribute(
        'href',
        `/file-transfer/${data.value}?delete=true`,
      )
      downloadLink.style.display = 'none'
      document.body.appendChild(downloadLink)
      downloadLink.click()
      document.body.removeChild(downloadLink)
      notifySuccess({ message: $t('success.backup.created') })
    }
    isLoading.value.createBackup = false
  }

  async function executeRestoreBackup() {
    isLoading.value.restoreBackup = true
    // getting file_id from (already uploaded) file
    if (
      !files.value ||
      !files.value[0] ||
      !files.value[0].raw ||
      !files.value[0].response
    ) {
      notifyError({ message: $t('message.error.file.required') })
      isLoading.value.restoreBackup = false
      return
    }
    const fileresponse = files.value[0].response as TFileId
    adminTasks.restoreBackup.file_id = fileresponse.file_id

    await requestRestore()
    isLoading.value.restoreBackup = false
  }

  async function requestRestore() {
    const { error } = await useApiPOST(
      '/backup/restore',
      adminTasks.restoreBackup,
    )
    if (error) {
      notifyError({ message: error?.response?.data?.message })
      return
    }
    notifySuccess({ message: $t('success.backup.restored') })
  }

  function resetForm(section: string) {
    if (section === 'applicationState') {
      newAppState.value = { type: '', address_exceptions: [], retry_after: 0 }
    } else if (section === 'createBackup') {
      adminTasks[section] = {
        config_files: true,
        redis_data: false,
        maintenance_mode: false,
        password: '',
      }
    } else if (section === 'restoreBackup') {
      adminTasks[section] = {
        file_id: '',
        config_files: false,
        redis_data: false,
        server_id: '',
        password: '',
      }
    }
  }
</script>
