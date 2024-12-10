<template>
  <div
    v-for="(actions, section) in adminTasks"
    :key="section"
    v-loading="isLoading[section]"
  >
    <el-row class="mt-2 mb-2 text-small">
      <b :class="['title' + section]">{{ $t('title.' + section) }}</b>
    </el-row>
    <el-form
      v-if="section === 'applicationState'"
      :label-width="mq.isMobile.value ? '' : '230px'"
      :label-position="mq.isMobile.value ? 'top' : 'right'"
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
          <el-form
            :label-width="mq.isMobile.value ? '' : '180px'"
            :label-position="mq.isMobile.value ? 'top' : 'left'"
            class="w-100"
          >
            <el-form-item label="">
              <el-radio-group v-model="newAppState.type">
                <el-radio
                  :label="item"
                  v-for="item in ['normal', 'maintenance']"
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
                <el-input v-model="newAppState.retry_after" />
              </el-form-item>
            </template>
            <template v-if="newAppState.type">
              <el-button type="primary" @click="resetForm(section)">
                {{ $t('button.reset') }}
              </el-button>
              <el-button type="success" @click="setAppState">
                {{ $t('button.apply') }}
              </el-button>
            </template>
          </el-form>
        </template>
      </el-form-item>
    </el-form>
    <el-form
      v-else
      :label-width="mq.isMobile.value ? '' : '230px'"
      :label-position="mq.isMobile.value ? 'top' : 'right'"
    >
      <el-form-item
        v-for="(value, key) in actions"
        :key="key"
        :label="$t('label.' + key)"
      >
        <el-checkbox v-if="typeof value == 'boolean'" v-model="actions[key]" />
        <el-input
          v-else-if="key === 'password'"
          v-model="actions[key]"
          show-password
        />
        <el-input-group v-else-if="key === 'server_id'" class="w-100 flex">
          <el-radio-group class="flex-shrink-0" v-model="actions[key]">
            <el-radio
              :label="item"
              v-for="item in ['backup', 'local', 'new']"
              :key="item"
              >{{ $t('label.' + item) }}</el-radio
            >
          </el-radio-group>
          <el-input
            class="ml-2"
            v-if="actions[key] === 'new'"
            :placeholder="$t('placeholder.enterNewID')"
            required
            v-model="actions[key]"
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
          >
            <el-button type="primary">{{
              $t('placeholder.fileupload')
            }}</el-button>
          </el-upload>
        </el-input-group>
        <el-input v-else v-model="actions[key]" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="resetForm(section)">
          {{ $t('button.reset') }}
        </el-button>
        <el-button
          type="success"
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
      </el-form-item>
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
  const adminTasks = reactive({
    applicationState: ['current', 'setup'],
    createBackup: {
      config_files: true,
      redis_data: false,
      maintenance_mode: false,
      password: '',
    },
    restoreBackup: {
      file_id: '',
      config_files: false,
      redis_data: false,
      server_id: 'backup',
      password: '',
    },
  })
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
