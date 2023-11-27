<template>
  <!--  Testing if bootstrap and element plus have same colors -->
  <Story
    :layout="{ type: 'grid', width: '50%' }"
  >
    <Variant title="ElementPlus-Color">
      <div v-for="v,k in elementplusColor2bootstrapVariant" :key="k">
        <el-button :type="k">
        EP button color='{{k}}'
        <el-icon class="el-icon--right">
          <el-icon-arrow-down />
        </el-icon>
      </el-button>
      </div>
    </Variant>
    <Variant title="Bootstrap">

    <div v-for="v,k in elementplusColor2bootstrapVariant" :key="k">
      <b-button :variant="v" >BV variant='{{v}}'</b-button>
    </div>
    </Variant>
  </Story>
</template>

<script lang="ts" setup>

const elementplusColor2bootstrapVariant = ref({
  // https://element-plus.org/en-US/guide/theming.html
  // https://bootstrap-vue.org/docs/reference/color-variants/
  //BVvariant: EPcolor
  default: 'default',
  white: 'light',
  black: 'dark',
  primary: 'primary',
  secondary: 'secondary', // available in BV
  success: 'success',
  warning: 'warning',
  danger: 'danger',
  error: 'error', // available in EP (actually...)
  info: 'info',
  transparent: 'transparent', // available in BV
})
</script>