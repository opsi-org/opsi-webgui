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
          <el-form :label-width="mq.isMobile.value ? '': '230px'" :label-position="mq.isMobile.value ? 'top': 'right'">
            <el-form-item label="">
              <el-radio-group v-model="newAppState.type">
                <el-radio value="normal">{{ $t('label.normal') }}</el-radio>
                <el-radio value="maintenance">{{ $t('label.maintenance') }}</el-radio>
              </el-radio-group>
            </el-form-item>
            <template v-if="newAppState.type === 'maintenance'">
              <el-form-item :label="$t('label.addressexcept')">
                {{ newAppState.address_exceptions }}
              </el-form-item>
              <el-form-item :label="$t('label.retryaftersec')">
                <el-input v-model="newAppState.retry_after" />
              </el-form-item>
            </template>
            <template v-if="newAppState.type">
              <el-button type="primary" @click="resetForm(section)">
                {{ $t('button.reset') }}
              </el-button>
              <el-button type="success">
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
          <el-input v-else v-model="actions[key]" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="resetForm(section)">
          {{ $t('button.reset') }}
        </el-button>
        <el-button type="success">
          {{ section === 'createBackup' ? $t('button.create') : $t('button.restore')}}
        </el-button>
      </el-form-item>
    </el-form>
  </div>

  <!-- <div data-testid="VAdminMaintenance" class="VAdminMaintenance">
    <OverlayOLoading :is-loading="isLoading" /
      <template v-if="newAppState.type" #valueMore>
        <template v-if="newAppState.type === 'maintenance'">
          <GridGFormItem :label="$t('label.addressexcept')">
            <template #value>
              <b-dropdown class="dropdownForm" size="sm" no-caret variant="outline-primary" :title="newAppState.address_exceptions">
                <template #button-content>
                  <span class="text-small">{{ newAppState.address_exceptions.toString().substring(0,38) }}</span>
                </template>
                <b-input-group class="border">
                  <b-form-input
                    v-model="exception"
                    class="border-0"
                    :placeholder="$t('placeholder.netwrkadr')"
                    size="sm"
                  />
                  <b-button
                    size="sm"
                    variant="outline-primary border-0"
                    @click="exceptions.push(exception);newAppState.address_exceptions.push(exception)"
                  >
                    {{ $t('+') }}
                  </b-button>
                </b-input-group>
                <br>
                <span class="text-small">{{ $t('label.exceptionslist') }}</span>
                <b-form-select v-model="newAppState.address_exceptions" size="sm" multiple :select-size="4" :options="exceptions" />
              </b-dropdown>
            </template>
          </GridGFormItem>
          <GridGFormItem :label="$t('label.retryaftersec')">
            <template #value>
              <b-form-input
                v-model="newAppState.retry_after"
                size="sm"
                type="number"
              />
            </template>
          </GridGFormItem>
        </template>

              <b-button size="sm" variant="success" @click="setAppState">
                {{ $t('button.apply') }}
              </b-button>

      </template>
    </GridGFormItem>
    <hr>
    <GridGFormItem :label="$t('label.createbackup')" variant="longvalue">
      <template #value>
        <GridGFormItem :label="$t('label.maintenancemode')">
          <template #value>
            <b-form-checkbox v-model="createbackup.maintenance_mode" size="sm" />
          </template>
        </GridGFormItem>
        <GridGFormItem :label="$t('label.configfiles')">
          <template #value>
            <b-form-checkbox v-model="createbackup.config_files" size="sm" />
          </template>
        </GridGFormItem>
        <GridGFormItem :label="$t('label.redis_data')">
          <template #value>
            <b-form-checkbox v-model="createbackup.redis_data" size="sm" />
          </template>
        </GridGFormItem>
        <GridGFormItem :label="$t('form.password')">
          <template #value>
            <b-input-group>
              <b-form-input
                id="password"
                v-model="createbackup.password"
                :aria-label="$t('form.password')"
                :type="showPasswordCB? 'text': 'password'"
                size="sm"
              />
              <b-button variant="outline-primary" :pressed.sync="showPasswordCB" size="sm">
                <span class="sr-only">{{ showPasswordCB? $t('label.hide', {item: 'Password'}) : $t('label.show', {item: 'Password'}) }}</span>
                <IconIIcon :icon="showPasswordCB ? icon.valueShow : icon.valueHide" />
              </b-button>
            </b-input-group>
          </template>
        </GridGFormItem>
        <GridGFormItem>
          <template #value>
            <div class="float-right">
              <b-button size="sm" class="mr-2" variant="outline-primary" @click="resetCreateBackup">
                {{ $t('button.reset') }}
              </b-button>
              <b-button size="sm" variant="success" @click="createBackup">
                {{ $t('button.create') }}
              </b-button>
            </div>
          </template>
        </GridGFormItem>
      </template>
    </GridGFormItem>
    <hr>
    <GridGFormItem :label="$t('label.restorebackup')" variant="longvalue">
      <template #value>
        <GridGFormItem :label="$t('label.uploadbackup')">
          <template #value>
            <b-input-group>
              <b-form-file v-model="file" :state="Boolean(file)" :placeholder="$t('placeholder.fileupload')" size="sm" />
              <b-button size="sm" variant="outline-primary" @click="file = []">
                {{ $t('button.clear') }}
              </b-button>
            </b-input-group>
          </template>
        </GridGFormItem>
        <GridGFormItem :label="$t('label.configfiles')">
          <template #value>
            <b-form-checkbox v-model="restorebackup.config_files" size="sm" />
          </template>
        </GridGFormItem>
        <GridGFormItem :label="$t('label.redis_data')">
          <template #value>
            <b-form-checkbox v-model="createbackup.redis_data" size="sm" />
          </template>
        </GridGFormItem>
        <GridGFormItem :label="$t('label.serverID')">
          <template #value>
            <b-form-radio-group v-model="restorebackup.server_id">
              <b-form-radio value="backup">
                {{ $t('label.backup') }}
              </b-form-radio>
              <b-form-radio value="local">
                {{ $t('label.local') }}
              </b-form-radio>
              <b-form-radio value="new">
                {{ $t('label.new') }}
              </b-form-radio>
            </b-form-radio-group>
            <b-form-input
              v-if="restorebackup.server_id === 'new'"
              v-model="newserverID"
              size="sm"
              :state="newserverID!=''"
              :placeholder="$t('placeholder.enterNewID')"
              required
            />
          </template>
        </GridGFormItem>
        <GridGFormItem :label="$t('form.password')">
          <template #value>
            <b-input-group>
              <b-form-input
                id="password"
                v-model="restorebackup.password"
                :aria-label="$t('form.password')"
                :type="showPasswordRB? 'text': 'password'"
                size="sm"
              />
              <b-button variant="outline-primary" :pressed.sync="showPasswordRB" size="sm">
                <span class="sr-only">{{ showPasswordRB? $t('label.hide', {item: 'Password'}) : $t('label.show', {item: 'Password'}) }}</span>
                <IconIIcon :icon="showPasswordRB ? icon.valueShow : icon.valueHide" />
              </b-button>
            </b-input-group>
          </template>
        </GridGFormItem>
        <GridGFormItem>
          <template #value>
            <div class="float-right">
              <b-button size="sm" class="mr-2" variant="outline-primary" @click="resetRestoreBackup">
                {{ $t('button.reset') }}
              </b-button>
              <b-button size="sm" variant="success" @click="restoreBackup">
                {{ $t('button.restore') }}
              </b-button>
            </div>
          </template>
        </GridGFormItem>
      </template>
    </GridGFormItem>
  </div> -->
</template>

<script setup lang="ts">
import { useNotification } from '~/composables/mixins/useComponent';
const props = defineProps({
  adminTasks: { type: Object, required: true }
})
const mq = useMQ()
const currentAppState = ref('')
const isLoading = ref(false)
const newAppState = ref({ type: '', address_exceptions: [], retry_after: 0 })
// const createbackup = ref({ config_files: true, redis_data:false, maintenance_mode: false, password: '' })
// const restorebackup = ref({ file_id: '', config_files: false, redis_data:false, server_id: '', password: '' })


onMounted(async ()=> {
  isLoading.value = true
  await fetchAppState()
  isLoading.value = false
})

const fetchAppState = async () => {
  const {data, error } = await useApiGET('/app-state')
  if (error) {
    useNotification().error(error)
    return
  }
  currentAppState.value = (data.value as { type: any }).type
}

const resetForm = (section: string) => {
  if (section === 'applicationState') {
    newAppState.value = { type: '', address_exceptions: [], retry_after: 0 }
  }
  else if (section === 'createBackup') {
    props.adminTasks[section] = { config_files: true, redis_data:false, maintenance_mode: false, password: '' }
  }
  else if (section === 'restoreBackup') {
    props.adminTasks[section] = { file_id: '', config_files: false, redis_data:false, server_id: '', password: '' }
  }
}
// import { Component, Vue } from 'nuxt-property-decorator'
// import { AlertToast } from '../../mixins/component'
// import { Icons } from '../../mixins/icons'

// interface AppState {
//   type: string
//   address_exceptions: Array<string>,
//   retry_after: number
// }
// interface CreateBackup {
//   config_files: boolean,
//   redis_data:boolean,
//   maintenance_mode: boolean,
//   password: string
// }
// interface RestoreBackup {
//   file_id: string,
//   config_files: boolean,
//   redis_data:boolean,
//   server_id: string,
//   password: string
// }

// @Component({ mixins: [Icons, AlertToast] })
// export default class VAdminMaintenance extends Vue {
//   showToastSuccess: any // from mixin AlertToast
//   showToastError: any // from mixin AlertToast
//   icon: any
//   $axios: any
//   $t: any
//   currentAppState: string = ''
//   newAppState: AppState = { type: '', address_exceptions: [], retry_after: 0 }
//   createbackup: CreateBackup = { config_files: true, redis_data: false, maintenance_mode: true, password: '' }
//   restorebackup: RestoreBackup = { file_id: '', config_files: false, redis_data: false, server_id: 'backup', password: '' }
//   exception: string = ''
//   exceptions: Array<string> = []
//   isLoading: boolean = false
//   file: any = null
//   newserverID: string = ''
//   showPasswordCB: boolean = false
//   showPasswordRB: boolean = false

//   async mounted () {
//     await this.getAppState()
//   }

//   async getAppState () {
//     await this.$axios.$get('/api/app-state')
//       .then((response) => {
//         this.currentAppState = response.type
//       })
//       .catch(this.showToastError)
//   }

//   resetAppState () {
//     this.newAppState.address_exceptions = []
//     this.newAppState.retry_after = 0
//   }

//   resetCreateBackup () {
//     this.createbackup = { config_files: true, redis_data: false, maintenance_mode: true, password: '' } as CreateBackup
//   }

//   resetRestoreBackup () {
//     this.restorebackup = { file_id: '', config_files: false, redis_data: false, server_id: 'backup', password: '' } as RestoreBackup
//   }

//   async setAppState () {
//     this.isLoading = true
//     await this.$axios.$post('/api/app-state', this.newAppState)
//       .then((response) => {
//         this.currentAppState = response.type
//       })
//       .catch((error) => {
//         this.showToastError(error)
//       })
//     this.isLoading = false
//   }

//   async createBackup () {
//     this.isLoading = true
//     await this.$axios.$post('/api/backup/create', this.createbackup)
//       .then((response) => {
//         const downloadLink = document.createElement('a')
//         downloadLink.setAttribute('href', `/file-transfer/${response}?delete=true`)
//         downloadLink.style.display = 'none'
//         document.body.appendChild(downloadLink)
//         downloadLink.click()
//         document.body.removeChild(downloadLink)
//         this.showToastSuccess(this.$t('success.backup.created'))
//       })
//       .catch((error) => {
//         this.showToastError(error)
//       })
//     this.isLoading = false
//   }

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

