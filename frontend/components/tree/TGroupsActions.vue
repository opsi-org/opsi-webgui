<template>
  <el-container v-loading="isLoading">
    <el-tree
      :class="useMQ().isMobile.value ? 'w-100': 'w-50'"
      :data="fetchedData"
      :props="defaultProps"
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
            <el-popover :placement="useMQ().isMobile.value ? 'auto': 'right'" :width="400" trigger="click" :ref="node.label+action">
              <template #reference>
                <el-button size="small"> <IconIIcon v-for="subaction in action.split('-')" :icon="icons[subaction]" /> </el-button>
              </template>
              <el-text tag="b">{{ $t('group.'+action) }}</el-text> - <el-text tag="i">{{ node.label }}</el-text>
              <el-form label-position="top" class="mt-3">
                <template v-if="action == 'group-add'">
                  <el-form-item v-for="value,label,index in createGroup" :key="index" :label="$t('table.fields.'+label)"
                    :class="{ 'd-none': label=='parentGroupId' }">
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
                  <el-button class="float-right" type="success" data-testid="addChildren">
                    {{ $t("button.add") }}
                  </el-button>
                </template>
                <template v-else-if="action == 'client-delete' || action == 'product-delete'">
                  <el-text> {{ $t('group.confirm.'+action) }} </el-text>
                  <el-button class="float-right" type="danger" data-testid="removeAssignments">
                    {{ $t("button.delete") }}
                  </el-button>
                </template>
                <template v-else-if="action == 'delete'">
                  <el-text>{{ $t('group.confirm.'+action) }}</el-text>
                  <el-button type="danger" class="float-right">
                    {{ $t('button.delete') }}
                  </el-button>
                </template>
                <template v-else-if="action == 'edit'">
                  <el-form-item v-for="value,label,index in updateGroup" :key="index" :label="$t('table.fields.'+label)">
                    <el-scrollbar v-if="label == 'parent'" height="200px">
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

        <!-- <template v-if="action == 'addToGroup'">
          <b-form-select
            v-model="selectedProducts"
            multiple
            size="sm"
            :select-size="10"
            :options="productIds"
          >
            <template #first>
              <b-form-select-option :value="null" disabled>
                {{ $t('group.selectItems', {type: $t('table.fields.products')}) }}
              </b-form-select-option>
            </template>
          </b-form-select>
          <b-button class="float-right" variant="success" size="sm" data-testid="addprodToSelectedGroup" @click="addProducts">
            {{ $t("group.add") }}
          </b-button>
        </template>
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
        <template v-else-if="action == 'deletegroup'">
          <small> {{ $t('group.deletegroup.confirm', {type: 'product'}) }}</small>
          <b-button class="float-right" size="sm" variant="danger" data-testid="deleteGroup" @click="deleteGroup">
            {{ $t("label.delete") }}
          </b-button>
        </template>
        <template v-else-if="action == 'deleteOnlyAssignments'">
          <small> {{ $t('group.deleteOnlyAssignments.confirm', {type: 'product'}) }}</small>
          <b-button class="float-right" variant="danger" data-testid="removeAllProducts" size="sm" @click="removeAllProducts">
            {{ $t("group.remove") }}
          </b-button>
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
import { ref } from 'vue'
import { useNotification } from '~/composables/mixins/useComponent';
import { useClient } from '~/composables/mixins/useGet';
import {useIcons} from '../../composables/mixins/useIcons'
import type { T_ClientIds, T_Groups, T_ProductIds, T_Product } from '~/types/APItypes';

const props = defineProps({
  data: { type: Object, required: true }
})
const icons = useIcons()
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

onMounted(async ()=> {
  isLoading.value = true
  if (props.data.category == 'clientGroups')
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
  fetchedData.value = data.value.groups ?
                        Object.entries(data.value.groups).map(([label, obj] :any ) => ({ ...obj, children: Object.values(obj.children || {})}))
                        : []
}

async function fetchProductList() {
  console.log('fetchProductList')
  const {data, error } = await useApiGETBody<Array<T_Product>>(`/opsidata/depots/products?productType=LocalbootProduct&selectedDepots=${storeSelection.selectionDepots}`)
  if (error) {
    useNotification().error(error)
    return
  }
  idList.value = data.value.map(function (item: { productId: any; }) { return item.productId })
}

  async function createSubGroup (parent: string) {
    createGroup.parentGroupId = parent
    const url = props.data.category == 'clientGroups' ? 'opsidata/hosts/groups' : 'opsidata/products/groups'
    const {data, error } = await useApiPOST(url, createGroup)
    if (error) {
      useNotification().error(error)
      return
    } else {
      useNotification().success(data.toString())
      // this.showToastSuccess(this.$t('message.success.save.create.group', { group: this.subgroup.groupId }))
      // await this.reloadGroup()
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

//   async addProducts () {
//     await this.$axios.$post(`/api/opsidata/products/groups/${this.selectedvalue.text}/products`, this.selectedProducts)
//       .then(async () => {
//         this.showToastSuccess(this.$t('message.success.save.add.clientfromgroups', { group: this.selectedvalue.text }))
//         await this.reloadGroup()
//       })
//       .catch((error) => {
//         this.showToastError(error)
//       })
//   }

//   async deleteGroup () {
//     await this.$axios.$get(`/api/opsidata/products/groups/${this.selectedvalue.text}`)
//       .then(async () => {
//         this.showToastSuccess(this.$t('message.success.save.delete.group', { group: this.selectedvalue.text }))
//         await this.reloadGroup()
//       })
//       .catch((error) => {
//         this.showToastError(error)
//       })
//   }

//   async removeAllProducts () {
//     await this.$axios.$delete(`/api/opsidata/products/groups/${this.selectedvalue.text}/products`)
//       .then(async () => {
//         this.showToastSuccess(this.$t('message.success.save.delete.clientsfromgroup', { group: this.selectedvalue.text }))
//         await this.reloadGroup()
//       })
//       .catch((error) => {
//         this.showToastError(error)
//       })
//   }

//   async removeSelectedProduct () {
//     const group = this.selectedvalue.parent
//     await this.$axios.$delete(`/api/opsidata/products/groups/${group}/${this.selectedvalue.text}`)
//       .then(async () => {
//         this.showToastSuccess(this.$t('message.success.save.delete.clientfromgroups', { client: this.selectedvalue.text }))
//         await this.reloadGroup()
//       })
//       .catch((error) => {
//         this.showToastError(error)
//       })
//   }
// }
</script>
