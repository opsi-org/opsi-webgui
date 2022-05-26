<template>
  <div data-testid="IDetails" :class="'IDetails ' + content">
    <b-badge
      v-bind="$props"
      :variant="variant"
    >
      <span v-if="content=='depot-unequal'" class="h6">
        {{ '&ne;' }} <b-icon :icon="iconnames.depot" />
      </span>
      <span v-else-if="content=='depot-wo-prod'" class="h6">
        * <b-icon :icon="iconnames.depot" />
      </span>
      <span v-else-if="content=='client-outdated'" class="h6">
        {{ '&ne;' }} <b-icon :icon="iconnames.client" />
      </span>
      <span v-else-if="content=='ppv-client-different'" class="h6">
        {{ '&ne;' }} <b-icon :icon="iconnames.client" />
      </span>
      <span v-else-if="content=='ppid-not-exists-on-depot'" class="h6">
        {{ '&ne;' }} <b-icon :icon="iconnames.depot" />
      </span>
      <span v-else class="h6">{{ content==='unequal'? '&ne;':content }} </span>
    </b-badge>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'
import { Constants } from '../../mixins/uib-mixins'

@Component({ mixins: [Constants] })
export default class IDetails extends Vue {
  iconnames:any
  @Prop({ default: '*' }) content?: string
  @Prop({ default: 'warning' }) variant?: string
}
</script>
