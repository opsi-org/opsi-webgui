<template>
  <span variant="primary">
    <label for="expiredAfterMinutesChanger"> {{ $t('input.expiredTimeChanger', {min: expiresInMin}) }} </label>
    <b-form-input
      id="expiredAfterMinutesChanger"
      v-model="expiresInMin"
      type="range"
      min="1"
      :max="60"
      step="1"
    />
  </span>
</template>

<script lang="ts">
import { Component, namespace, Watch, Vue } from 'nuxt-property-decorator'

const auth = namespace('auth')

@Component
export default class IExpiredTimeChanger extends Vue {
  expiresInMin: number = 1

  @auth.Getter public sessionExpiry!: number
  @auth.Mutation public setExpiredMin!: (number) => void
  @auth.Mutation public setSession!: () => void

  @Watch('expiresInMin', { deep: true }) intervalChanged () {
    this.setExpiredMin(this.expiresInMin * 60)
    this.setSession()
  }

  mounted () {
    this.expiresInMin = this.sessionExpiry / 60
  }
}
</script>

<style>
</style>
