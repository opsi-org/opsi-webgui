<template>
  <el-popover v-if="props.data.category == 'product-group'" :placement="mq.isMobile.value ? 'auto': 'right'" :width="360" trigger="click">
      <template #reference>
        <el-button size="small">{{ $t('label.create.prodgroup') }} </el-button>
      </template>
      <el-form label-position="top" class="mt-3">
        <el-form-item v-for="val, label in createGroup" :key="label" :label="$t('table.fields.'+label)"
          :class="{ 'd-none': label.toString()=='parentGroupId' }">
            <el-input v-model="createGroup[label]" />
        </el-form-item>
        <el-button
          class="float-right"
          type="success"
          data-testid="createSubGroup"
          @click="createSubGroup('')"
          :disabled="createGroup.groupId == ''"
        >
          {{ $t("button.create") }}
        </el-button>
      </el-form>
  </el-popover>
  <el-container v-loading="isLoading">
    <el-tree
      :class="mq.isMobile.value ? 'w-100': 'w-50'"
      :data="fetchedData"
      :props="defaultProps"
      node-key="id"
      :expand-on-click-node="false"
      highlight-current
    >
      <template #default="{ node, data }">
        <span>{{ node.label }}</span>
        <div class="ml-auto" v-if="node.label !== 'not_assigned'">
          <span v-for="action in
                (data.type == 'ObjectToGroup' ? props.data.actions.children
                : (node.label == 'groups' || node.label == 'clientdirectory' ? props.data.actions.maingroups : props.data.actions.parent)
                )"
          >
            <el-popover :placement="mq.isMobile.value ? 'auto': 'right'" :width="360" trigger="click" :ref="node.label+action">
              <template #reference>
                <el-button size="small"> <IconIIcon v-for="subaction in action.split('-')" :icon="icons[subaction]" /> </el-button>
              </template>
              <el-text tag="b">{{ $t('group.'+action) }}</el-text> - <el-text tag="i">{{ node.label }}</el-text>
              <el-form label-position="top" class="mt-3">
                <template v-if="action == 'group-add'">
                  <el-form-item v-for="val, label in createGroup" :key="label" :label="$t('table.fields.'+label)"
                    :class="{ 'd-none': label.toString()=='parentGroupId' }">
                      <el-input v-model="createGroup[label]" />
                  </el-form-item>
                  <el-button
                    class="float-right"
                    type="success"
                    data-testid="createSubGroup"
                    @click="createSubGroup(node.label)"
                    :disabled="createGroup.groupId == ''"
                  >
                    {{ $t("button.create") }}
                  </el-button>
                </template>
                <template v-else-if="action == 'client-add' || action == 'product-add'">
                  <el-form-item :label="$t('label.selectChildren')">
                    <el-scrollbar height="300px">
                      <el-checkbox-group v-model="selectedChildren">
                        <div v-for="item in idList" :key="item"> <el-checkbox size="small" :label="item" /> </div>
                      </el-checkbox-group>
                    </el-scrollbar>
                  </el-form-item>
                  <el-button class="float-right" type="success" data-testid="addChildren" @click="addChildren(node.label)">
                    {{ $t("button.add") }}
                  </el-button>
                </template>
                <template v-else-if="action == 'client-delete' || action == 'product-delete'">
                  <el-text> {{ $t('group.confirm.'+action) }} </el-text>
                  <el-button class="float-right" type="danger" data-testid="removeAssignments" @click="deleteAllChildren(node.label)">
                    {{ $t("button.delete") }}
                  </el-button>
                </template>
                <template v-else-if="action == 'delete'">
                  <el-text>{{ $t('group.confirm.'+action) }}</el-text>
                  <el-button type="danger" class="float-right" @click="applyDelete(node.label, data.type, data.parent)">
                    {{ $t('button.delete') }}
                  </el-button>
                </template>
                <template v-else-if="action == 'edit'">
                  <el-form-item v-for="value,label in updateGroup" :key="label" :label="$t('table.fields.'+label)">
                    <el-scrollbar v-if="label.toString() == 'parent'" height="200px">
                      {{ fetchedData }}
                      <!-- <el-tree :props="defaultProps" :data="fetchedData">
                      </el-tree> -->
                    </el-scrollbar>
                    <el-input v-else v-model="updateGroup[label]" />
                  </el-form-item>
                  <el-button class="float-right" type="success" data-testid="updateGroup">
                    {{ $t("button.update") }}
                  </el-button>
                </template>
                <template v-else-if="action == 'copy'">
                  <el-scrollbar height="200px">
                    <!-- <el-tree :placeholder="$t('group.copyClient.selectgroup')" :props="defaultProps" :data="fetchedData" /> -->
                    {{ fetchedData }}
                  </el-scrollbar>
                  <el-button type="success" class="float-right">
                    {{ $t('button.copy') }}
                  </el-button>
                </template>
                <template v-else> No action available </template>
              </el-form>
              <!-- {{ props.data.category }} {{ data.type }} {{ node.label }} {{ action }} -->
            </el-popover>
          </span>
        </div>
      </template>
    </el-tree>
  </el-container>

        <!--
        <template v-else-if="action == 'editGroup'">
          <b-form>
            <treeselect
              v-model="updategroupparent"
              class="treeselect_notstored treeselect"
              :placeholder="$t('group.parent')"
              value-format="object"
              :options="group"
              :normalizer="normalizerUpdateGroup"
            />
            <b-form-input
              v-model="updategroup.description"
              size="sm"
              :placeholder="$t('table.fields.description')"
              :state="updategroup.description.length >= 0 && updategroup.description.length < 100"
            />
            <b-form-input
              v-model="updategroup.notes"
              size="sm"
              :placeholder="$t('table.fields.notes')"
              :state="updategroup.notes.length >= 0 && updategroup.notes.length < 500"
            />
            <b-button class="float-right" size="sm" variant="success" data-testid="updateGroup" @click="updateGroup">
              {{ $t("button.update") }}
            </b-button>
          </b-form>
        </template>

        <template v-else-if="action == 'removeProduct'">
          <small>{{ $t('group.removeClient.confirm') }}</small>
          <b-button variant="danger" class="float-right" size="sm" @click="removeSelectedProduct">
            {{ $t('group.remove') }}
          </b-button>
        </template>
      </b-col>
    </b-row>
  </div> -->
</template>

<script setup lang="ts">
import { useNotification } from '~/composables/mixins/useComponent';
import { useClient } from '~/composables/mixins/useGet';
import {useIcons} from '../../composables/mixins/useIcons'
import { _getI18nInComposable } from '../../composables/mixins/helper-i18n';
import type { T_ClientIds, T_Groups, T_ProductIds, T_Product } from '~/types/APItypes';

const props = defineProps({
  data: { type: Object, required: true }
})
const icons = useIcons()
const mq = useMQ()
const translate = _getI18nInComposable()
const storeSelection = storeSelections()
const isLoading = ref(false)
const defaultProps = {
  label: 'text',
  children: 'children'
}
const fetchedData = ref<any>({})
const idList = ref<T_ProductIds|T_ClientIds>([])
const selectedChildren = ref([])
const createGroup = reactive({
  parentGroupId: '',
  groupId: '',
  description: '',
  notes: ''
})
const updateGroup = reactive({
  parent: '',
  description: '',
  notes: ''
})

watch(()=>storeSelection.selectionDepots, async ()=>{
  await fetchClientGroups()
  await fetchClientList()
})

onMounted(async ()=> {
  isLoading.value = true
  if (props.data.category == 'client-group')
  {
    await fetchClientGroups()
    await fetchClientList()
  } else {
    await fetchProdGroups()
    await fetchProductList()
  }
  isLoading.value = false
})

async function fetchClientGroups() {
  const {data, error } = await useApiGETBody(`/opsidata/hosts/groups?selectedDepots=${storeSelection.selectionDepots}`)
  if (error) {
    useNotification().error(error)
    return
  }
    // TODO: Backend: change groups data structure
  fetchedData.value = data.value  ?
                              Object.entries(data.value).map(([label, obj] : any ) => ({ ...obj,
                                children: Object.entries(obj.children || {}).map(([labelA, objA] : any ) =>
                                ({ ...objA, children: Object.values(objA.children || {})}))}))
                              : []
}

async function fetchClientList () {
  idList.value = await useClient().getClientIdList(storeSelection.selectionDepots)
}

async function fetchProdGroups() {
  const {data, error } = await useApiGETBody<T_Groups>(`/opsidata/products/groups?selectedProducts=${storeSelection.selectionProducts}`)
  if (error) {
    useNotification().error(error)
    return
  }
    // TODO: Backend: change groups data structure
  fetchedData.value = data.value.groups ?
                        Object.entries(data.value.groups).map(([label, obj] :any ) => ({ ...obj, children: Object.values(obj.children || {})}))
                        : []
}

async function fetchProductList() {
  const {data, error } = await useApiGETBody<Array<T_Product>>(`/opsidata/depots/products?productType=LocalbootProduct&selectedDepots=${storeSelection.selectionDepots}`)
  if (error) {
    useNotification().error(error)
    return
  }
  idList.value = data.value.map(function (item: { productId: any; }) { return item.productId })
}

async function createSubGroup (parent: string) {
  createGroup.parentGroupId = parent
  const url = props.data.category == 'client-group' ? '/opsidata/hosts/groups' : '/opsidata/products/groups'
  const {data, error } = await useApiPOST(url, createGroup)
  if (error) {
    useNotification().error(error)
    return
  } else {
    useNotification().success(translate('message.success.save.create.group', { group: createGroup.groupId }));
    props.data.category == 'client-group' ? await fetchClientGroups() : await fetchProdGroups()
  }
}

async function addChildren (selectedGroup: string) {
  const url = props.data.category == 'client-group' ? `/opsidata/hosts/groups/${selectedGroup}/clients` : `/opsidata/products/groups/${selectedGroup}/products`
  const {data, error } = await useApiPOST(url, selectedChildren.value)
  if (error) {
    useNotification().error(error)
    return
  } else {
    useNotification().success(translate('message.success.save.add.clientfromgroups', { group: selectedGroup }))
    props.data.category == 'client-group' ? await fetchClientGroups() : await fetchProdGroups()
  }
}

async function deleteAllChildren (selectedGroup: string) {
  const url = props.data.category == 'client-group' ? `/opsidata/hosts/groups/${selectedGroup}/clients` : `/opsidata/products/groups/${selectedGroup}/products`
  const {data, error } = await useApiDELETE(url)
  if (error) {
    useNotification().error(error)
    return
  } else {
    useNotification().success(translate('message.success.save.delete.clientsfromgroup', { group: selectedGroup }))
    props.data.category == 'client-group' ? await fetchClientGroups() : await fetchProdGroups()
  }
}

async function deleteGroup (selectedGroup: string) {
  const url = props.data.category == 'client-group' ? `/opsidata/hosts/groups/${selectedGroup}` : `/opsidata/products/groups/${selectedGroup}`
  // TODO: Backend: change product group deletion to DELETE
  const {data, error } = props.data.category == 'client-group' ? await useApiDELETE(url) : await useApiGET(url)
  if (error) {
    useNotification().error(error)
    return
  } else {
    useNotification().success(translate('message.success.save.delete.group', { group: selectedGroup }))
    props.data.category == 'client-group' ? await fetchClientGroups() : await fetchProdGroups()
  }
}

async function deleteObjectToGroup (selectedChild: string, parent: string) {
  const url = props.data.category == 'client-group' ? `/opsidata/clients/${selectedChild}/groups` : `/opsidata/products/groups/${parent}/${selectedChild}`
  const body = props.data.category == 'client-group' ? { data: [parent] } : {}
  const {data, error} = await useApiDELETE(url, body)
  if (error) {
    useNotification().error(error)
    return
  } else {
    useNotification().success(translate('message.success.save.delete.clientfromgroups', { client: selectedChild }))
    props.data.category == 'client-group' ? await fetchClientGroups() : await fetchProdGroups()
  }
}

async function applyDelete (selectedNode: string, nodeType: string, parent: string) {
  if (nodeType == 'ObjectToGroup') {
    deleteObjectToGroup(selectedNode, parent)
  } else {
    deleteGroup(selectedNode)
  }
}

//   async reloadGroup () {
//     this.action = ''
//     await this.fetchGroups()
//     this.selectedvalue = null
//   }

//   showChild (selectedAction: string) {
//     this.action = selectedAction
//     const groupaction = 'group.' + this.action
//     this.title = this.$t(groupaction)
//   }

//   async updateGroup () {
//     this.updategroup.parent = this.updategroupparent ? this.updategroupparent.text : ''
//     await this.$axios.$put(`/api/opsidata/products/groups/${this.selectedvalue.text}`, this.updategroup)
//       .then(async () => {
//         this.showToastSuccess(this.$t('message.success.save.update.group', { group: this.selectedvalue.text }))
//         await this.reloadGroup()
//       })
//       .catch((error) => {
//         this.showToastError(error)
//       })
//   }
</script>
