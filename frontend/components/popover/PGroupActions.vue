<template>
  <el-popover :width="500" trigger="click">
    <template #reference>
      <el-button size="small">
        <IconIIcon v-for="subaction in props.data.action.split('-')" :icon="icons[subaction]" />
      </el-button>
    </template>
    <template v-if="props.data.action == 'group-add'">
      <el-form label-width="150px">
        <el-form-item v-for="value,label,index in addSubGroup" :key="index" :label="$t('table.fields.'+label)" :class="{ 'd-none': label=='parentGroupId' }">
          <el-input v-model="addSubGroup[label]" />
        </el-form-item>
      </el-form>
      <el-button class="float-right" type="success" data-testid="createSubGroup">
        {{ $t("button.create") }}
      </el-button>
    </template>
    <template v-if="props.data.action == 'delete'">
      <small>{{ $t('group.removeClient.confirm') }}</small>
      <b-button variant="danger" class="float-right" size="sm">
        {{ $t('group.remove') }}
      </b-button>
    </template>
    {{ props.data.category }} : {{ props.data.nodeType }} : {{ props.data.nodeLabel }} : {{ props.data.action }}
  </el-popover>
</template>
<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useNotification } from '~/composables/mixins/useComponent';
import {useIcons} from '../../composables/mixins/useIcons'
const props = defineProps({
  data: { type: Object, required: true }
})
const icons = useIcons()
const addSubGroup = reactive({
  parentGroupId: '',
  groupId: '',
  description: '',
  notes: ''
})
const updateGroup = reactive({
  parent: '',
  description: '',
  notes: ''
})
</script>