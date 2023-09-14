<template>
  <b-sidebar
    id="quickpanel"
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
        <b>{{ $t('label.quickselect') }} </b>
      </b-row>
      <ViewVQuickSelections />
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
        <b-col> <DropdownDDLang v-once /> </b-col>
        <b-col> <DropdownDDTheme v-once /> </b-col>
        <b-col cols="6">
          <CheckboxCBQuickSave />
        </b-col>
      </b-row>
    </b-card>
    <template #footer>
      <b-card class="text-center p-3">
        <ButtonBTNLogout v-once />
      </b-card>
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
