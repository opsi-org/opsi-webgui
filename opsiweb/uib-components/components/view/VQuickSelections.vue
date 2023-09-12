<template>
  <b-tabs justified small lazy class="QPTabs">
    <b-tab id="qp-tab-selection">
      <template #title>
        <b-icon :icon="icon.info" :title="$t('title.viewselection')" />
      </template>
      <div class="scrollcontent">
        <GridGFormItem :label="$t('title.depots')" variant="longlabel">
          <template #value>
            <b-form-textarea
              v-if="selectionDepots.length>0"
              rows="1"
              max-rows="10"
              size="sm"
              no-resize
              plaintext
              :value="[...selectionDepots].sort().join('\n')"
            />
            <span v-else>{{ $t('empty') }}</span>
          </template>
        </GridGFormItem>
        <GridGFormItem :label="$t('title.clients')" variant="longlabel" labelclass="clients">
          <template #value>
            <b-form-textarea
              v-if="selectionClients.length>0"
              rows="1"
              max-rows="10"
              size="sm"
              no-resize
              plaintext
              :value="[...selectionClients].sort().join('\n')"
            />
            <span v-else>{{ $t('empty') }}</span>
          </template>
        </GridGFormItem>
        <GridGFormItem :label="$t('title.products')" variant="longlabel" labelclass="products">
          <template #value>
            <b-form-textarea
              v-if="selectionProducts.length>0"
              rows="1"
              max-rows="10"
              size="sm"
              no-resize
              plaintext
              :value="[...selectionProducts].sort().join('\n')"
            />
            <span v-else>{{ $t('empty') }}</span>
          </template>
        </GridGFormItem>
      </div>
    </b-tab>
    <b-tab id="qp-tab-depots">
      <template #title>
        <b-icon :icon="icon.server" :title="$t('title.depots')" /> {{ selectionDepots.length }}
      </template>
      <div class="scrollcontent">
        <TreeTSDepots :open="true" type="propertyvalues" classes="treeselect_quickpanel" />
      </div>
    </b-tab>
    <b-tab id="qp-tab-clients" active>
      <template #title>
        <b-icon :icon="icon.client" :title="$t('treeselect.clientGroups')" /><b-icon :icon="icon.group" font-scale="0.7" /> {{ selectionClients.length }}
      </template>
      <div class="scrollcontent">
        <TreeTSHostGroups :open="true" type="propertyvalues" classes="treeselect_quickpanel" />
      </div>
    </b-tab>
    <b-tab id="qp-tab-products">
      <template #title>
        <b-icon :icon="icon.product" :title="$t('treeselect.prodGroups')" /><b-icon :icon="icon.group" font-scale="0.7" /> {{ selectionProducts.length }}
      </template>
      <div class="scrollcontent">
        <TreeTSProductGroups :open="true" type="propertyvalues" classes="treeselect_quickpanel" />
      </div>
    </b-tab>
  </b-tabs>
</template>

<script lang="ts">
import { Component, namespace, Vue } from 'nuxt-property-decorator'
import { Icons } from '../../mixins/icons'
const selections = namespace('selections')

@Component({ mixins: [Icons] })
export default class VQuickSelections extends Vue {
  icon:any
  $mq:any

  @selections.Getter public selectionDepots!: Array<string>
  @selections.Getter public selectionClients!: Array<string>
  @selections.Getter public selectionProducts!: Array<string>
}
</script>
<style>
.QPTabs .nav-tabs .nav-link{
  color:var(--color);
  background-color:var(--background);
  border:1px solid var(--border);
  padding:0.2rem;
}
.QPTabs .nav-tabs .nav-link:hover{
  color: var(--color);
  background-color: var(--highlight);
  border:1px solid var(--border);
}
.QPTabs .nav-tabs .nav-link.active{
  color: var(--color);
  background-color: var(--highlight);
  border:1px solid var(--border);
}
</style>
