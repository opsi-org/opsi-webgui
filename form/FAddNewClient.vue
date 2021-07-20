<template>
  <div>
    <b-row>
      <b-col cols="3" class="text-right">
        <small>Client ID</small>
      </b-col>
      <b-col :cols="($mq == 'mobile')?4:3">
        <b-form-input
          v-model="newClient.clientNamewithoutDomain"
          type="text"
          required
        />
      </b-col>
      <b-col :cols="($mq == 'mobile')?4:3">
        <b-form-input v-model="domainName" size="sm" type="text" required />
      </b-col>
    </b-row>
    <b-row>
      <b-col cols="3" class="text-right">
        <small>Depot ID</small>
      </b-col>
      <b-col :cols="($mq == 'mobile')?8:6">
        <b-form-select
          v-model="newClient.selectedDepot"
          :options="depotOptions"
        />
      </b-col>
    </b-row>

    <small> <b>Client Details: </b> </small>
    <b-row>
      <b-col cols="3" class="text-right">
        <small>Description</small>
      </b-col>
      <b-col :cols="($mq == 'mobile')?8:6">
        <b-form-input
          v-model="newClient.description"
          type="text"
        />
      </b-col>
    </b-row>
    <b-row>
      <b-col cols="3" class="text-right">
        <small>Inventory Number</small>
      </b-col>
      <b-col :cols="($mq == 'mobile')?8:6">
        <b-form-input
          v-model="newClient.inventoryNo"
          type="text"
        />
      </b-col>
    </b-row>
    <b-row>
      <b-col cols="3" class="text-right">
        <small>Hardware Address</small>
      </b-col>
      <b-col :cols="($mq == 'mobile')?8:6">
        <b-form-input
          v-model="newClient.hardwareAddr"
          type="text"
        />
      </b-col>
    </b-row>
    <b-row>
      <b-col cols="3" class="text-right">
        <small>IP Address</small>
      </b-col>
      <b-col :cols="($mq == 'mobile')?8:6">
        <b-form-input
          v-model="newClient.ipAddr"
          type="text"
        />
      </b-col>
    </b-row>
    <b-row>
      <b-col cols="3" class="text-right">
        <small>Notes</small>
      </b-col>
      <b-col :cols="($mq == 'mobile')?8:6">
        <b-form-textarea
          v-model="newClient.notes"
          rows="2"
          no-resize
        />
      </b-col>
    </b-row>

    <small> <b> Additional Information: </b></small>

    <b-row>
      <b-col cols="3" class="text-right">
        <small>Localboot Product</small>
      </b-col>
      <b-col :cols="($mq == 'mobile')?8:6">
        <b-form-select
          v-model="newClient.localbootProd"
          :options="localbootProdOptions"
        >
          <template #first>
            <option :value="undefined" />
          </template>
        </b-form-select>
      </b-col>
    </b-row>
    <b-row>
      <b-col cols="3" class="text-right">
        <small>Netboot Product</small>
      </b-col>
      <b-col :cols="($mq == 'mobile')?8:6">
        <b-form-select
          v-model="newClient.netbootProd"
          :options="netbootProdOptions"
        >
          <template #first>
            <option :value="undefined" />
          </template>
        </b-form-select>
      </b-col>
    </b-row>
    <b-row>
      <b-col cols="3" class="text-right">
        <small>Directory</small>
      </b-col>
      <b-col :cols="($mq == 'mobile')?8:6">
        <!-- <treeselect
          v-model="newClient.clientDirGroupId"
          placeholder=""
          :options="[hostgroupOptions.clientdirectory]"
          :normalizer="normalizer"
          :default-expand-level="1"
          value-format="object"
          value-consists-of="LEAF_PRIORITY"
        >
          <div slot="option-label" slot-scope="{ node }">
            <div v-if="node.isBranch">
              <small> {{ node.label }} </small>
            </div>
          </div>
        </treeselect> -->
      </b-col>
    </b-row>
    <b-row>
      <b-col cols="3" class="text-right">
        <small>Group</small>
      </b-col>
      <b-col :cols="($mq == 'mobile')?8:6">
        <!-- <treeselect
          v-model="newClient.groupsGroupIds"
          placeholder=""
          :options="[hostgroupOptions.groups]"
          :normalizer="normalizer"
          :multiple="true"
          :default-expand-level="1"
          value-format="object"
          value-consists-of="LEAF_PRIORITY"
        >
          <div slot="option-label" slot-scope="{ node }">
            <div v-if="node.isBranch">
              <small> {{ node.label }} </small>
            </div>
          </div>
        </treeselect> -->
      </b-col>
    </b-row>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'
interface NewClient {
  clientNamewithoutDomain: string,
  clientID: string,
  // domainName: ".uib.local",
  description: string,
  inventoryNo: string,
  hardwareAddr: string,
  ipAddr: any,
  notes: string,
  selectedDepot: string,
  configServer: string,
  localbootProd: string,
  // dependencies: [],
  netbootProd: string,
  // groupsGroupIds: [],
  // groupIdsList: []
}

@Component export default class FAddNewClient extends Vue {
  domainName: string = '.uib.local'
  newClient: NewClient = {
    clientNamewithoutDomain: '',
    clientID: '',
    // domainName: ".uib.local",
    description: '',
    inventoryNo: '',
    hardwareAddr: '',
    ipAddr: null,
    notes: '',
    selectedDepot: '',
    configServer: '',
    localbootProd: '',
    // dependencies: [],
    netbootProd: ''
    // groupsGroupIds: [],
    // groupIdsList: []
  }
}
</script>

<style>
</style>
