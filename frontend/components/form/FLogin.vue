<template>

  <div role="main" data-testid="FLogin">
    <h1 class="sr-only">
      {{ $t('button.login') }}
    </h1>
    <el-card
        class="text-center bg-primary mx-auto"
        :class="mq.$mq === 'mobile'? 'w-full;' : 'w-1/2; max-w-md' "
    >
      <IconIOpsiLogo :light="false" :short="false" class="mb-2" classes="w-full" />
      <div @keyup.enter="doLogin">
        <el-form class="mt-1">
          <el-form-item class="mb-1">
            <el-input
              id="configserver"
              data-testid="login_configserver"
              v-model="opsiconfigserver"
              :aria-label="$t('title.configserver')"
              disabled
              readonly
              size="small"
              class="mb-2"
              :placeholder="opsiconfigserver"
            />
          </el-form-item>
          <el-form-item class="mb-1">
            <el-input
              id="username"
              v-model="form.username"
              :disabled="isLoading"
              data-testid="login_username"
              :aria-label="$t('form.username')"
              :placeholder="$t('form.username')"
              :state="validUsername"
              size="small"
              class="mb-2 username"
            />
          </el-form-item>
          <el-form-item class="mb-1">
              <el-input
                id="password"
                v-model="form.password"
                :disabled="isLoading"
                data-testid="login_password"
                :aria-label="$t('form.password')"
                :placeholder="$t('form.password')"
                :state="validPassword"
                :type="showPassword? 'text': 'password'"
                size="small"
                class="mb-2 password"
              >

              <template #append>
                <el-button @click="toggleShowPassword" type="primary" class="pr-2"
                style="--el-button-border-color: var(--el-text-color-regular);"
                :disabled="isLoading">
                  <span class="sr-only">{{ showPassword? $t('form.password.hide'): $t('form.password.show') }}</span>
                  <IconIIcon :icon="showPassword ? icon.valueShow : icon.valueHide" />
                </el-button>
              </template>
            </el-input>
          </el-form-item>

          <IconILoading v-if="isLoading"> </IconILoading>
          <el-button
            v-else
            data-testid="btn-login"
            type="primary"
            class="mt-2 login"
            block
            style="--el-button-border-color: var(--el-text-color-regular);"
            @click="doLogin"
          >
            {{ $t('button.login') }}
          </el-button>
        </el-form>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { useIcons } from "../../composables/mixins/useIcons"
import { useNotification } from "../../composables/mixins/useComponent"
import { useConfigserver } from '@/composables/mixins/useGet'
const notificationSuccess = useNotification().success
const notificationError = useNotification().error

const config = useRuntimeConfig()
const mq = useMQ()
const icon = useIcons()

const form = ref({ username: '', password: '' })
const showPassword = ref(false)

const opsiconfigserver = ref('');

onMounted( async () => {
  const useServerGet = await useConfigserver(true)
  opsiconfigserver.value = await useServerGet.getOpsiConfigServer()
})


const validUsername = computed({
  get:  () => (form.username !== '') ?  null : false
})
const validPassword = computed({
  get:  () => (form.password !== '') ?  null : false
})

function toggleShowPassword () {
  showPassword.value = !showPassword.value
}

const isLoading = ref(false)
async function doLogin () {
  if (!validUsername || !validPassword) return
  isLoading.value = true
  const User = new FormData()
  User.append('username', form.value.username)
  User.append('password', form.value.password)

  const { data, error } = await useApiPOST('/auth/login', User)
  if (error) {
    notificationError(error)
    isLoading.value = false
    return
  }
  if (data?.value?.result == 'Login success') {
    notificationSuccess('Successfull. Redirect to clients')
    console.log("login successful")
    storeAuth().login(form.value.username)
    storeAuth().setSession()
    if (useRoute().name === 'login') {
      useRouter().push({ path: config.public.BASE_PAGE })
    } else {
      useRouter().back()
    }
    isLoading.value = false
  }

  // body not readable if error is 403...
  // const errordata = { response: { data: {class: 'AuthenticationError', message: error.value}} }
}
</script>

<style scoped>

:deep(.el-input-group__append) {
  --el-fill-color-light: transparent;
  --el-color-info: var(--el-input-text-color);
}

.ILoading {
  --el-input-text-color: #E1E1E1;
  color: var(--el-input-text-color);
}
.el-input.is-disabled {
  --el-input-text-color: #E1E1E1;
  background-color: var(--el-input-text-color);
  /* color: var(--el-text-regular); */
}
.el-input {
  --el-text-color-regular: #e1e1e1;
  border: 1px solid var(--el-input-text-color);
  color: var(--el-input-text-color);
}
</style>