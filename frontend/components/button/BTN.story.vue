<template>
  <!--  Testing if bootstrap and element plus have same colors -->
  <Story
    :layout="{ type: 'grid', width: '50%' }"
  >
    <Variant title="ElementPlus-Color">
      <div v-for="v,k in elementplusColor2bootstrapVariant" :key="k">
        <el-button :type="v[0]">
        EP button color='{{v[0]}}'
        <el-icon class="el-icon--right">
          <el-icon-arrow-down />
        </el-icon>
      </el-button>
      </div>
    </Variant>
    <Variant title="Bootstrap">

    <div v-for="v,k in elementplusColor2bootstrapVariant" :key="k">
      <b-button :variant="v[1]" >BV variant='{{v[1]}}'</b-button>
    </div>
    </Variant>
  </Story>
</template>

<script lang="ts" setup>
const elementplusColor2bootstrapVariant = ref<any>({
  // https://element-plus.org/en-US/guide/theming.html
  // https://bootstrap-vue.org/docs/reference/color-variants/
  //uniquename: [BVvariant, EPcolor]
  default: ['default', 'default'],
  whitelight: [undefined, 'light'],
  blackdark: ['text', 'dark'],
  primary: ['primary', 'primary'],
  secondary: [undefined, 'secondary'], // available in BV
  success: ['success', 'success'],
  warning: ['warning', 'warning'],
  danger: ['danger', 'danger'],
  error: ['error', 'error'], // available in EP (actually...)
  info: ['info', 'info'],
  transparent: [undefined, 'transparent'], // available in BV
})
</script>