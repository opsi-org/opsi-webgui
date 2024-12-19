<template>
  <!-- TODO: mobile first (use row layout not columns) -->
  <el-form
    label-width="50%"
    :label-position="mq.isMobile.value ? 'top' : 'left'"
    class="diagnostics-form"
    v-if="Object.keys(data).length > 0"
  >
    <div v-for="(values, category) in data" :key="category">
      <template v-if="values && Object.keys(values).length !== 0">
        <h3 class="mt-4 text-lg font-semibold">{{ category }}</h3>
        <el-form-item v-for="(v, k) in values" :label="k.toString()" :key="k">
          <template v-if="typeof v == 'object'">
            <div class="scrollValue">
              <pre class="min-w-[250px]">{{ JSON.stringify(v, null, 2) }}</pre>
              <br />
            </div>
          </template>
          <template v-else>
            {{ v }}
            <br />
          </template>
        </el-form-item>
      </template>
    </div>
  </el-form>
</template>

<script setup lang="ts">
  const mq = useMQ()
  const _props = defineProps({
    data: { type: Object, required: true },
  })
</script>
<style>
  div.scrollValue {
    max-height: 400px;
    overflow-x: hidden;
    overflow-y: auto;
  }
  .diagnostics-form .el-form-item {
    margin-bottom: 7px;
  }
  .diagnostics-form .el-form-item__label {
    height: 28px;
    line-height: 28px;
  }
  .diagnostics-form .el-form-item__content {
    line-height: 28px;
  }
</style>
