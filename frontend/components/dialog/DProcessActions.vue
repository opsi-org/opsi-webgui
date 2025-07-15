<template>
  <el-button @click="openProcessActionsModal = true">
    {{ $t('processActions') }}
  </el-button>
  <el-dialog v-model="openProcessActionsModal" :title="$t('processActions.help')" align-center>
    <el-form label-width="30%" :label-position="mq.isMobile.value ? 'top' : 'left'">
      <el-form-item :label="$t('products')">
        <el-radio-group>
          <el-radio value="All">{{ $t('allProducts') }}</el-radio>
          <el-radio value="Selected">{{ $t('onlySelectedProducts') }}</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item :label="$t('visiblilityOnClients')">
        <el-checkbox
          :indeterminate="visibilityState === undefined"
          :checked="visibilityState === true"
          :unchecked="visibilityState === false"
          @change="toggleVisibility"
        >
          {{
            visibilityState === true
              ? $t('visible')
              : visibilityState === false
                ? $t('hidden')
                : $t('clientDefault')
          }}
        </el-checkbox>
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button>
          {{ $t('execute') }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="tsx">
  const mq = useMQ()
  const openProcessActionsModal = ref(false)
  const visibilityState = ref<true | false | undefined>(undefined) // Can be true, false, or undefined
  function toggleVisibility() {
    if (visibilityState.value === undefined) {
      visibilityState.value = true
    } else if (visibilityState.value === true) {
      visibilityState.value = false
    } else {
      visibilityState.value = undefined
    }
  }
</script>
