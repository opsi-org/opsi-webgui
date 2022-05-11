<template>
  <div v-if="config && config.read_only" class="IReadOnly container-fluid" data-testid="IReadOnly"
    :title="$t('label.readonly')"
  >
    <b-iconstack font-scale="1.5">
      <b-icon
        v-for="el in iconnames._stackedIcons.readonly"
        :key="el.icon"
        stacked
        :icon="el.icon"
        :scale="el.scale||'1'"
        v-bind="el.attr"
      />
      <!-- <b-icon stacked icon="camera" variant="info" scale="0.75"></b-icon>
      <b-icon stacked icon="slash-circle" variant="danger"></b-icon> -->
    </b-iconstack>
    <!-- <b-icon class="loading-icon" :icon="iconnames.loading" :animation="animation" :title="$t('message.loading')" /> -->
  </div>
</template>


<script lang="ts">
import { Component, namespace, Prop, Vue } from 'nuxt-property-decorator'
import { IObjectString2Boolean } from '../../.utils/types/tgeneral'
import { Constants } from '../../mixins/uib-mixins'
const config = namespace('config-app')

@Component({ mixins: [Constants] })
export default class ILoading extends Vue {
  iconnames: any
  @Prop({ default: false }) small!: boolean

  @config.Getter public config!: IObjectString2Boolean
}
</script>

<style>
.IReadOnly .text-danger {
  color: var(--danger) !important;
  /* color: #fff !important; */
}
</style>
