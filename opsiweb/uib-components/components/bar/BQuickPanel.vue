<template>
  <b-sidebar
    id="quickpanel"
    right
    :visible="showQuickPanel"
    no-header
    :backdrop="$mq == 'mobile'"
    :bg-variant="$mq == 'mobile'? 'primary' : 'sidebar-bg'"
    :text-variant="$mq == 'mobile'? 'color' : 'sidebar-text'"
    shadow
    no-close-on-route-change
    @hidden="showQuickPanel = false"
  >
    <b-container>
      <b-row class="text-smaller mt-2 mb-2">
        <b>{{ $t('Quick Selections') }} </b>
      </b-row>
      <ViewVQuickSelections />
      <b-row class="text-smaller mt-2 mb-2">
        <b>{{ $t('Quick Actions') }} </b>
      </b-row>
      <b-row>
        <b-col> <ButtonBTNEvent event="ondemand" :with-text="true" classes="outline-primary border" /> </b-col>
        <b-col> <ModalMProductActions :label="'label.prodquickaction'" /> </b-col>
      </b-row>
      <b-row class="text-smaller mt-2 mb-2">
        <b>{{ $t('Settings') }} </b>
      </b-row>
      <b-row>
        <b-col> <DropdownDDLang v-once /> </b-col>
        <b-col> <DropdownDDTheme v-once /> </b-col>
        <b-col cols="6">
          <CheckboxCBQuickSave />
        </b-col>
      </b-row>
    </b-container>
    <template #footer>
      <div class="text-center p-3">
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
