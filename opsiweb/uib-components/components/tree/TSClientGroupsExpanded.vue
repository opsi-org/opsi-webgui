<template>
  <div class="VGroups" data-testid="VGroups">
    <OverlayOLoading :is-loading="$fetchState.pending" />
    <TreeTSHostGroups :open="true" type="propertyvalues" classes="treeselect_fullpage" />

    <!-- <treeselect
      class="treeselect_notstored treeselect treeselect_fullpage"
      always-open
      :multiple="true"
      :default-expand-level="1"
      :normalizer="normalizer"
      value-format="object"
      :options="group"
    >
      <div slot="option-label" slot-scope="{ node }">
        <div :ref="'hostgroup-item-'+node.id">
          <b-icon v-if="node.isBranch" :icon="icon.group" />
          <b-icon v-else :icon="icon.client" />
          <small> {{ node.label }} </small>
        </div>
      </div>
    </treeselect> -->
    <!-- <div :ref="'hostgroup-item-'+node.id">
          <template v-if="node.isBranch">
            <b-icon :icon="icon.group" />
            <small> {{ node.label }} </small>
          </template>

          <template v-else>
            <b-row>
              <b-col>
                <b-icon :icon="icon.client" />
                <small> {{ node.label }} </small>
              </b-col>
              <b-col class="ml-auto">
                <ButtonBTNRowLinkTo
                  :title="$t('title.log')"
                  :label="$t('title.log')"
                  :icon="icon.log"
                  to="/clients/log"
                  :ident="node.label"
                  :pressed="isRouteActive"
                  :click="routeRedirectWith"
                />
              </b-col>
            </b-row>
          </template>
        </div> -->
  </div>
</template>

<script lang="ts">
import { Component, namespace, Watch, Prop, Vue } from 'nuxt-property-decorator'
import { Icons } from '../../mixins/icons'
const selections = namespace('selections')
@Component({ mixins: [Icons] })
export default class VGroups extends Vue {
  icon: any
  $axios: any
  node: any
  $fetch: any
  $t: any
  group: Array<object> = []
  routeRedirect: boolean = false

  @Prop({ }) rowId!: string

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
  }

  async fetchGroups () {
    const result = await this.$axios.$get(`/api/opsidata/hosts/groups?selectedDepots=[${this.selectionDepots}]`)
    this.group = Object.values(result)
  }

  isRouteActive (to: string, rowIdent: string) {
    return this.$route.path.includes(to) && this.rowId === rowIdent
  }

  routeRedirectWith (to: string, rowIdent: string) {
    if (this.isRouteActive(to, rowIdent)) {
      const parent = to.substring(0, to.lastIndexOf('/'))
      this.$router.push(parent)
      this.routeRedirect = false
    } else {
      this.$emit('update:rowIdent', rowIdent)
      // this.rowId = rowIdent
      this.$router.push(to)
      this.routeRedirect = true
    }
  }
}
</script>
<style>
.VGroups {
  width: 98% ;
  height: 80vh;
}
</style>
