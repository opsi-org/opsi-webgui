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
  <div>
    <!-- {{ dummygroup }} -->
    <b-tabs data-testid="VGroups">
      <b-tab>
        <template #title>
          <span class="client"> {{ $t("form.clientgroups") }} </span>
        </template>
        <b-row>
          <b-col cols="4">
            {{ $t('Select Server : ') }}<TreeTSDepotsNotStored :id.sync="depotId" /> <br>
            {{ $t('Select Group or Client : ') }}<treeselect v-model="value" value-format="object" always-open :options="dummygroup" />
          </b-col>
          <b-col v-if="value">
            <!-- {{ value }} -->
            <div v-if="value.type == 'HostGroup'">
              {{ $t('Selected Group : ') }} {{ value.label }}
              <b-tabs>
                <b-tab>
                  <template #title>
                    <span class="client"> {{ $t("Add clients") }} </span>
                  </template>
                  {{ $t("Add clients to group") }} <br><br>
                  <b-form inline>
                    <span>{{ $t("Select Clients:   ") }}</span><TreeTSClientsNotStored :id.sync="clientIds" />
                    <b-button v-if="clientIds" variant="success">
                      {{ $t("Add") }}
                    </b-button>
                  </b-form>
                </b-tab>
                <b-tab>
                  <template #title>
                    <span class="client"> {{ $t("Create subgroup") }} </span>
                  </template>
                  {{ $t("Create subgroup, doubt: along with clients ?") }}
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
                </b-tab>
                <b-tab>
                  <template #title>
                    <span class="client"> {{ $t("Delete group") }} </span>
                  </template>
                  {{ $t("Delete group with subgroup and all client assignments") }}
                </b-tab>
                <b-tab>
                  <template #title>
                    <span class="client"> {{ $t("Delete client assignments") }} </span>
                  </template>
                  {{ $t("Only delete client assignments") }}
                </b-tab>
              </b-tabs>
            </div>
            <div v-if="value.type == 'ObjectToGroup'">
              {{ $t('Selected Client : ') }} {{ value.label }} <br>
              <b-tabs>
                <b-tab>
                  <template #title>
                    <span class="client"> {{ $t("Move") }} </span>
                  </template>
                  {{ $t("Move to another group") }}
                </b-tab>
                <b-tab>
                  <template #title>
                    <span class="client"> {{ $t("Copy") }} </span>
                  </template>
                  {{ $t("Copy to another group") }}
                </b-tab>
              </b-tabs>
            </div>
          </b-col>
        </b-row>
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
import { Component, Vue } from 'nuxt-property-decorator'
// const selections = namespace('selections')
// interface ClientRequest {
//     selectedDepots: string
// }
@Component
export default class VGroups extends Vue {
  depotId: string = ''
  group: any
  value: any = null
  clientIds: any
  dummygroup: any = [
    {
      id: 'groups',
      label: 'groups',
      type: 'HostGroup',
      children: [
        {
          id: 'testgroup1;groups',
          label: 'testgroup1',
          type: 'HostGroup',
          children: [
            {
              id: 'client1.uib.local;testgroup1',
              label: 'client1.uib.local',
              type: 'ObjectToGroup'
            }
          ]
        },
        {
          id: 'testgroup2;groups',
          label: 'testgroup2',
          type: 'HostGroup',
          children: [
            {
              id: 'client1.uib.local;testgroup2',
              label: 'client1.uib.local',
              type: 'ObjectToGroup'
            },
            {
              id: 'client2.uib.local;testgroup2',
              label: 'client2.uib.local',
              type: 'ObjectToGroup'
            },
            {
              id: 'client3.uib.local;testgroup2',
              label: 'client3.uib.local',
              type: 'ObjectToGroup'
            }
          ]
        }
      ]
    },
    {
      id: 'clientdirectory',
      label: 'clientdirectory',
      type: 'HostGroup',
      children: [{}]
    }
  ]

  // normalizer (node: any) {
  //   return {
  //     id: node.id,
  //     label: node.text,
  //     children: [node.children]
  //   }
  // }

  // fetch () {
  //   const result = await this.$axios.$get('/api/opsidata/hosts/groups')
  //   this.group = result
  // }
}
</script>
