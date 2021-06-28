<template>
  <TreeTSTreeselectAsync :options="Object.values(hostGroup)" :type="'hostgroup'" :load-options="loadOptions" />
</template>

<script lang="ts">
import { Component, namespace, Vue } from 'nuxt-property-decorator'
import { IGroups } from '~/types/tbackendmethods'
const selections = namespace('selections')

@Component
export default class TSHostGroup extends Vue {
  @selections.Getter public selectionDepots!: Array<string>
  hostGroup: IGroups = {
    clientdirectory: {
      id: 'clientdirectory',
      label: 'clientdirectory',
      isBranch: true,
      type: 'HostGroup',
      children: null
    },
    groups: {
      id: 'groups',
      label: 'groups',
      isBranch: true,
      type: 'HostGroup',
      children: null
    },
    clientlist: {
      id: 'clientlist',
      label: 'clientlist',
      isBranch: true,
      type: 'HostGroup',
      children: null
    }
  }

  async loadOptions ({ action, parentNode, /* searchQuery, */ callback }:any) {
    if (action === 'ASYNC_SEARCH') {
      // this.simulateAsyncOperation(() => {
      //   const options = [1, 2, 3, 4, 5].map(i => ({
      //     id: `${searchQuery}-${i}`,
      //     label: `${searchQuery}-${i}`,
      //   }))
      //   callback(null, options)
      // })
    } else if (action === 'LOAD_CHILDREN_OPTIONS') {
      if (parentNode.id === 'clientlist') {
        if (this.hostGroup.clientlist.children === null) {
          await this.fetchClientIds({ parentNode })
        } else {
          parentNode.children = Object.values(this.hostGroup.clientlist.children)
        }
      } else {
        this.fetchGroupChildren({ parentNode })
      }
      callback()
    }
  }

  async fetchClientIds ({ parentNode }: any) {
    const clientlist: Array<string> = (await this.$axios.$post(
      '/api/opsidata/depots/clients',
      JSON.stringify({ selectedDepots: this.selectionDepots }))).result.clients.sort()
    clientlist.forEach((clientId:string) => {
      if (parentNode.children === null) {
        parentNode.children = {}
      }
      parentNode.children[clientId] = {
        id: clientId,
        label: clientId,
        isBranch: false
      }
    })
    parentNode.children = Object.values(parentNode.children)
  }

  fetchGroupChildren ({ parentNode }: any) {
    // TODO: axios: 'opsidata/hostgroup/', param:{groupId: node.id, groupLabel: node.label} return node.children zB
    parentNode.children = Object.values({
      '40_gefundene_software': {
        id: '40_gefundene_software',
        label: '40_gefundene_software',
        isBranch: true,
        type: 'HostGroup',
        children: null
      },
      'xxx.uib.local': {
        id: 'xxx.uib.local',
        label: 'xxx.uib.local',
        isBranch: false,
        type: 'ObjectToGroup'
      }
    })
  }
}

</script>

<style>

</style>
