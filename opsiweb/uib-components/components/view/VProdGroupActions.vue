<template>
  <div class="VGroups" data-testid="VGroups">
    <OverlayOLoading :is-loading="$fetchState.pending" />
    <AlertAAlert ref="groupAlert" data-testid="groupAlert" />
    <b-button
      class="border-0 ml-auto"
      variant="outline-primary"
      size="sm"
      :title="$t('group.addSubgroup')"
      block
      @click="$bvModal.show('MCreateProdGroup')"
    >
      <IconIIcon :icon="icon.group" /><IconIIcon :icon="icon.add" font-scale="0.8" /> {{ $t('group.addProdgroup') }}
    </b-button>
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
                <!-- <b-button
                  class="border-0"
                  variant="outline-primary"
                  size="sm"
                  :title="$t('group.editGroup')"
                  @click="showChild('editGroup')"
                >
                  <IconIIcon :icon="icon.pencil" />
                </b-button> -->
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
                </b-button>
              </div>
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
      <b-modal
        id="MCreateProdGroup"
        data-testid="MCreateProdGroup"
        :title="$t('group.addProdgroup')"
        centered
        scrollable
        hide-footer
      >
        <b-form>
          <b-form-input
            v-model="subgroup.groupId"
            size="sm"
            trim
            :placeholder="$t('group.prodgroupname')"
            :state="subgroup.groupId.length > 0 && subgroup.groupId.length < 255"
            @keydown.enter.prevent="checkGroupIdAndCreateSubGroup"
          />
          <b-form-input
            v-model="subgroup.description"
            size="sm"
            trim
            :placeholder="$t('table.fields.description')"
            :state="subgroup.description.length >= 0 && subgroup.description.length < 100"
            @keydown.enter.prevent="checkGroupIdAndCreateSubGroup"
          />
          <b-form-input
            v-model="subgroup.notes"
            size="sm"
            trim
            :placeholder="$t('table.fields.notes')"
            :state="subgroup.notes.length >= 0 && subgroup.notes.length < 500"
            @keydown.enter.prevent="checkGroupIdAndCreateSubGroup"
          />
          <b-button class="float-right" size="sm" variant="success" data-testid="createSubGroup" @click="createSubGroup">
            {{ $t("button.create") }}
          </b-button>
        </b-form>
      </b-modal>
      <b-col v-if="action && selectedvalue">
        <span class="text-small"><b> {{ title + t_fixed('keep-english.title.delimiter') }}</b><i>{{ selectedvalue.text }}</i></span>
        <b-button class="float-right border-0" variant="outline-primary" size="sm" @click="action = ''">
          <IconIIcon :icon="icon.x" />
        </b-button>
        <br><br>
        <template v-if="action == 'addToGroup'">
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
        <!-- <template v-else-if="action == 'editGroup'">
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
        </template> -->
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
  </div>
</template>

<script lang="ts">
import { Component, namespace, Vue } from 'nuxt-property-decorator'
import { Icons } from '../../mixins/icons'
import { Client } from '../../mixins/get'
import { Group } from '../../mixins/post'
import { Strings } from '../../mixins/strings'
import { AlertToast } from '../../mixins/component'
const selections = namespace('selections')
@Component({ mixins: [Icons, Client, Group, AlertToast, Strings] })
export default class VGroups extends Vue {
  showToastSuccess: any // from mixin AlertToast
  showToastError: any // from mixin AlertToast
  icon:any
  t_fixed: any
  $t:any
  $axios: any
  node: any
  action: string = ''
  title: string = ''
  productIds: Array<string> = []
  selectedProducts: Array<string> = []
  group: Array<object>|undefined = undefined
  // updategroupparent: any = null
  selectedvalue: any = null
  subgroup: any = {
    parentGroupId: '',
    groupId: '',
    description: '',
    notes: ''
  }

  // updategroup = {
  //   parent: '',
  //   description: '',
  //   notes: ''
  // }

  @selections.Getter public selectionDepots!: Array<string>

  normalizer (node: any) {
    if (node.children) {
      return {
        id: node.id,
        label: node.text,
        children: node.children ? Object.values(node.children) : {}
      }
    }
    return {
      id: node.id,
      label: node.text,
      children: node.type === 'ProductGroup' ? [] : undefined
    }
  }

  // normalizerUpdateGroup (node: any) {
  //   return {
  //     id: node.id,
  //     label: node.text,
  //     isDisabled: node.type === 'ObjectToGroup',
  //     children: node.children ? Object.values(node.children) : {}
  //   }
  // }

  async fetch () {
    await this.fetchGroups()
    await this.fetchProducts()
  }

  async reloadGroup () {
    this.action = ''
    await this.fetchGroups()
    this.selectedvalue = null
  }

  async fetchProducts () {
    await this.$axios.$get(`/api/opsidata/depots/products?productType=LocalbootProduct&selectedDepots=${this.selectionDepots}`)
      .then((response) => {
        this.productIds = response.map(function (item: { productId: string }) {
          return item.productId
        })
      }).catch((error) => {
        this.showToastError(error)
      })
  }

  async fetchGroups () {
    this.group = undefined
    const result = await this.$axios.$get('/api/opsidata/products/groups')
    this.group = Object.values(result?.groups)
  }

  showChild (selectedAction: string) {
    this.action = selectedAction
    const groupaction = 'group.' + this.action
    this.title = this.$t(groupaction)
  }

  checkGroupIdAndCreateSubGroup () {
    if (this.subgroup.groupId.length > 0) {
      this.createSubGroup()
    }
  }

  async createSubGroup () {
    // this.subgroup.parentGroupId = this.selectedvalue.text
    await this.$axios.$post('/api/opsidata/products/groups', this.subgroup)
      .then(async () => {
        this.showToastSuccess(this.$t('message.success.save.create.group', { group: this.subgroup.groupId }))
        await this.reloadGroup()
        this.$bvModal.hide('MCreateProdGroup')
      })
      .catch((error) => {
        this.showToastError(error)
      })
  }

  // async updateGroup () {
  //   this.updategroup.parent = this.updategroupparent ? this.updategroupparent.text : ''
  //   await this.$axios.$put(`/api/opsidata/products/groups/${this.selectedvalue.text}`, this.updategroup)
  //     .then(async () => {
  //       this.showToastSuccess(this.$t('message.success.save.update.group', { group: this.selectedvalue.text }))
  //       await this.reloadGroup()
  //     })
  //     .catch((error) => {
  //       this.showToastError(error)
  //     })
  // }

  async addProducts () {
    await this.$axios.$post(`/api/opsidata/products/groups/${this.selectedvalue.text}/products`, this.selectedProducts)
      .then(async () => {
        this.showToastSuccess(this.$t('message.success.save.add.clientfromgroups', { group: this.selectedvalue.text }))
        await this.reloadGroup()
      })
      .catch((error) => {
        this.showToastError(error)
      })
  }

  async deleteGroup () {
    await this.$axios.$get(`/api/opsidata/products/groups/${this.selectedvalue.text}`)
      .then(async () => {
        this.showToastSuccess(this.$t('message.success.save.delete.group', { group: this.selectedvalue.text }))
        await this.reloadGroup()
      })
      .catch((error) => {
        this.showToastError(error)
      })
  }

  async removeAllProducts () {
    await this.$axios.$delete(`/api/opsidata/products/groups/${this.selectedvalue.text}/products`)
      .then(async () => {
        this.showToastSuccess(this.$t('message.success.save.delete.clientsfromgroup', { group: this.selectedvalue.text }))
        await this.reloadGroup()
      })
      .catch((error) => {
        this.showToastError(error)
      })
  }

  async removeSelectedProduct () {
    const group = this.selectedvalue.parent
    await this.$axios.$delete(`/api/opsidata/products/groups/${group}/${this.selectedvalue.text}`)
      .then(async () => {
        this.showToastSuccess(this.$t('message.success.save.delete.clientfromgroups', { client: this.selectedvalue.text }))
        await this.reloadGroup()
      })
      .catch((error) => {
        this.showToastError(error)
      })
  }
}
</script>
<style>
.groupstabs .tab-content {
  height: 82vh;
  margin: 10px;
}
</style>
