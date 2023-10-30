<template>
  <b-button
    ref="btn-logout"
    v-bind="props"
    data-testid="ButtonBTNLogout"
    :title="$t('button.logout')"
    size="sm"
    block
    variant="outline-primary"
    @click="doLogout"
  >
    <IconIIcon :icon="icon.logout" />
    {{ $t('button.logout') }}
  </b-button>
</template>

<script setup lang="js">
import { useIcons } from '@/composables/mixins/useIcons'
import { useNotification } from '~/composables/mixins/useNotification'
// import { Component, Prop, Vue } from 'nuxt-property-decorator'
// import { CallLogout } from '../../mixins/post'
// import { Icons } from '../../mixins/icons'
// const mq = useMQ()
const icon = useIcons()
const notificationSuccess = useNotification().success
const notificationError = useNotification().error

const authStore = useAuthStore()
// @Component({ mixins: [Icons, CallLogout] })
// export default class BTNLogout extends Vue {
  // @Prop({ default: false }) abortClick!: boolean
  const props = defineProps({
    abortClick: { type: Boolean, default: false}
  })
  // callLogout: any
  // icon: any
  // $axios:any
  // $mq: any

  async function doLogout () {
    if (props.abortClick) { return }
    // await this.callLogout()

    const { data, error } = await useAPI('/auth/logout').post().json()
    if (error.value) {
      console.log("error", error.value)
      notificationError(error.value, 'error'); return
    }
    notificationSuccess('ok')

    // TODO wsDisconnect()
    authStore.logout()
    authStore.clearSession()
    // authStore.setExpiresInterval(undefined)
    // fetchResult.value = data;

    if (useRoute().name !== 'login') {
      await useRouter().push({ path: '/login' })
    }
    // TODO clearAllSelection()
  }
// }
</script>
