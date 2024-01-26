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
          <PopoverPGroupActions
            :data="{'category':props.data.category, 'nodeType': data.type, 'nodeLabel': node.label, 'action': action}"
            :idList="idList"
          />
          </span>
        </div>
      </template>
    </el-tree>
  </el-container>

  <!-- <div class="VGroups" data-testid="VGroups">
    <OverlayOLoading :is-loading="$fetchState.pending" />
    <AlertAAlert ref="groupAlert" data-testid="groupAlert" />
    <b-row>
      <b-col>
        <treeselect
          v-model="selectedvalue"
          class="treeselect_notstored treeselect treeselect_fullpage"
          :placeholder="$t('treeselect.search')"
          always-open
          :default-expand-level="1"
          :normalizer="normalizer"
          value-format="object"
          :options="group"
        >
          <div slot="option-label" slot-scope="{ node }">
            <template v-if="node.isBranch">
              {{ node.label }}
              <div class="float-right">
                <b-button
                  class="border-0"
                  variant="outline-primary"
                  size="sm"
                  :title="$t('group.editGroup')"
                  @click="showChild('editGroup')"
                >
                  <IconIIcon :icon="icon.pencil" />
                </b-button>
                <b-button
                  class="border-0"
                  variant="outline-primary"
                  size="sm"
                  :title="$t('group.deletegroup')"
                  @click="showChild('deletegroup')"
                >
                  <IconIIcon :icon="icon.delete" />
                </b-button>
                <b-button
                  class="border-0"
                  variant="outline-primary"
                  size="sm"
                  :title="$t('group.deleteOnlyAssignments', {type: $t('table.fields.products')})"
                  @click="showChild('deleteOnlyAssignments')"
                >
                  <IconIIcon :icon="icon.product" /><IconIIcon font-scale="0.8" :icon="icon.delete" />
                </b-button>
                <b-button
                  class="border-0"
                  variant="outline-primary"
                  size="sm"
                  :title="$t('group.addToGroup', {type: $t('table.fields.products')})"
                  @click="showChild('addToGroup')"
                >
                  <IconIIcon :icon="icon.product" /><IconIIcon :icon="icon.add" font-scale="0.8" />
                </b-button> -->
                <!-- <b-button
                  class="border-0"
                  variant="outline-primary"
                  size="sm"
                  :title="$t('group.addSubgroup')"
                  @click="showChild('addSubgroup')"
                >
                  <IconIIcon :icon="icon.group" /><IconIIcon :icon="icon.add" font-scale="0.8" />
                </b-button> -->
              <!-- </div>
            </template>
            <template v-else>
              {{ node.label }}
              <div class="float-right">
                <b-button
                  class="border-0"
                  variant="outline-primary"
                  size="sm"
                  :title="$t('group.removeProduct')"
                  @click="showChild('removeProduct')"
                >
                  <IconIIcon :icon="icon.delete" />
                </b-button>
              </div>
            </template>
          </div>
        </treeselect>
      </b-col>
      <b-col v-if="action && selectedvalue">
        <span class="text-small"><b> {{ title + t_fixed('keep-english.title.delimiter') }}</b><i>{{ selectedvalue.text }}</i></span>
        <b-button class="float-right border-0" variant="outline-primary" size="sm" @click="action = ''">
          <IconIIcon :icon="icon.x" />
        </b-button>
        <br><br> -->
        <!-- <template v-if="action == 'addSubgroup'">
          <b-form>
            <b-form-input
              v-model="subgroup.groupId"
              size="sm"
              trim
              :placeholder="$t('group.subgroupname')"
              :state="subgroup.groupId.length > 0 && subgroup.groupId.length < 255"
              @keydown.enter.prevent="createSubGroup"
            />
            <b-form-input
              v-model="subgroup.description"
              size="sm"
              trim
              :placeholder="$t('table.fields.description')"
              :state="subgroup.description.length >= 0 && subgroup.description.length < 100"
              @keydown.enter.prevent="createSubGroup"
            />
            <b-form-input
              v-model="subgroup.notes"
              size="sm"
              trim
              :placeholder="$t('table.fields.notes')"
              :state="subgroup.notes.length >= 0 && subgroup.notes.length < 500"
              @keydown.enter.prevent="createSubGroup"
            />
            <b-button class="float-right" size="sm" variant="success" data-testid="createSubGroup" @click="createSubGroup">
              {{ $t("button.create") }}
            </b-button>
          </b-form>
        </template> -->
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
const props = defineProps({
  data: { type: Object, required: true }
})

const storeSelection = storeSelections()
const isLoading = ref(false)
const defaultProps = {
  label: 'text',
  children: 'children'
}
const fetchedData = ref<any>({})
const idList = ref([])

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
  const {data, error } = await useApiGETBody(`/opsidata/products/groups?selectedProducts=${storeSelection.selectionProducts}`)
  if (error) {
    useNotification().error(error)
    return
  }
  fetchedData.value = data.value.groups ?
                        Object.entries(data.value.groups).map(([label, obj] :any ) => ({ ...obj, children: Object.values(obj.children || {})}))
                        : []
}

async function fetchProductList() {
  const {data, error } = await useApiGETBody(`/opsidata/depots/products?productType=LocalbootProduct&selectedDepots=${storeSelection.selectionDepots}`)
  if (error) {
    useNotification().error(error)
    return
  }
  idList.value = data.value.map(function (item: { productId: any; }) { return item.productId })
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

//   async createSubGroup () {
//     this.subgroup.parentGroupId = this.selectedvalue.text
//     await this.$axios.$post('/api/opsidata/products/groups', this.subgroup)
//       .then(async () => {
//         this.showToastSuccess(this.$t('message.success.save.create.group', { group: this.subgroup.groupId }))
//         await this.reloadGroup()
//       })
//       .catch((error) => {
//         this.showToastError(error)
//       })
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
