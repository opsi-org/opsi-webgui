<template>
  <b-tabs justified small lazy data-testid="TQuickSelections" class="QPTabs">
    <b-tab id="qp-tab-selection" active>
      <template #title>
        <b-icon :icon="icon.info" :title="$t('title.viewselection')" />
      </template>
      <div class="scrollcontent">
        <GridGFormItem variant="longvalue">
          <template #label>
            <p>{{ $t('title.depots') }}</p>
          </template>
          <template #value>
            <b-list-group v-if="selectionDepots.length>0" flush>
              <b-list-group-item v-for="c in [...selectionDepots].sort()" :key="c" class="modal-client-p text-small">
                {{ c }}
                <ButtonBTNSmallRow
                  v-if="selectionDepots.length > 1"
                  :title="$t('button.deselect')"
                  show-close
                  @click="delFromSelectionDepots(c)"
                />
              </b-list-group-item>
            </b-list-group>
            <span v-else>{{ $t('keep-english.empty') }}</span>
          </template>
        </GridGFormItem>
        <GridGFormItem variant="longvalue" labelclass="clients">
          <template #label>
            <ButtonBTNSmallRow
              v-if="selectionClients.length > 0"
              :title="$t('button.deselect')"
              show-close
              @click="setSelectionClients([])"
            />
            <p>{{ $t('title.clients') }}</p>
          </template>
          <template #value>
            <b-list-group v-if="selectionClients.length>0" flush>
              <b-list-group-item v-for="c in [...selectionClients].sort()" :key="c" class="modal-client-p text-small">
                {{ c }}
                <ButtonBTNSmallRow
                  v-if="selectionClients.length > 0"
                  :title="$t('button.deselect')"
                  show-close
                  @click="delFromSelectionClients(c)"
                />
              </b-list-group-item>
            </b-list-group>
            <span v-else>{{ $t('keep-english.empty') }}</span>
          </template>
        </GridGFormItem>
        <GridGFormItem variant="longvalue" labelclass="products">
          <template #label>
            <ButtonBTNSmallRow
              v-if="selectionProducts.length > 0"
              :title="$t('button.deselect')"
              show-close
              @click="setSelectionProducts([])"
            />
            <p>{{ $t('title.products') }}</p>
          </template>
          <template #value>
            <b-list-group v-if="selectionProducts.length>0" flush>
              <b-list-group-item v-for="c in [...selectionProducts].sort()" :key="c" class="modal-client-p text-small">
                {{ c }}
                <ButtonBTNSmallRow
                  v-if="selectionProducts.length > 0"
                  :title="$t('button.deselect')"
                  show-close
                  @click="delFromSelectionProducts(c)"
                />
              </b-list-group-item>
            </b-list-group>
            <span v-else>{{ $t('keep-english.empty') }}</span>
          </template>
        </GridGFormItem>
      </div>
    </b-tab>
    <b-tab id="qp-tab-depots">
      <template #title>
        <b-icon :icon="icon.server" :title="$t('title.depots')" /> {{ selectionDepots.length }}
      </template>
      <div class="scrollcontent">
        <TreeTSDepots :open="true" type="propertyvalues" :multi="multiSelection" classes="treeselect_quickpanel" />
      </div>
    </b-tab>
    <b-tab id="qp-tab-clients">
      <template #title>
        <b-icon :icon="icon.client" :title="$t('treeselect.clientGroups')" /><b-icon :icon="icon.group" font-scale="0.7" /> {{ selectionClients.length }}
      </template>
      <div class="scrollcontent">
        <TreeTSHostGroups :open="true" :multi="multiSelection" type="propertyvalues" classes="treeselect_quickpanel" />
      </div>
    </b-tab>
    <b-tab id="qp-tab-products">
      <template #title>
        <b-icon :icon="icon.product" :title="$t('treeselect.prodGroups')" /><b-icon :icon="icon.group" font-scale="0.7" /> {{ selectionProducts.length }}
      </template>
      <div class="scrollcontent">
        <TreeTSProductGroups :open="true" type="propertyvalues" :multi="multiSelection" classes="treeselect_quickpanel" />
      </div>
    </b-tab>
  </b-tabs>
</template>

<script lang="ts">
import { Component, namespace, Vue } from 'nuxt-property-decorator'
import { Icons } from '../../mixins/icons'
const selections = namespace('selections')

@Component({ mixins: [Icons] })
export default class TQuickSelections extends Vue {
  icon:any
  $mq:any
  @selections.Getter public multiSelection!: Array<string>
  @selections.Getter public selectionDepots!: Array<string>
  @selections.Getter public selectionClients!: Array<string>
  @selections.Getter public selectionProducts!: Array<string>
  @selections.Mutation public delFromSelectionDepots!: (s: string) => void
  @selections.Mutation public delFromSelectionClients!: (s: string) => void
  @selections.Mutation public delFromSelectionProducts!: (s: string) => void
  @selections.Mutation public setSelectionDepots!: (s: Array<string>) => void
  @selections.Mutation public setSelectionClients!: (s: Array<string>) => void
  @selections.Mutation public setSelectionProducts!: (s: Array<string>) => void
}
</script>
<style>
.QPTabs .scrollcontent {
  max-height: 500px !important;
  /* max-height: 50% !important; */
}
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

.QPTabs #qp-tab-selection .GFormItem .firstcol {
  min-width: 110px !important;
}
</style>
