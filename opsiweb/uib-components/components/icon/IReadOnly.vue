<template>
  <div
    v-if="config?.read_only"
    data-testid="IReadOnly"
    :title="translatedLabel"
    class="IReadOnly container-fluid"
  >
    <b-iconstack font-scale="1.5">
      <b-icon
        v-for="el in icon._stackedIcons.readonly"
        :key="el.icon"
        stacked
        :icon="el.icon"
        :scale="el.scale || '1'"
        v-bind="el.attr"
      />
    </b-iconstack>
  </div>
</template>

<script lang="ts">
import { Component, namespace, Vue } from 'nuxt-property-decorator'
import { IObjectString2Boolean } from '../../.utils/types/tgeneral'
import { Icons } from '../../mixins/icons'
const config = namespace('config-app')

@Component({ mixins: [Icons] })
export default class ILoading extends Vue {
  icon: any
  $t:any
  @config.Getter public config!: IObjectString2Boolean
  translatedLabel: string = ''
  mounted () {
    this.translatedLabel = this.$t('label.readonly')
  }
}
</script>

<style>
.IReadOnly .text-danger {
  color: var(--danger) !important;
}
</style>
