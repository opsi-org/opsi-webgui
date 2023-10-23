<template>
  <div data-testid="VClientClone" class="VClientClone">
    <BarBPageHeader v-if="asChild" :title="$t('title.cloneclient') +''+ t_fixed('keep-english.title.delimiter')" :subtitle="id" :closeroute="closeroute" />
    <GridGFormItem v-if="!asChild" :label="$t('label.cloneClient')">
      <template #value>
        <slot name="IDSelection" />
      </template>
    </GridGFormItem>
    <b-row class="text-small mb-2">
      <b>{{ $t('title.targetclient') }} </b>
    </b-row>
    <GridGFormItem value-more="true" :label="$t('table.fields.id')">
      <template #value>
        <b-form-input
          id="clientname"
          :aria-label="$t('table.name.client')"
          size="sm"
          type="text"
          required
        />
      </template>
      <template #valueMore>
        <b-form-input
          id="domainName"
          class="domainName"
          :aria-label="$t('table.name.domain')"
          :value="id.substring(id.indexOf('.'))"
          size="sm"
          type="text"
          required
        />
      </template>
    </GridGFormItem>
    <GridGFormItem :label="$t('table.fields.hwAddr')">
      <template #value>
        <b-form-input id="hwAddr" size="sm" :aria-label="$t('table.fields.hwAddr')" type="text" />
      </template>
    </GridGFormItem>
    <GridGFormItem :label="$t('table.fields.ip')">
      <template #value>
        <b-form-input id="ip" size="sm" :aria-label="$t('table.fields.ip')" type="text" />
      </template>
    </GridGFormItem>
    <b-row class="text-small mb-2">
      <b>{{ $t('title.clone') }} </b>
    </b-row>
    <GridGFormItem :label="$t('title.hostparam')">
      <template #value>
        <b-form-checkbox id="atrributes" size="sm" :aria-label="$t('title.hostparam')" />
      </template>
    </GridGFormItem>
    <GridGFormItem :label="$t('title.products')">
      <template #value>
        <b-form-checkbox id="products" size="sm" :aria-label="$t('title.products')" />
      </template>
    </GridGFormItem>
    <GridGFormItem :label="$t('title.prodproperties')">
      <template #value>
        <b-form-checkbox id="productproperties" size="sm" :aria-label="$t('title.prodproperties')" />
      </template>
    </GridGFormItem>
    <GridGFormItem>
      <template #value>
        <div class="float-right mt-2">
          <b-button id="resetButton" class="resetButton" size="sm" variant="primary">
            <b-icon :icon="icon.reset" /> {{ $t('button.reset') }}
          </b-button>
          <b-button id="addButton" class="addButton" size="sm" variant="success">
            <b-icon :icon="icon.client" /> {{ $t('title.clone') }}
          </b-button>
        </div>
      </template>
    </GridGFormItem>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'
import { Icons } from '../../mixins/icons'
import { Strings } from '../../mixins/strings'
@Component({ mixins: [Icons, Strings] })
export default class VClientClone extends Vue {
  icon: any
  t_fixed: any
  @Prop({ }) id!: string
  @Prop({ default: false }) 'asChild'!: string
  @Prop({ default: false }) 'closeroute'!: string
}
</script>

<style>
.VClientClone {
  overflow-x: hidden;
  padding-left: 10px;
}
</style>
