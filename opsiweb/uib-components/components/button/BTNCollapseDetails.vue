<template>
  <div
    data-testid="ButtonBTNCollapseDetails"
  >
    <b-button v-b-toggle.collapse-1 :variant="variant">{{ buttonText }}</b-button>
    <b-collapse id="collapse-1">
      <p >{{ details }}</p>
    </b-collapse>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'
import { Icons } from '../../mixins/icons'

@Component({ mixins: [Icons] })
export default class BTNCollapseDetails extends Vue {
  @Prop({ default: 'buttonText' }) buttonText?: string
  @Prop({ default: 'details' }) details?: string
  @Prop({ default: 'primary' }) variant?: string
}
</script>
