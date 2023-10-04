<template>
  <b-sidebar
    id="quickpanel"
    data-testid="BarBQuickPanel"
    right
    :visible="showQuickPanel"
    no-header
    :backdrop="$mq == 'mobile'"
    bg-variant="background"
    text-variant="color"
    shadow
    no-close-on-route-change
    @hidden="$emit('change', false)"
  >
    <b-card class="quickpanel_container">
      <b-row class="text-smaller mt-2 mb-2">
        <b>{{ $t('label.quickselect') }}
          <ButtonBTNSmallRow
            v-if="selectionDepots.length > 0"
            :title="$t('button.resetAll')"
            show-reset
            @click="setSelectionDepots([opsiconfigserver])"
          />
        </b>
      </b-row>
      <TabsTQuickSelections />
      <b-row class="text-smaller mt-2 mb-2">
        <b>{{ $t('label.quickaction') }} </b>
      </b-row>
      <b-row>
        <b-col> <ButtonBTNEvent event="ondemand" :with-text="true" classes="outline-primary border" /> </b-col>
        <b-col> <LazyModalMProductActions v-if="showQuickPanel" :label="'label.prodquickaction'" /> </b-col>
      </b-row>
      <b-row class="text-smaller mt-2 mb-2">
        <b>{{ $t('title.settings') }} </b>
      </b-row>
      <b-row>
        <b-col> <CheckboxCBQuickSave /> </b-col>
        <b-col> <CheckboxCBMultiselection /> </b-col>
      </b-row>
    </b-card>
    <template #footer>
      <b-card class="p-0">
        <b-row>
          <b-col> <DropdownDDLang v-once /> </b-col>
          <b-col> <DropdownDDTheme v-once /> </b-col>
          <b-col cols="6"> <ButtonBTNLogout v-once /> </b-col>
        </b-row>
      </b-card>
    </template>
  </b-sidebar>
</template>

<script lang="ts">
import { Component, namespace, Prop, Vue } from 'nuxt-property-decorator'
import { Icons } from '../../mixins/icons'
const cache = namespace('data-cache')
const selections = namespace('selections')

@Component({ mixins: [Icons] })
export default class BQuickPanel extends Vue {
  $mq: any
  icon:any
  @Prop({ default: false }) showQuickPanel!: boolean
  @cache.Getter public opsiconfigserver!: string
  @selections.Getter public selectionDepots!: Array<string>
  @selections.Mutation public setSelectionDepots!: (s: Array<string>) => void
}
</script>

<style>
.quickpanel_container {
  height: 100% !important;
}
#quickpanel {
  top: calc(var(--height-navbar) - 2px) !important;
  width: 400px;
  height: 100% !important;
}
#quickpanel .b-sidebar-footer {
  margin-bottom: 70px;
}
</style>
