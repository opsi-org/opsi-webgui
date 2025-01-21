<template>
  <div>
    <PDialog
      v-model:visible="visible"
      modal
      :header="$t('title.creation.config')"
      :style="{ width: '25rem' }"
    >
      <!-- form > -->

      <Form
        v-slot="$form"
        :initial-values
        :resolver="resolver"
        @submit="onFormSubmit"
        class="flex flex-col gap-4 w-full sm:w-56"
      >
        <!-- Name -->
        <div class="flex flex-col gap-1">
          <PInputText
            name="username"
            type="text"
            :placeholder="$t('table.fields.name')"
            fluid
          />
          <PMessage
            v-if="$form.name?.invalid"
            severity="error"
            size="small"
            variant="simple"
          >
            {{ $form.name.error.message }}
          </PMessage>
        </div>
        <div class="flex flex-col gap-1">
          <PInputText
            name="description"
            type="text"
            :placeholder="$t('table.fields.description')"
            fluid
          />
          <PMessage
            v-if="$form.name?.invalid"
            severity="error"
            size="small"
            variant="simple"
          >
            {{ $form.name.error.message }}
          </PMessage>
        </div>
        <!-- description -->
        <!-- is boolean -->
        <!-- Details: -->
        <!-- editable -->
        <!-- multiValue -->
        <!-- standardwert/e -->
        <!-- possible values -->

        <Button type="submit" severity="secondary" label="Submit" />
      </Form>

      <div class="flex justify-end gap-2">
        <el-button @click="cancel">{{ $t('label.cancel') }}</el-button>
        <el-button type="primary" @click="save">
          {{ $t('label.select') }}
        </el-button>
      </div>
    </PDialog>
  </div>
</template>

<script setup lang="ts">
  const $t = useI18n().t

  const visible = ref(true)
  const $emit = defineEmits(['refetch'])
  const props = defineProps({
    refetchOnCancel: { type: Boolean, default: false },
  })

  const initialValues = ref({
    name: '',
    description: '',
    editable: true,
    multiValue: false,
    possibleValues: undefined as string | boolean | string[],
    standardValue: undefined as string | boolean | string[],
  })
  const resolver = ({ values }) => {
    const errors = {}

    if (!values.username) {
      errors.name = [{ message: 'Name is required.' }]
    }

    return {
      errors,
    }
  }

  const onFormSubmit = ({ valid }) => {
    if (valid) {
      console.log('success')
    }
  }
  function save() {
    // if (Array.isArray(localSelectedServers.value)) {
    //   selectionStore.setSelectionDepots(localSelectedServers.value)
    // } else {
    //   selectionStore.setSelectionDepots([localSelectedServers.value])
    // }
    // // selectionStore.setSelectionDepots(localSelectedServers.value)
    $emit('refetch')
    visible.value = false
  }
  function cancel() {
    if (props.refetchOnCancel) {
      $emit('refetch')
    }
    visible.value = false
  }
</script>
