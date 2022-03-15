<template>
  <div data-testid="IDetails">
    <b-badge
      v-bind="$props"
      :variant="variant"
    >
      <span class="badgecontent">{{ content==='unequal'? '&ne;':content }} </span>
    </b-badge>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'

@Component
export default class IDetails extends Vue {
  @Prop({ default: '*' }) content?: string
  @Prop({ default: 'warning' }) variant?: string
}
</script>

<style>
.badgecontent{
  color: black;
}
</style>
