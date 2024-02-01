<template>
  <el-tabs lazy>
    <el-tab-pane v-for="options, category in groupActions" :key="category" :label="$t('treeselect.' + category)">
      <TreeTGroupsActions :data="options" />
    </el-tab-pane>
  </el-tabs>


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
const groupActions = reactive({
  clientGroups: {
    category : 'clientGroups',
    actions: {
      maingroups: ['group-add'],
      parent: ['edit', 'delete', 'client-delete', 'client-add', 'group-add'],
      children: ['delete', 'copy']
    }
  },
  prodGroups: {
    category : 'prodGroups',
    actions: {
      parent: ['edit', 'delete', 'product-delete', 'product-add', 'group-add'],
      children: ['delete']
    }
  }
})

//   @Watch('selectionDepots', { deep: true }) async selectionDepotChanged () {
//     await this.fetchGroups()
//   }

//   async fetch () {
//     await this.fetchGroups()
//     await this.fetchClients()
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
