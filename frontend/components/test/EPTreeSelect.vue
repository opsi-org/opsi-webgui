<template>
  <div>
    <el-tree
    v-model="value"
    :data="group"
    :default-expanded-keys="['groups']"
    :render-after-expand="false"
    show-checkbox
  />
  </div>
</template>

<script setup>
const value = ref()
const group = [
  {
    id: 'groups',
    label: 'groups',
    type: 'HostGroup',
    children: [
      {
        id: 'testgroup1;groups',
        label: 'testgroup1',
        type: 'HostGroup',
        children: [
          {
            id: 'client1.uib.local;testgroup1',
            label: 'client1.uib.local',
            type: 'ObjectToGroup'
          }
        ]
      },
      {
        id: 'testgroup2;groups',
        label: 'testgroup2',
        type: 'HostGroup',
        children: [
          {
            id: 'client1.uib.local;testgroup2',
            label: 'client1.uib.local',
            type: 'ObjectToGroup'
          }
        ]
      }
    ]
  },
  {
    id: 'clientdirectory',
    label: 'clientdirectory',
    type: 'HostGroup',
    children: [
      {
        id: 'group1;clientdirectory',
        label: 'group1',
        type: 'HostGroup',
        children: [
          {
            id: 'client1.uib.local;group1',
            label: 'client1.uib.local',
            type: 'ObjectToGroup'
          },
          {
            id: 'client2.uib.local;group1',
            label: 'client2.uib.local',
            type: 'ObjectToGroup'
          }
        ]
      }
    ]
  }
]
const data = [
  {
    value: '1',
    label: 'Level one 1',
    children: [
      {
        value: '1-1',
        label: 'Level two 1-1',
        children: [
          {
            value: '1-1-1',
            label: 'Level three 1-1-1',
          },
        ],
      },
    ],
  },
  {
    value: '2',
    label: 'Level one 2',
    children: [
      {
        value: '2-1',
        label: 'Level two 2-1',
        children: [
          {
            value: '2-1-1',
            label: 'Level three 2-1-1',
          },
        ],
      },
      {
        value: '2-2',
        label: 'Level two 2-2',
        children: [
          {
            value: '2-2-1',
            label: 'Level three 2-2-1',
          },
        ],
      },
    ],
  },
  {
    value: '3',
    label: 'Level one 3',
    children: [
      {
        value: '3-1',
        label: 'Level two 3-1',
        children: [
          {
            value: '3-1-1',
            label: 'Level three 3-1-1',
          },
        ],
      },
      {
        value: '3-2',
        label: 'Level two 3-2',
        children: [
          {
            value: '3-2-1',
            label: 'Level three 3-2-1',
          },
        ],
      },
    ],
  },
]
</script>
