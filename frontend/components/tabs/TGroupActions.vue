<template>
  <el-tabs lazy>
    <el-tab-pane v-for="category in groupActions" :key="category.category" :label="$t('title.' + category.category)">
      <TreeTGroupActions :data="category" />
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
const groupActions = reactive([
  {
    category: 'client-group',
    actions: {
      maingroups: ['group-add'],
      parent: ['edit', 'delete', 'client-delete', 'client-add', 'group-add'],
      children: ['delete', 'copy']
    }
  },
  // TODO: Add group-add to the list prodGroups.actions.parent
  {
    category: 'product-group',
    actions: {
      parent: ['edit', 'delete', 'product-delete', 'product-add'],
      children: ['delete']
    }
  }
])

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

</script>
