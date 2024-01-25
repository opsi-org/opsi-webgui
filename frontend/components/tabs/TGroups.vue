<template>
  <el-tabs lazy>
    <el-tab-pane v-for="options, category in groupActions" :key="category" :label="$t('treeselect.' + category)">
      <TreeTGroupsActions :data="options" />
    </el-tab-pane>
  </el-tabs>

  <!-- <el-tabs>
    <el-tab-pane :label="$t('treeselect.clientGroups')">
      <el-tree
        :data="fetchedClientData"
        :props="defaultProps"
        highlight-current
        />
    </el-tab-pane>
    <el-tab-pane :label="$t('treeselect.prodGroups')">
      <el-row>
        <el-col>
          <el-tree
            :data="fetchedData"
            :props="defaultProps"
            highlight-current
          >
            <template #default="{ node, data }">
              <template v-if="data.type == 'ObjectToGroup'">
                  <el-button :aria-label="$t('group.removeProduct')"> <IconIIcon :icon="icons.delete" /> </el-button>
              </template>
              <template v-else>
                <el-button :aria-label="$t('group.editGroup')"> <IconIIcon :icon="icons.pencil" /> </el-button>
                  <el-button :aria-label="$t('group.deletegroup')"> <IconIIcon :icon="icons.delete" /> </el-button>
                  <el-button :aria-label="$t('group.deleteOnlyAssignments')"><IconIIcon :icon="icons.product" /><IconIIcon :icon="icons.delete" class="mt-2" /></el-button>
                  <el-button :aria-label="$t('group.addToGroup')"> <IconIIcon :icon="icons.product" /><IconIIcon :icon="icons.add" class="mt-2" /> </el-button>
                  <el-button :aria-label="$t('group.addSubgroup')"> <IconIIcon :icon="icons.group" /> <IconIIcon :icon="icons.add" class="mt-2" /></el-button>
              </template>
              {{ node.label }}
            </template>
          </el-tree>
        </el-col>
      </el-row>
    </el-tab-pane>
  </el-tabs> -->
  <!-- <div class="VGroups" data-testid="VGroups">
    <OverlayOLoading :is-loading="$fetchState.pending" />
    <AlertAAlert ref="groupAlert" data-testid="groupAlert" />
    <b-tabs small class="groupstabs">
      <b-tab>
        <template #title>
          <span> {{ $t("treeselect.clientGroups") }} </span>
        </template>
        <b-row>
          <b-col :class="{'d-none' : action && $mq === 'mobile'}">
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
                <div :ref="'tree-item-'+node.id">
                  <template v-if="node.isBranch">
                    <IconIIcon :icon="icon.group" />
                    {{ node.label }}
                    <div v-if="node.label !== 'not_assigned'" class="float-right">
                      <b-button
                        v-if="node.label !== 'groups' && node.label !== 'clientdirectory'"
                        class="border-0"
                        variant="outline-primary"
                        size="sm"
                        :title="$t('group.editGroup')"
                        @click="showChild('editGroup')"
                      >
                        <IconIIcon :icon="icon.pencil" />
                      </b-button>
                      <b-button
                        v-if="node.label !== 'groups' && node.label !== 'clientdirectory'"
                        class="border-0"
                        variant="outline-primary"
                        size="sm"
                        :title="$t('group.deletegroup')"
                        @click="showChild('deletegroup')"
                      >
                        <IconIIcon :icon="icon.delete" />
                      </b-button>
                      <b-button
                        v-if="node.label !== 'groups' && node.label !== 'clientdirectory'"
                        class="border-0"
                        variant="outline-primary"
                        size="sm"
                        :title="$t('group.deleteOnlyAssignments', {type: $t('title.clients')})"
                        @click="showChild('deleteOnlyAssignments')"
                      >
                        <IconIIcon :icon="icon.client" /><IconIIcon font-scale="0.8" :icon="icon.delete" />
                      </b-button>
                      <b-button
                        v-if="node.label !== 'groups' && node.label !== 'clientdirectory'"
                        class="border-0"
                        variant="outline-primary"
                        size="sm"
                        :title="$t('group.addToGroup', {type: $t('title.clients')})"
                        @click="showChild('addToGroup')"
                      >
                        <IconIIcon :icon="icon.client" /><IconIIcon :icon="icon.add" font-scale="0.8" />
                      </b-button>
                      <b-button
                        class="border-0"
                        variant="outline-primary"
                        size="sm"
                        :title="$t('group.addSubgroup')"
                        @click="showChild('addSubgroup')"
                      >
                        <IconIIcon :icon="icon.group" /><IconIIcon :icon="icon.add" font-scale="0.8" />
                      </b-button>
                    </div>
                  </template>
                  <template v-else>
                    <IconIIcon :icon="icon.client" />
                    {{ node.label }}
                    <div v-if="node.raw.parent !== 'not_assigned'" class="float-right">
                      <b-button
                        class="border-0"
                        variant="outline-primary"
                        size="sm"
                        :title="$t('group.copyClient')"
                        @click="showChild('copyClient')"
                      >
                        <IconIIcon :icon="icon.client" /><IconIIcon :icon="icon.group" font-scale="0.8" />
                      </b-button>
                      <b-button
                        class="border-0"
                        variant="outline-primary"
                        size="sm"
                        :title="$t('group.removeClient')"
                        @click="showChild('removeClient')"
                      >
                        <IconIIcon :icon="icon.delete" />
                      </b-button>
                    </div>
                  </template>
                </div>
              </div>
            </treeselect>
          </b-col>
          <b-col v-if="action && selectedvalue">
            <span class="text-small"><b> {{ title + t_fixed('keep-english.title.delimiter') }}</b><i>{{ selectedvalue.text }}</i></span>
            <b-button class="float-right border-0" variant="outline-primary" size="sm" @click="action = ''">
              <IconIIcon :icon="icon.x" />
            </b-button>
            <br><br>
            <template v-if="action == 'addToGroup'">
              <b-form-select
                v-model="selectedClients"
                multiple
                size="sm"
                :select-size="10"
                :options="clientIds"
              >
                <template #first>
                  <b-form-select-option :value="null" disabled>
                    {{ $t('group.selectItems', {type: $t('title.clients')}) }}
                  </b-form-select-option>
                </template>
              </b-form-select>
              <b-button class="float-right" variant="success" size="sm" data-testid="addClientsToSelectedGroup" @click="addClientsToSelectedGroup">
                {{ $t("group.add") }}
              </b-button>
            </template>
            <template v-else-if="action == 'addSubgroup'">
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
            <template v-else-if="action == 'deleteOnlyAssignments'">
              <small> {{ $t('group.deleteOnlyAssignments.confirm', {type: 'client'}) }}</small>
              <b-button class="float-right" variant="danger" data-testid="removeClientAssignments" size="sm" @click="removeClientAssignments">
                {{ $t("group.remove") }}
              </b-button>
            </template>
            <template v-else-if="action == 'deletegroup'">
              <small> {{ $t('group.deletegroup.confirm', {type: 'client'}) }}</small>
              <b-button class="float-right" size="sm" variant="danger" data-testid="deleteGroup" @click="deleteGroup">
                {{ $t("label.delete") }}
              </b-button>
            </template>
            <template v-else-if="action == 'copyClient'">
              <treeselect
                v-model="selectedGroups"
                class="treeselect_notstored treeselect"
                :multiple="true"
                :flat="true"
                :placeholder="$t('group.copyClient.selectgroup')"
                :options="group"
                value-format="object"
                :normalizer="normalizerUpdateGroup"
              />
              <b-button variant="success" class="float-right" size="sm" :disabled="selectedGroups.length<1" @click="copyClientToGroups">
                {{ $t('group.copy') }}
              </b-button>
            </template>
            <template v-else-if="action == 'removeClient'">
              <small>{{ $t('group.removeClient.confirm') }}</small>
              <b-button variant="danger" class="float-right" size="sm" @click="removeClientFromGroup">
                {{ $t('group.remove') }}
              </b-button>
            </template>
          </b-col>
        </b-row>
      </b-tab>
    </b-tabs>
  </div> -->
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useNotification } from '~/composables/mixins/useComponent';
import {useIcons} from '../../composables/mixins/useIcons'
const icons = useIcons()
const isLoading = ref(false)
const groupActions = reactive({
  clientGroups: {
    category : 'clientGroups',
    actions: {
      parent: ['edit', 'delete', 'deleteOnlyAssignments', 'addChildren', 'addSubGroup'],
      children: ['copy', 'delete']
    }
  },
  prodGroups: {
    category : 'prodGroups',
    actions: {
      parent: ['edit', 'delete', 'deleteOnlyAssignments', 'addChildren', 'addSubGroup'],
      children: ['delete']
    }
  }
})
const defaultProps = {
  label: 'text',
  children: 'children'
}
const fetchedData = ref<any>({})
const fetchedClientData = ref<any>({})
const storeSelection = storeSelections()
// onMounted(async ()=> {
//   await fetch()
//   await fetchClients()
// })
// async function fetch() {
//   isLoading.value = true
//   const {data, error } = await useApiGETBody(`/opsidata/products/groups?selectedProducts=${storeSelection.selectionProducts}`)
//   if (error) {
//     useNotification().error(error)
//     isLoading.value = false
//     return
//   }
//   fetchedData.value = data.value.groups ?
//                         Object.entries(data.value.groups).map(([label, obj] :any ) => ({ ...obj, children: Object.values(obj.children || {})}))
//                         : []
//   isLoading.value = false
// }
// async function fetchClients() {
//   const {data, error } = await useApiGETBody(`/opsidata/hosts/groups?selectedDepots=${storeSelection.selectionDepots}`)
//   if (error) {
//     useNotification().error(error)
//     return
//   }

//   fetchedClientData.value = data.value  ?
//                               Object.entries(data.value).map(([label, obj] : any ) => ({ ...obj,
//                                 children: Object.entries(obj.children || {}).map(([labelA, objA] : any ) =>
//                                 ({ ...objA, children: Object.values(objA.children || {})}))}))
//                               : []
// }

// @Component({ mixins: [Icons, Client, Group, AlertToast, Strings] })
// export default class VGroups extends Vue {
//   group: Array<object>|undefined = undefined
//   selectedvalue: any = null
//   clientIds: Array<string> = []
//   selectedClients: Array<string> = []
//   updategroupparent: any = null
//   selectedGroups: Array<any> = []
//   selectedGroupsRemove: any = null
//   addClientToListOfGroups: any
//   action: string = ''
//   title: string = ''
//   subgroup: any = {
//     parentGroupId: '',
//     groupId: '',
//     description: '',
//     notes: ''
//   }

//   updategroup = {
//     parent: '',
//     description: '',
//     notes: ''
//   }

//   @selections.Getter public selectionDepots!: Array<string>
//   $root: any
//   $refs: any
//   $fetchState: any

//   normalizer (node: any) {
//     if (node.children) {
//       if (node.children.not_assigned) {
//         node.children.__not_assigned = node.children.not_assigned
//         delete node.children.not_assigned
//       }
//       return {
//         id: node.id,
//         label: node.text,
//         children: Object.values(Object.keys(node.children).sort().reduce(
//           (obj, key) => { obj[key] = node.children[key]; return obj }, {}
//         ))
//       }
//     }
//     return {
//       id: node.id,
//       label: node.text,
//       children: node.type === 'HostGroup' ? [] : undefined
//     }
//   }

//   normalizerUpdateGroup (node: any) {
//     if (node.children) {
//       return {
//         id: node.id,
//         label: node.text,
//         children: Object.values(node.children)
//       }
//     }
//     return {
//       id: node.id,
//       label: node.text,
//       isDisabled: node.type === 'ObjectToGroup',
//       children: node.type === 'HostGroup' ? [] : undefined
//     }
//   }

//   @Watch('selectionDepots', { deep: true }) async selectionDepotChanged () {
//     await this.fetchGroups()
//   }

//   async fetch () {
//     await this.fetchGroups()
//     await this.fetchClients()
//   }

//   async fetchGroups () {
//     this.group = undefined
//     const result = await this.$axios.$get(`/api/opsidata/hosts/groups?selectedDepots=[${this.selectionDepots}]`)
//     this.group = Object.values(result)
//     this.showChild(this.action)
//   }

//   showChild (selectedAction: string) {
//     this.action = selectedAction
//     const groupaction = 'group.' + this.action
//     this.title = this.$t(groupaction)
//   }

//   afterAsync () {
//     this.subgroup.groupId = this.subgroup.groupId + 'x'
//     this.subgroup.groupId = this.subgroup.groupId.slice(0, -1)
//   }

//   async removeClientFromGroup () {
//     const group = this.selectedvalue.parent
//     await this.$axios.$delete(`/api/opsidata/clients/${this.selectedvalue.text}/groups`, { data: [group] })
//       .then(async (response) => {
//         this.showToastSuccess(this.$t('message.success.save.delete.clientfromgroups', { client: this.selectedvalue.text }))
//         await this.fetchGroups()
//       })
//       .catch((error) => {
//         this.showToastError(error)
//       })
//     this.afterAsync()
//   }

//   async copyClientToGroups () {
//     const groupsList = this.selectedGroups.map(function (item) {
//       return item.text
//     })
//     const client = this.selectedvalue.text
//     await this.addClientToListOfGroups(client, groupsList)
//     await this.fetchGroups()
//     this.afterAsync()
//   }

//   async fetchClients () {
//     this.clientIds = await this.getClientIdList(this.selectionDepots)
//   }

//   async addClientsToSelectedGroup () {
//     await this.$axios.$post(`/api/opsidata/hosts/groups/${this.selectedvalue.text}/clients`, this.selectedClients)
//       .then(async (response) => {
//         this.showToastSuccess(this.$t('message.success.save.add.clientfromgroups', { group: this.selectedvalue.text }))
//         await this.fetchGroups()
//       })
//       .catch((error) => {
//         this.showToastError(error)
//       })
//     this.afterAsync()
//   }

//   async createSubGroup () {
//     this.subgroup.parentGroupId = this.selectedvalue.text
//     await this.$axios.$post('/api/opsidata/hosts/groups', this.subgroup)
//       .then(async (response) => {
//         this.showToastSuccess(this.$t('message.success.save.create.group', { group: this.subgroup.groupId }))
//         await this.fetchGroups()
//       })
//       .catch((error) => {
//         this.showToastError(error)
//       })
//     this.afterAsync()
//   }

//   async updateGroup () {
//     this.updategroup.parent = this.updategroupparent ? this.updategroupparent.text : ''
//     await this.$axios.$put(`/api/opsidata/hosts/groups/${this.selectedvalue.text}`, this.updategroup)
//       .then(async (response) => {
//         this.showToastSuccess(this.$t('message.success.save.update.group', { group: this.selectedvalue.text }))
//         await this.fetchGroups()
//       })
//       .catch((error) => {
//         this.showToastError(error)
//       })
//     this.afterAsync()
//   }

//   async deleteGroup () {
//     await this.$axios.$delete(`/api/opsidata/hosts/groups/${this.selectedvalue.text}`)
//       .then(async (response) => {
//         this.showToastSuccess(this.$t('message.success.save.delete.group', { group: this.selectedvalue.text }))
//         await this.fetchGroups()
//       })
//       .catch((error) => {
//         this.showToastError(error)
//       })
//     this.afterAsync()
//   }

//   async removeClientAssignments () {
//     await this.$axios.$delete(`/api/opsidata/hosts/groups/${this.selectedvalue.text}/clients`)
//       .then(async (response) => {
//         this.showToastSuccess(this.$t('message.success.save.delete.clientsfromgroup', { group: this.selectedvalue.text }))
//         await this.fetchGroups()
//       })
//       .catch((error) => {
//         this.showToastError(error)
//       })
//     this.afterAsync()
//   }
// }
</script>
<style>
/* .groupstabs .tab-content {
  height: 82vh;
  margin: 10px;
} */
</style>
