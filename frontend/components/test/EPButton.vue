<template>
  <div>
    <div v-for="v,k in elementplusColor2bootstrapVariant" :key="k">
      <b-button :variant="v" >Bootstrap vue variant='{{v}}'</b-button>
      <el-button :type="k">
        Element Plus color='{{k}}'
        <el-icon class="el-icon--right">
          <el-icon-arrow-down />
        </el-icon>
      </el-button>
      <br />
    </div>
  </div>
</template>

<script setup>

const elementplusColor2bootstrapVariant = ref({
  //BVvariant: EPcolor
  primary: 'primary',
  success: 'success',
  warning: 'warning',
  danger: 'danger',
  error: 'error',
  info: 'info'
})
</script>
