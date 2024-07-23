<template>
  <div v-for="(actions, section) in adminTasks">
    <el-row class="mt-2 mb-2 text-small">
        <b :class="['title' + section]">{{ $t('title.' + section) }}</b>
    </el-row>
    <el-form v-if="section === 'applicationState'" :label-width="mq.isMobile.value ? '': '230px'" :label-position="mq.isMobile.value ? 'top': 'right'">
      <el-form-item
        v-for="(action, index) in actions"
        :key="index"
        :label="$t('label.' + section + '.' + action)"
      >
        <template v-if="action === 'current'">
          {{ currentAppState }}
        </template>
        <template v-if="action === 'setup'">
          <el-form :label-width="mq.isMobile.value ? '': '180px'" :label-position="mq.isMobile.value ? 'top': 'left'" class="w-100">
            <el-form-item label="">
              <el-radio-group v-model="newAppState.type">
                <el-radio :label="item" v-for="item in ['normal', 'maintenance']" :key="item">{{ $t('label.' + item) }}</el-radio>
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
    <el-form v-else :label-width="mq.isMobile.value ? '': '230px'" :label-position="mq.isMobile.value ? 'top': 'right'">
      <el-form-item
        v-for="(value, key) in actions"
        :key="key"
        :label="$t('label.'+ key)"
      >
          <el-checkbox v-if="typeof value == 'boolean'" v-model="actions[key]" />
          <el-input v-else-if="key === 'password'" v-model="actions[key]" show-password />
          <el-input-group v-else-if="key === 'server_id'" class="w-100 flex">
            <el-radio-group class="flex-shrink-0" v-model="actions[key]">
              <el-radio :label="item" v-for="item in ['backup', 'local', 'new']" :key="item">{{ $t('label.' + item) }}</el-radio>
            </el-radio-group>
            <el-input class="ml-2" v-if="actions[key] === 'new'" :placeholder="$t('placeholder.enterNewID')" required v-model="actions[key]" />
          </el-input-group>
          <el-input-group v-else-if="key === 'file_id'" class="w-100 flex">
            <el-upload
              v-model:file-list="actions[key]"
            >
              <el-button type="primary">{{ $t('placeholder.fileupload') }}</el-button>
            </el-upload>
          </el-input-group>
          <el-input v-else v-model="actions[key]" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="resetForm(section)">
          {{ $t('button.reset') }}
        </el-button>
        <el-button type="success" @click="section === 'createBackup' ? executeCreateBackup : executeRestoreBackup">
          {{ section === 'createBackup' ? $t('button.create') : $t('button.restore')}}
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { useIcons } from "../../composables/mixins/useIcons"
import { useNotification } from '~/composables/mixins/useComponent';
const { notifySuccess, notifyError } = useNotification()

const adminTasks = reactive({
  applicationState : ['current', 'setup'],
  createBackup : {
    config_files: true,
    redis_data:false,
    maintenance_mode: false,
    password: ''
  },
  restoreBackup : {
    file_id: '',
    config_files: false,
    redis_data:false,
    server_id: 'backup',
    password: ''
  }
})
const icon = useIcons()
const $t = useI18n().t
const mq = useMQ()
const currentAppState = ref('')
const isLoading = ref(false)
const newAppState = ref({ type: '', address_exceptions: [], retry_after: 0 })

onMounted(async ()=> {
  await fetchAppState()
})

const fetchAppState = async () => {
  isLoading.value = true
  const {data, error } = await useApiGET('/app-state')
  if (error) {
    notifyError({ message: error?.response?.data?.message })
    return
  }
  currentAppState.value = (data.value as { type: any }).type
  isLoading.value = false
}

const setAppState = async () => {
  isLoading.value = true
  const { data, error } = await useApiPOST('/app-state', newAppState.value)
  if (error) {
    notifyError({ message: error?.response?.data?.message })
    return
  }
  currentAppState.value = (data.value as { type: any }).type
  isLoading.value = false
}

const executeCreateBackup = async () => {
  isLoading.value = true
  await useApiPOST('/backup/create', adminTasks.createBackup)
    .then((response) => {
      const downloadLink = document.createElement('a')
      downloadLink.setAttribute('href', `/file-transfer/${response}?delete=true`)
      downloadLink.style.display = 'none'
      document.body.appendChild(downloadLink)
      downloadLink.click()
      document.body.removeChild(downloadLink)
      notifySuccess({ message: $t('success.backup.created') })
    })
    .catch((error) => {
      notifyError({ message: error?.response?.data?.message })
    })
  isLoading.value = false
}

const requestRestore = async () => {
  await useApiPOST('/backup/restore', adminTasks.restoreBackup)
    .then(() => {
      notifySuccess({ message: $t('success.backup.restored') })
    })
    .catch((error) => {
      notifyError({ message: error?.response?.data?.message })
    })
}

const executeRestoreBackup = async () => {
  if (!adminTasks.restoreBackup.file_id) { return }

  isLoading.value = true

  const formData = new FormData()
  formData.append('file', adminTasks.restoreBackup.file_id)
  const {data, error } = await useApiPOST('/file-transfer/multipart', formData)
  if (error) {
    notifyError({ message: error?.response?.data?.message })
    return
  }
  adminTasks.restoreBackup.file_id = (data.value as { file_id: any }).file_id
  await requestRestore()
  isLoading.value = false
}


const resetForm = (section: string) => {
  if (section === 'applicationState') {
    newAppState.value = { type: '', address_exceptions: [], retry_after: 0 }
  }
  else if (section === 'createBackup') {
    adminTasks[section] = { config_files: true, redis_data:false, maintenance_mode: false, password: '' }
  }
  else if (section === 'restoreBackup') {
    adminTasks[section] = { file_id: '', config_files: false, redis_data:false, server_id: '', password: '' }
  }
}


//   file: any = null
//   newserverID: string = ''

//   async requestRestore () {
//     const host = window.location.hostname
//     const port = (process.env.NODE_ENV === 'production') ? window.location.port : 4447
//     this.$axios.setBaseURL('https://' + host + ':' + port + '/addons/webgui')
//     await this.$axios.$post('/api/backup/restore', this.restorebackup)
//       .then(() => {
//         this.showToastSuccess(this.$t('success.backup.restored'))
//       })
//       .catch((error) => {
//         this.showToastError(error)
//       })
//   }

//   async restoreBackup () {
//     if (!this.file) { return }
//     if (this.restorebackup.server_id === 'new') {
//       if (!this.newserverID) { return }
//       this.restorebackup.server_id = this.newserverID
//     }

//     this.isLoading = true

//     const formData = new FormData()
//     formData.append('file', this.file)

//     const host = window.location.hostname
//     const port = (process.env.NODE_ENV === 'production') ? window.location.port : 4447

//     this.$axios.setBaseURL('https://' + host + ':' + port)
//     await this.$axios.$post('/file-transfer/multipart', formData)
//       .then(async (response) => {
//         this.restorebackup.file_id = response.file_id
//         await this.requestRestore()
//       })
//       .catch((error) => {
//         this.showToastError(error)
//       })
//     this.$axios.setBaseURL('https://' + host + ':' + port + '/addons/webgui')
//     this.isLoading = false
//   }
// }
</script>

