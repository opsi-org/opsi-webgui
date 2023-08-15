<template>
  <b-sidebar
    id="quickpanel"
    right
    :visible="showQuickPanel"
    no-header
    :backdrop="$mq == 'mobile'"
    :bg-variant="$mq == 'mobile'? 'primary' : 'sidebar-bg'"
    :text-variant="$mq == 'mobile'? 'color' : 'sidebar-text'"
    no-close-on-route-change
    @hidden="showQuickPanel = false"
  >
    <b-container>
      <b-row class="text-smaller mt-2 mb-2">
        <b>{{ $t('Quick Selections') }} </b>
      </b-row>
      <ModalMSelectionsAll :with-text="true" />
      <b-button v-b-toggle.depots block class="text-left border-0" variant="outline-primary">
        {{ $t('Servers') }} <b-icon class="float-right" font-scale="0.9" :icon="icon.arrowFillDown" />
      </b-button>
      <b-collapse id="depots" accordion="quickpanelgroups" role="tabpanel">
        <div class="scrollcontent">
          <TreeTSDepots :open="true" type="propertyvalues" classes="treeselect_quickpanel" />
        </div>
      </b-collapse>
      <b-button v-b-toggle.clientgroup block class="text-left border-0" variant="outline-primary">
        {{ $t('Client Groups') }} <b-icon class="float-right" font-scale="0.9" :icon="icon.arrowFillDown" />
      </b-button>
      <b-collapse id="clientgroup" accordion="quickpanelgroups" role="tabpanel">
        <div class="scrollcontent">
          <TreeTSHostGroups :open="true" type="propertyvalues" classes="treeselect_quickpanel" />
        </div>
      </b-collapse>
      <b-button v-b-toggle.productgroup block class="text-left border-0" variant="outline-primary">
        {{ $t('Product Groups') }} <b-icon class="float-right" font-scale="0.9" :icon="icon.arrowFillDown" />
      </b-button>
      <b-collapse id="productgroup" accordion="quickpanelgroups" role="tabpanel">
        <div class="scrollcontent">
          <TreeTSProductGroups :open="true" type="propertyvalues" classes="treeselect_quickpanel" />
        </div>
      </b-collapse>
      <b-row class="text-smaller mt-2 mb-2">
        <b>{{ $t('Quick Actions') }} </b>
      </b-row>
      <b-row>
        <b-col>
          <ButtonBTNEvent event="ondemand" :with-text="true" classes="outline-primary border" />
        </b-col>
        <b-col>
          <ModalMProductActions :label="'label.prodquickaction'" />
        </b-col>
      </b-row>
      <b-row class="text-smaller mt-2 mb-2">
        <b>{{ $t('Settings') }} </b>
      </b-row>
      <ViewVQuickSettings />
    </b-container>
    <template #footer>
      <div class="text-center">
        <ButtonBTNLogout v-once />
      </div>
    </template>
  </b-sidebar>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'
import { Icons } from '../../mixins/icons'

@Component({ mixins: [Icons] })
export default class BQuickPanel extends Vue {
  $mq: any
  icon:any
  @Prop({ default: false }) showQuickPanel!: boolean
}
</script>

<style>
#quickpanel {
  top: calc(var(--height-navbar) - 2px) !important;
  width: 400px;
  height: 100% !important;
}
#quickpanel .b-sidebar-footer {
  margin-bottom: 70px;
}
.sidebar-bg {
  background-color: var(--background) !important;
}
.sidebar-text{
  color: var(--color) !important;
}
</style>
