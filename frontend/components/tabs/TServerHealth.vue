<template>
  <el-header style="height: 32px">
    <IconILoading v-if="isLoading" />
    <el-button class="float-right" @click="downloadHealthData"><IconIIcon :icon="icons.download" /> {{ $t('button.download') }}</el-button>
  </el-header>
  <el-tabs>
    <el-tab-pane :label="$t('title.healthcheck')">
      <el-table :data="fetchedData.health_check" row-key="check_id" :tree-props="{ children: 'partial_results' }">
        <el-table-column
          prop="check_status"
          label="Status"
          width="150"
          :filters="[
          { text: 'Ok', value: 'ok' },
          { text: 'Error', value: 'error' },
          { text: 'Warning', value: 'warning' },
        ]"
        :filter-method="filterStatus"
      >
          <template #default="scope">
            <el-button :type="getType(scope.row.check_status)" class="text-capitalize" size="small">{{ scope.row.check_status }}</el-button>
          </template>
        </el-table-column>
        <el-table-column prop="check_name" label="Check Name" width="450" />
        <el-table-column prop="message" label="Message" />
      </el-table>
    </el-tab-pane>
    <el-tab-pane :label="$t('title.diagnostics')">
      <!-- <pre>{{ JSON.stringify({...fetchedData, health_check: void(0)}, null, 2) }}</pre> -->
      <el-form label-width="200px" size="small">
        <div v-for="values, category in {...fetchedData, health_check: void(0)}">
          <template v-if="values && Object.keys(values).length !== 0">
            <el-text tag="b"> {{ category }} </el-text><br>
            <el-form-item v-for="v, k in values" :label="k.toString()">
                {{ v }} {{ typeof v }}
            </el-form-item>
          </template>
        </div>
      </el-form>
    </el-tab-pane>
  </el-tabs>
</template>

<script setup lang="ts">
import { useNotification } from '~/composables/mixins/useComponent';
import {useIcons} from '../../composables/mixins/useIcons'
const icons = useIcons()
const isLoading = ref(false)
let fetchedData = ref<any>([])

onMounted(async ()=> {
  await fetch()
})

async function fetch() {
  isLoading.value = true
  const {data, error} = await useApiGETBody('/opsidata/server/diagnostic')
  if (error) {
    console.log(error)
    useNotification().error(error)
    isLoading.value = false
    return
  }
  fetchedData.value = data?.value
  isLoading.value = false
}

const filterStatus = (value: string, row: any) => {
  return row.check_status === value
}

function getType (status: any) {
  if (status === 'error') { return 'danger' } else if (status === 'ok') { return 'success' } else if (status === 'warning') { return 'warning' } else { return 'primary' }
}

function downloadHealthData () {
  const text = JSON.stringify(fetchedData.value, null, 2)
  const filename = 'server_diagnostics.json'
  const element = document.createElement('a')
  element.setAttribute('href', 'data:application/json;charset=utf-8,' + encodeURIComponent(text))
  element.setAttribute('download', filename)
  element.style.display = 'none'
  document.body.appendChild(element)
  element.click()
  document.body.removeChild(element)
}
</script>
