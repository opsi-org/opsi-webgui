<template>
  <div data-testid="VClientClone" class="VClientClone">
    <BarBPageHeader v-if="asChild" :title="$t('title.cloneclient') + ' - '" :subtitle="id" :closeroute="closeroute" />
    <BarBPageHeader v-if="!asChild">
      <template #left>
        <slot name="IDSelection" />
      </template>
    </BarBPageHeader>
    <br>
    <div>
      <GridGFormItem>
        <template #label>
          <span class="selectedClient">{{ $t('Selected client to clone:') }}</span>
        </template>
        <template #value>
          <span class="font-weight-bold">{{ id }}</span>
        </template>
      </GridGFormItem>
      <b-row class="mt-4 mb-2">
        <b class="basics">{{ $t('title.targetclient') }} </b>
      </b-row>
      <GridGFormItem value-more="true">
        <template #label>
          <span class="id">{{ $t('table.fields.id') }}</span>
        </template>
        <template #value>
          <b-form-input
            id="clientname"
            :aria-label="$t('table.name.client')"
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
            type="text"
            required
          />
        </template>
      </GridGFormItem>
      <GridGFormItem>
        <template #label>
          <span class="hwAddr">{{ $t('table.fields.hwAddr') }}</span>
        </template>
        <template #value>
          <b-form-input id="hwAddr" :aria-label="$t('table.fields.hwAddr')" type="text" />
        </template>
      </GridGFormItem>
      <GridGFormItem>
        <template #label>
          <span class="ip">{{ $t('table.fields.ip') }}</span>
        </template>
        <template #value>
          <b-form-input id="ip" :aria-label="$t('table.fields.ip')" type="text" />
        </template>
      </GridGFormItem>
      <b-row class="mt-4 mb-2">
        <b class="clone">{{ $t('title.clone') }} </b>
      </b-row>
      <GridGFormItem>
        <template #label>
          <span class="atrributes">{{ $t('title.hostattr') }}</span>
        </template>
        <template #value>
          <b-form-checkbox id="atrributes" :aria-label="$t('title.hostattr')" />
        </template>
      </GridGFormItem>
      <GridGFormItem>
        <template #label>
          <span class="products">{{ $t('title.products') }}</span>
        </template>
        <template #value>
          <b-form-checkbox id="products" :aria-label="$t('title.products')" />
        </template>
      </GridGFormItem>
      <GridGFormItem>
        <template #label>
          <span class="productproperties">{{ $t('title.prodproperties') }}</span>
        </template>
        <template #value>
          <b-form-checkbox id="productproperties" :aria-label="$t('title.prodproperties')" />
        </template>
      </GridGFormItem>
      <div class="float-right mt-2">
        <b-button id="resetButton" class="resetButton" variant="primary">
          <b-icon :icon="icon.reset" /> {{ $t('button.reset') }}
        </b-button>
        <b-button id="addButton" class="addButton" variant="success">
          <b-icon :icon="icon.client" /> {{ $t('title.clone') }}
        </b-button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'
import { Icons } from '../../mixins/icons'
@Component({ mixins: [Icons] })
export default class VClientClone extends Vue {
  icon: any
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
