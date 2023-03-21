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
          <span> {{ $t("form.clientgroups") }} </span>
        </template>
        <DivDScrollResult>
          <b-row>
            <b-col cols="4">
              <treeselect
                v-model="selectedvalue"
                class="treeselect_notstored treeselect_fullpage"
                always-open
                :default-expand-level="1"
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
                  {{ $t('Selected Group : ') }} {{ selectedvalue.text }}
                </span>
                <br><br>
                <b-tabs>
                  <b-tab>
                    <template #title>
                      <span v-b-tooltip.hover :title="$t('Add client to the selected group.')">
                        {{ $t("Add client") }}
                      </span>
                    </template>
                    <br>
                    <b-form>
                      <b-form-select v-model="selectedClients" v-b-tooltip.hover :title="$t('Select a Client')" multiple :options="clientIds">
                        <template #first>
                          <b-form-select-option :value="null" disabled>
                            {{ $t('-- Select a Client --') }}
                          </b-form-select-option>
                        </template>
                      </b-form-select>
                      <b-button class="float-right" variant="success" @click="addClientsToSelectedGroup">
                        {{ $t("Add") }}
                      </b-button>
                    </b-form>
                  </b-tab>
                  <b-tab>
                    <template #title>
                      <span v-b-tooltip.hover :title="$t('Create subgroup for the selected group.')">
                        {{ $t("Create subgroup") }}
                      </span>
                    </template>
                    <br>
                    <b-form>
                      <b-form-input v-model="subgroup.groupId" v-b-tooltip.hover :title="$t('Subgroup ID')" :placeholder="$t('Subgroup ID')" />
                      <b-form-input v-model="subgroup.description" v-b-tooltip.hover :title="$t('Description')" :placeholder="$t('Description')" />
                      <b-form-input v-model="subgroup.notes" v-b-tooltip.hover :title="$t('Notes')" :placeholder="$t('Notes')" />
                      <b-button class="float-right" variant="success" @click="createSubGroup()">
                        {{ $t("Create") }}
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
                        v-b-tooltip.hover
                        :title="$t('Parent Group ID')"
                        :placeholder="$t('Parent Group ID')"
                        value-format="object"
                        :options="group"
                        :normalizer="normalizer"
                      />
                      <b-form-input v-b-tooltip.hover :title="$t('Description')" :placeholder="$t('Description')" />
                      <b-form-input v-b-tooltip.hover :title="$t('Notes')" :placeholder="$t('Notes')" />
                      <b-button class="float-right" variant="success">
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
                    <b-button class="float-right" variant="danger">
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
                    <b-button class="float-right" variant="danger">
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
                      v-b-tooltip.hover
                      :title="$t('Select groups to add the selected client')"
                      :placeholder="$t('Select groups to add the selected client')"
                      value-format="object"
                      :options="group"
                      :normalizer="normalizer"
                    />
                    <b-button class="float-right" variant="success">
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
                      v-b-tooltip.hover
                      :title="$t('Select groups to remove the selected client assignment')"
                      :placeholder="$t('Select groups to remove the selected client assignment')"
                      value-format="object"
                      :options="group"
                      :normalizer="normalizer"
                    />
                    <b-button class="float-right" variant="danger">
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

  @selections.Getter public selectionDepots!: Array<string>

  normalizer (node: any) {
    return {
      id: node.id,
      label: node.text,
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
    await this.$axios.$post(`/api/opsidata/hosts/groups/${this.selectedvalue.id}/clients`, this.selectedClients)
      .catch((error) => {
        const detailedError = ((error?.response?.data?.message) ? error.response.data.message : '') + ' ' + ((error?.response?.data?.details) ? error.response.data.details : '')
        const ref = (this.$refs.groupAlert as any)
        ref.alert(this.$t('ERROR:') as string + 'DepotClients', 'danger', detailedError)
      })
  }

  async createSubGroup () {
    this.subgroup.parentGroupId = this.selectedvalue.id
    await this.$axios.$post('/api/opsidata/hosts/groups', this.subgroup)
      .catch((error) => {
        const detailedError = ((error?.response?.data?.message) ? error.response.data.message : '') + ' ' + ((error?.response?.data?.details) ? error.response.data.details : '')
        const ref = (this.$refs.groupAlert as any)
        ref.alert(this.$t('ERROR:') as string + 'DepotClients', 'danger', detailedError)
      })
  }
}
</script>
<style>
.VGroups {
  width: 98% ;
}
</style>
