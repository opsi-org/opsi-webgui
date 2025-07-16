<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
-->
<template>
  <el-popconfirm
    :title="$t('message.logoutConfirmation')"
    :confirm-button-text="$t('confirm')"
    :cancel-button-text="$t('cancel')"
    @confirm="doLogout"
    data-testid="BTNLogout"
  >
    <template #reference>
      <el-button
        :title="$t('logout')"
        class="!border-none"
        :class="{
          'min-h-full': true,
          [btnClass]: true,
        }"
      >
        <IconIIcon :icon="icon.logout" />
      </el-button>
    </template>
  </el-popconfirm>
</template>

<script setup lang="ts">
  import { useNotification } from '../../composables/mixins/useComponent'
  import { useMBus } from '~/composables/mixins/useMessagebus'
  import type { T_Logout } from '~/types/APItypes'
  const isMobile = ref(useMQ().isMobile.value)
  watch(
    () => useMQ().isMobile,
    () => {
      isMobile.value = useMQ().isMobile.value
    }
  )
  const icon = useIcons()
  const $t = useI18n().t
  const { notifyError } = useNotification()

  const authStore = storeAuth() // autho imported
  const props = defineProps({
    abortClick: { type: Boolean, default: false },
    isMenuItem: { type: Boolean, default: false },
    btnClass: { type: String, default: 'min-w-14 w-14' },
  })

  async function doLogout() {
    if (props.abortClick) {
      return
    }

    const { error } = await useApiPOSTkwargs<T_Logout>('/auth/logout', {
      showError: false,
    })
    if (
      error?.response.data.message === 'Unauthorized' /* xxx */ ||
      error?.response.data.message === 'Method Not Allowed' /*405*/
    ) {
      // pass, cause already logged out
    } else if (error) {
      notifyError({ message: error?.response?.data?.message })
      return
    }

    useMBus(undefined, false, $t).wsDisconnect()
    authStore.logout()
    authStore.clearSession()
    // TODO clearAllSelection()
  }
</script>
