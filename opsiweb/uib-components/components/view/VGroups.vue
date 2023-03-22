<template>
  <div class="VGroups">
    <OverlayOLoading :is-loading="$fetchState.pending" />
    <AlertAAlert ref="groupAlert" />
    <BarBPageHeader>
      <template #left>
        <TreeTSDepots />
      </template>
    </BarBPageHeader>
    <b-tabs data-testid="VGroups">
      <b-tab>
        <template #title>
          <span> {{ $t("form.clientGroups") }} </span>
        </template>
        <DivDScrollResult>
          <b-row>
            <b-col cols="4">
              <treeselect
                v-model="selectedvalue"
                class="treeselect_notstored treeselect_fullpage"
                always-open
                :default-expand-level="4"
                :normalizer="normalizer"
                value-format="object"
                :options="group"
              >
                <div slot="option-label" slot-scope="{ node }">
                  <div :ref="'tree-item-'+node.id">
                    <b-icon v-if="node.isBranch" :icon="iconnames.group" />
                    <b-icon v-else :icon="iconnames.client" />
                    <small> {{ node.label }} </small>
                  </div>
                </div>
              </treeselect>
            </b-col>
            <b-col v-if="selectedvalue">
              <br>
              <div v-if="selectedvalue.type == 'HostGroup'">
                <span class="font-weight-bold">
                  {{ $t('group.select') }} {{ selectedvalue.text }}
                </span>
                <br><br>
                <b-tabs>
                  <b-tab>
                    <template #title>
                      <span v-b-tooltip.hover :title="$t('group.addclient.tooltip')">
                        {{ $t("group.addclient") }}
                      </span>
                    </template>
                    <br>
                    <b-form>
                      <b-form-select v-model="selectedClients" v-b-tooltip.hover :title="$t('form.client')" multiple :options="clientIds">
                        <template #first>
                          <b-form-select-option :value="null" disabled>
                            {{ $t('form.client') }}
                          </b-form-select-option>
                        </template>
                      </b-form-select>
                      <b-button class="float-right" variant="success" @click="addClientsToSelectedGroup">
                        {{ $t("group.add") }}
                      </b-button>
                    </b-form>
                  </b-tab>
                  <b-tab>
                    <template #title>
                      <span v-b-tooltip.hover :title="$t('group.subgroup.tooltip')">
                        {{ $t("group.subgroup") }}
                      </span>
                    </template>
                    <br>
                    <b-form>
                      <b-form-input v-model="subgroup.groupId" v-b-tooltip.hover :title="$t('group.subgroupname')" :placeholder="$t('group.subgroupname')" />
                      <b-form-input v-model="subgroup.description" v-b-tooltip.hover :title="$t('table.fields.description')" :placeholder="$t('table.fields.description')" />
                      <b-form-input v-model="subgroup.notes" v-b-tooltip.hover :title="$t('table.fields.notes')" :placeholder="$t('table.fields.notes')" />
                      <b-button class="float-right" variant="success" @click="createSubGroup">
                        {{ $t("button.create") }}
                      </b-button>
                    </b-form>
                  </b-tab>
                  <b-tab>
                    <template #title>
                      <span v-b-tooltip.hover :title="$t('Move the selected group to a new parent or update its attributes.')">
                        {{ $t("Update group") }}
                      </span>
                    </template>
                    <br>
                    <div>
                      <treeselect
                        v-model="updategroupparent"
                        v-b-tooltip.hover
                        :title="$t('Parent Group')"
                        :placeholder="$t('Parent Group')"
                        value-format="object"
                        :options="group"
                        :normalizer="normalizerUpdateGroup"
                      />
                      <b-form-input v-model="updategroup.description" v-b-tooltip.hover :title="$t('Description')" :placeholder="$t('Description')" />
                      <b-form-input v-model="updategroup.notes" v-b-tooltip.hover :title="$t('Notes')" :placeholder="$t('Notes')" />
                      <b-button class="float-right" variant="success" @click="updateGroup">
                        {{ $t("Update") }}
                      </b-button>
                    </div>
                  </b-tab>
                  <b-tab>
                    <template #title>
                      <span v-b-tooltip.hover :title="$t('Delete selected group along with subgroups and client assignments.')">
                        {{ $t("Delete group") }}
                      </span>
                    </template>
                    <br>
                    <span> {{ $t('Are you sure you want to delete the selected group along with its subgroups and client assignments?') }}</span>
                    <b-button class="float-right" variant="danger" @click="deleteGroup">
                      {{ $t("Delete") }}
                    </b-button>
                  </b-tab>
                  <b-tab>
                    <template #title>
                      <span v-b-tooltip.hover :title="$t('Remove client assignments from the selected group.')">
                        {{ $t("Remove clients") }}
                      </span>
                    </template>
                    <br>
                    <span> {{ $t('Are you sure you want to delete client assignments of the selected group?') }}</span>
                    <b-button class="float-right" variant="danger" @click="removeClientAssignments">
                      {{ $t("Remove") }}
                    </b-button>
                  </b-tab>
                </b-tabs>
              </div>
              <div v-if="selectedvalue.type == 'ObjectToGroup'">
                <span class="font-weight-bold">
                  {{ $t('Selected Client : ') }} {{ selectedvalue.text }}
                </span>
                <br><br>
                <b-tabs>
                  <b-tab>
                    <template #title>
                      <span v-b-tooltip.hover :title="$t('Add the selected client to groups.')">
                        {{ $t("Add") }}
                      </span>
                    </template>
                    <treeselect
                      v-model="selectedGroups"
                      v-b-tooltip.hover
                      :multiple="true"
                      :flat="true"
                      :title="$t('Select groups to add the selected client')"
                      :placeholder="$t('Select groups to add the selected client')"
                      :options="group"
                      value-format="object"
                      :normalizer="normalizerUpdateGroup"
                    />
                    <b-button class="float-right" variant="success" @click="addSelectedClientToGroups">
                      {{ $t("Add") }}
                    </b-button>
                  </b-tab>
                  <b-tab>
                    <template #title>
                      <span v-b-tooltip.hover :title="$t('Remove the selected client from groups.')">
                        {{ $t("Remove") }}
                      </span>
                    </template>
                    <treeselect
                      v-model="selectedGroupsRemove"
                      v-b-tooltip.hover
                      :multiple="true"
                      :flat="true"
                      :title="$t('Select groups to remove the selected client assignment')"
                      :placeholder="$t('Select groups to remove the selected client assignment')"
                      :options="group"
                      value-format="object"
                      :normalizer="normalizerUpdateGroup"
                    />
                    <b-button class="float-right" variant="danger" @click="removeSelectedClientFromGroups">
                      {{ $t("Remove") }}
                    </b-button>
                  </b-tab>
                </b-tabs>
              </div>
            </b-col>
          </b-row>
        </DivDScrollResult>
        <!-- {{ group }} -->
      </b-tab>
      <!-- <b-tab>
        <template #title>
          <span> {{ $t('form.productgroups') }} </span>
        </template>
      </b-tab> -->
    </b-tabs>
  </div>
</template>

<script lang="ts">
import { Component, namespace, Watch, Vue } from 'nuxt-property-decorator'
import { Constants } from '../../mixins/uib-mixins'
const selections = namespace('selections')
@Component({ mixins: [Constants] })
export default class VGroups extends Vue {
  iconnames: any
  $axios: any
  node: any
  $fetch: any
  $t: any
  group: Array<object> = []
  selectedvalue: any = null
  clientIds: Array<string> = []
  selectedClients: Array<string> = []
  subgroup: any = {
    parentGroupId: '',
    groupId: '',
    description: '',
    notes: ''
  }

  updategroupparent: any = null

  updategroup: any = {
    parent: '',
    description: '',
    notes: ''
  }

  selectedGroups: any = null
  selectedGroupsRemove: any = null

  @selections.Getter public selectionDepots!: Array<string>

  normalizer (node: any) {
    return {
      id: node.id,
      label: node.text,
      children: node.children ? Object.values(node.children) : (node.type === 'HostGroup' ? [] : undefined)
    }
  }

  normalizerUpdateGroup (node: any) {
    return {
      id: node.id,
      label: node.text,
      isDisabled: node.type === 'ObjectToGroup',
      children: node.children ? Object.values(node.children) : (node.type === 'HostGroup' ? [] : undefined)
    }
  }

  @Watch('selectionDepots', { deep: true }) async selectionDepotChanged () {
    await this.fetchGroups()
  }

  async fetch () {
    await this.fetchGroups()
    await this.fetchClients()
  }

  async fetchGroups () {
    const result = await this.$axios.$get(`/api/opsidata/hosts/groups?selectedDepots=[${this.selectionDepots}]`)
    this.group = Object.values(result)
    // if (result) {
    //   const customgroups: any = result.groups
    //   // console.log(JSON.stringify(customgroups.children.clientdirectory))
    //   // delete customgroups.children.clientdirectory

    //   this.group = [customgroups, result.groups.children.clientdirectory]
    // }
  }

  async fetchClients () {
    await this.$axios.$get(`/api/opsidata/depots/clients?selectedDepots=[${this.selectionDepots}]`)
      .then((response) => {
        this.clientIds = response.sort()
      })
  }

  async addClientsToSelectedGroup () {
    await this.$axios.$post(`/api/opsidata/hosts/groups/${this.selectedvalue.text}/clients`, this.selectedClients)
      .then((response) => {
        const ref = (this.$refs.groupAlert as any)
        ref.alert('', 'success', response)
        this.fetchGroups()
      })
      .catch((error) => {
        const detailedError = ((error?.response?.data?.message) ? error.response.data.message : '') + ' ' + ((error?.response?.data?.details) ? error.response.data.details : '')
        const ref = (this.$refs.groupAlert as any)
        ref.alert(this.$t('ERROR:') as string, 'danger', detailedError)
      })
  }

  async createSubGroup () {
    this.subgroup.parentGroupId = this.selectedvalue.text
    await this.$axios.$post('/api/opsidata/hosts/groups', this.subgroup)
      .then((response) => {
        const ref = (this.$refs.groupAlert as any)
        ref.alert('', 'success', response)
        this.fetchGroups()
      })
      .catch((error) => {
        const detailedError = ((error?.response?.data?.message) ? error.response.data.message : '') + ' ' + ((error?.response?.data?.details) ? error.response.data.details : '')
        const ref = (this.$refs.groupAlert as any)
        ref.alert(this.$t('ERROR:') as string, 'danger', detailedError)
      })
  }

  async updateGroup () {
    this.updategroup.parent = this.updategroupparent ? this.updategroupparent.text : ''
    await this.$axios.$put(`/api/opsidata/hosts/groups/${this.selectedvalue.text}`, this.updategroup)
      .then((response) => {
        const ref = (this.$refs.groupAlert as any)
        ref.alert('', 'success', response)
        this.fetchGroups()
      })
      .catch((error) => {
        const detailedError = ((error?.response?.data?.message) ? error.response.data.message : '') + ' ' + ((error?.response?.data?.details) ? error.response.data.details : '')
        const ref = (this.$refs.groupAlert as any)
        ref.alert(this.$t('ERROR:') as string, 'danger', detailedError)
      })
  }

  async deleteGroup () {
    await this.$axios.$delete(`/api/opsidata/hosts/groups/${this.selectedvalue.text}`)
      .then((response) => {
        const ref = (this.$refs.groupAlert as any)
        ref.alert('', 'success', response)
        this.fetchGroups()
      })
      .catch((error) => {
        const detailedError = ((error?.response?.data?.message) ? error.response.data.message : '') + ' ' + ((error?.response?.data?.details) ? error.response.data.details : '')
        const ref = (this.$refs.groupAlert as any)
        ref.alert(this.$t('ERROR:') as string, 'danger', detailedError)
      })
  }

  async removeClientAssignments () {
    await this.$axios.$delete(`/api/opsidata/hosts/groups/${this.selectedvalue.text}/clients`)
      .then((response) => {
        const ref = (this.$refs.groupAlert as any)
        ref.alert('', 'success', response)
        this.fetchGroups()
      })
      .catch((error) => {
        const detailedError = ((error?.response?.data?.message) ? error.response.data.message : '') + ' ' + ((error?.response?.data?.details) ? error.response.data.details : '')
        const ref = (this.$refs.groupAlert as any)
        ref.alert(this.$t('ERROR:') as string, 'danger', detailedError)
      })
  }

  async addSelectedClientToGroups () {
    const selectedGroupsArr = this.selectedGroups.map(function (item) {
      return item.text
    })
    await this.$axios.$post(`/api/opsidata/clients/${this.selectedvalue.text}/groups`, selectedGroupsArr)
      .then((response) => {
        const ref = (this.$refs.groupAlert as any)
        ref.alert('', 'success', response)
        this.fetchGroups()
      })
      .catch((error) => {
        const detailedError = ((error?.response?.data?.message) ? error.response.data.message : '') + ' ' + ((error?.response?.data?.details) ? error.response.data.details : '')
        const ref = (this.$refs.groupAlert as any)
        ref.alert(this.$t('ERROR:') as string, 'danger', detailedError)
      })
  }

  async removeSelectedClientFromGroups () {
    const selectedGroupsArr = this.selectedGroupsRemove.map(function (item) {
      return item.text
    })
    await this.$axios.$delete(`/api/opsidata/clients/${this.selectedvalue.text}/groups`, { data: selectedGroupsArr })
      .then((response) => {
        const ref = (this.$refs.groupAlert as any)
        ref.alert('', 'success', response)
        this.fetchGroups()
      })
      .catch((error) => {
        const detailedError = ((error?.response?.data?.message) ? error.response.data.message : '') + ' ' + ((error?.response?.data?.details) ? error.response.data.details : '')
        const ref = (this.$refs.groupAlert as any)
        ref.alert(this.$t('ERROR:') as string, 'danger', detailedError)
      })
  }
}
</script>
<style>
.VGroups {
  width: 98% ;
}
</style>
