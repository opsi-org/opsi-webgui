<template>
  <div data-testid="CardCSupport">
    <b-card>
      <h5 class="text-center text-color">
        {{ $t(item.title) }}
      </h5>
      <div>
        {{ $t(item.description) }}
      </div>
      <a class="btn btn-outline-primary border-0 btn-block" :href="item.link" target="_blank">{{ $t(item.buttonname) }}</a>
    </b-card>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'

@Component
export default class CSupport extends Vue {
  @Prop({ }) item!: any
  $mq: any
}
</script>
