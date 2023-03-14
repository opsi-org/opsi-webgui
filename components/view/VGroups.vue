<template>
  <!-- TODO: Fetch Hostgroups in given format, not lazy loaded. -->
  <!-- TODO: If group selected: Add clients to group -->
  <!-- TODO: If group selected: Move group to different location -->
  <!-- TODO: If group selected: Create subgroup -->
  <!-- TODO: If group selected: Edit group properties -->
  <!-- TODO: If group selected: Delete group with subgroup and all client assignments -->
  <!-- TODO: If group selected: Only delete client assignments -->
  <!-- TODO: If client selected: Move to another group -->
  <!-- TODO: If client selected: Copy to another group -->

  <!-- <IconILoading v-if="$fetchState.pending" :small="true" /> -->
  <div class="VGroups">
    <OverlayOLoading :is-loading="$fetchState.pending" />
    <BarBPageHeader>
      <template #left>
        <TreeTSDepots />
      </template>
    </BarBPageHeader>
    <b-tabs data-testid="VGroups">
      <b-tab>
        <template #title>
          <span class="client"> {{ $t("form.clientgroups") }} </span>
        </template>
        <DivDScrollResult>
          <b-row>
            <b-col cols="4">
              <!-- {{ $t('Select Server : ') }}<TreeTSDepotsNotStored :id.sync="depotId" /> <br> -->
              <!-- {{ $t('Select Group or Client : ') }} -->
              <treeselect
                v-model="value"
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
            <b-col v-if="value">
              <!-- {{ value }} -->
              <div v-if="value.type == 'HostGroup'">
                <span class="font-weight-bold">
                  {{ $t('Selected Group : ') }} {{ value.text }}
                </span>
                <b-tabs>
                  <b-tab>
                    <template #title>
                      <span class="client"> {{ $t("Add clients") }} </span>
                    </template>
                    {{ $t("Add clients to group") }} <br><br>
                    <div>
                      <span>{{ $t("Select Clients:   ") }}</span><TreeTSClientsNotStored :id.sync="clientIds" />
                      <b-button variant="success">
                        {{ $t("Add") }}
                      </b-button>
                    </div>
                  </b-tab>
                  <b-tab>
                    <template #title>
                      <span class="client"> {{ $t("Create subgroup") }} </span>
                    </template>
                    {{ $t("Create subgroup, doubt: along with clients ?") }} <br><br>
                    <b-form inline>
                      <b-form-input id="inline-form-input-username" :placeholder="$t('Enter Subgroup')" />
                      <b-button variant="success">
                        {{ $t("Create") }}
                      </b-button>
                    </b-form>
                  </b-tab>
                  <b-tab>
                    <template #title>
                      <span class="client"> {{ $t("Edit properties") }} </span>
                    </template>
                    {{ $t("Edit group properties") }}
                  </b-tab>
                  <b-tab>
                    <template #title>
                      <span class="client"> {{ $t("Move group") }} </span>
                    </template>
                    {{ $t("Move group to different location") }}
                    <div>
                      <treeselect value-format="object" :options="group" />
                      <b-button variant="primary">
                        {{ $t("Move") }}
                      </b-button>
                    </div>
                  </b-tab>
                  <b-tab>
                    <template #title>
                      <span class="client"> {{ $t("Delete group") }} </span>
                    </template>
                    {{ $t("Delete group with subgroup and all client assignments") }}
                    <b-button variant="danger">
                      {{ $t("Delete") }}
                    </b-button>
                  </b-tab>
                  <b-tab>
                    <template #title>
                      <span class="client"> {{ $t("Delete client assignments") }} </span>
                    </template>
                    {{ $t("Only delete client assignments") }}
                    <b-button variant="danger">
                      {{ $t("Delete") }}
                    </b-button>
                  </b-tab>
                </b-tabs>
              </div>
              <div v-if="value.type == 'ObjectToGroup'">
                <span class="font-weight-bold">
                  {{ $t('Selected Client : ') }} {{ value.text }}
                </span>
                <b-tabs>
                  <b-tab>
                    <template #title>
                      <span class="client"> {{ $t("Move") }} </span>
                    </template>
                    {{ $t("Move to another group") }}
                    <div>
                      <treeselect value-format="object" :options="group" />
                      <b-button variant="primary">
                        {{ $t("Move") }}
                      </b-button>
                    </div>
                  </b-tab>
                  <b-tab>
                    <template #title>
                      <span class="client"> {{ $t("Copy") }} </span>
                    </template>
                    {{ $t("Copy to another group") }}
                    <div>
                      <treeselect value-format="object" :options="group" />
                      <b-button variant="primary">
                        {{ $t("Copy") }}
                      </b-button>
                    </div>
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
          <span class="product"> {{ $t('form.productgroups') }} </span>
        </template>
      </b-tab> -->
    </b-tabs>
  </div>
</template>

<script lang="ts">
import { Component, namespace, Watch, Vue } from 'nuxt-property-decorator'
import { Constants } from '../../mixins/uib-mixins'
// const selections = namespace('selections')
// interface ClientRequest {
//     selectedDepots: string
// }
const selections = namespace('selections')
@Component({ mixins: [Constants] })
export default class VGroups extends Vue {
  iconnames: any
  depotId: string = ''
  group: Array<object> = []
  value: any = null
  clientIds: any
  $axios: any
  node: any
  $fetch: any

  @selections.Getter public selectionDepots!: Array<string>

  normalizer (node: any) {
    return {
      id: node.id,
      label: node.text,
      children: node.children ? Object.values(node.children) : (node.type === 'HostGroup' ? [] : undefined)
    }
  }

  @Watch('selectionDepots', { deep: true }) async selectionDepotChanged () {
    await this.$fetch()
  }

  // @Watch('depotId', { deep: true }) async depotsChanged () {
  //   await this.$fetch()
  // }

  async fetch () {
    const result = await this.$axios.$get(`/api/opsidata/hosts/groups?selectedDepots=[${this.selectionDepots}]`)
    // this.group = Object.values(result)
    if (result) {
      const customgroups: any = result.groups
      console.log(JSON.stringify(customgroups.children.clientdirectory))
      // delete customgroups.children.clientdirectory

      this.group = [customgroups, result.groups.children.clientdirectory]
    }

    // this.group = [
    //   {
    //     id: 'groups',
    //     label: 'groups',
    //     type: 'HostGroup',
    //     children: [
    //       {
    //         id: 'testgroup1;groups',
    //         label: 'testgroup1',
    //         type: 'HostGroup',
    //         children: [
    //           {
    //             id: 'client1.uib.local;testgroup1',
    //             label: 'client1.uib.local',
    //             type: 'ObjectToGroup'
    //           }
    //         ]
    //       },
    //       {
    //         id: 'testgroup2;groups',
    //         label: 'testgroup2',
    //         type: 'HostGroup',
    //         children: [
    //           {
    //             id: 'client1.uib.local;testgroup2',
    //             label: 'client1.uib.local',
    //             type: 'ObjectToGroup'
    //           },
    //           {
    //             id: 'client2.uib.local;testgroup2',
    //             label: 'client2.uib.local',
    //             type: 'ObjectToGroup'
    //           },
    //           {
    //             id: 'client3.uib.local;testgroup2',
    //             label: 'client3.uib.local',
    //             type: 'ObjectToGroup'
    //           }
    //         ]
    //       }
    //     ]
    //   },
    //   {
    //     id: 'clientdirectory',
    //     label: 'clientdirectory',
    //     type: 'HostGroup',
    //     children: [{}]
    //   }
    // ]
  }
}
</script>
<style>
.VGroups {
  width: 98% ;
}
</style>
