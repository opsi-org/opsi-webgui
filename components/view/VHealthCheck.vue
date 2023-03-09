<template>
  <div data-testid="VHealthCheck" class="VHealthCheck">
    <BarBPageHeader v-if="asChild" :title="$t('title.healthcheck') + ' - '" :subtitle="id" :closeroute="closeroute" />
    <AlertAAlert ref="healthCheckAlert" />
    <OverlayOLoading :is-loading="$fetchState.pending" />
    <BarBPageHeader>
      <template #left>
        <InputIFilterTChanges v-if="healthcheckdata" :placeholder="$t('Filter')" :filter.sync="filter" />
        <b-button
          size="sm"
          variant="outline-primary"
          class="border-0"
          @click="togglePartialResults(expandAll = !expandAll)"
        >
          <b-icon v-if="expandAll" :icon="iconnames.save" />
          <b-icon v-else />
          {{ $t('Show Details') }}
        </b-button>
      </template>
    </BarBPageHeader>
    <DivDScrollResult>
      <b-table
        thead-class="hide"
        borderless
        :filter="filter"
        :filter-included-fields="['check_status', 'check_name', 'partial_results', 'message']"
        :items="healthcheckdata"
        :fields="['partial_results', 'message']"
      >
        <template #cell(partial_results)="row">
          <div>
            <b-button
              v-if="row.item.partial_results.length !== 0"
              v-b-tooltip.hover
              size="sm"
              :style="'min-width: 30px !important;'"
              variant="transparent"
              :title="row.detailsShowing ? $t('Hide Details') : $t('Show Details')"
              @click="row.toggleDetails"
            >
              <b-icon v-if="row.detailsShowing" font-scale="0.8" :icon="iconnames.arrowFillUp" />
              <b-icon v-else font-scale="0.8" :icon="iconnames.arrowFillDown" />
            </b-button>
            <b-button
              v-else
              disabled
              :style="'min-width: 30px !important;'"
              class="border-0"
              variant="transparent"
            >
              {{ $t('') }}
            </b-button>
            <b-badge :style="'min-width: 70px !important;'" size="sm" :variant="getVariant(row.item.check_status)">
              <div class="text-uppercase">
                {{ row.item.check_status }}
              </div>
            </b-badge>
            <small><span class="font-weight-bold">
              {{ row.item.check_name }}
            </span></small>
          </div>
        </template>
        <template #cell()="row">
          <small>{{ row.value }}</small>
        </template>
        <template #row-details="row">
          <b-table
            thead-class="hide"
            small
            fixed
            hover
            :filter="filter"
            :filter-included-fields="['check_status', 'check_name', 'message', 'upgrade_issue']"
            :items="row.item.partial_results"
            :fields="['check_status', 'check_name', 'message', 'upgrade_issue']"
          >
            <template #cell(check_status)="data">
              <b-badge size="sm" :variant="getVariant(data.item.check_status)">
                <div class="text-uppercase">
                  {{ data.item.check_status }}
                </div>
              </b-badge>
            </template>
            <template #cell(message)="data">
              <div v-b-tooltip.hover :title="data.item.details ? JSON.stringify(data.item.details) : ''">
                <small>{{ data.item.message }}</small>
              </div>
            </template>
            <template #cell()="data">
              <small>{{ data.value }}</small>
            </template>
          </b-table>
        </template>
      </b-table>
    </DivDScrollResult>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'
import { Constants } from '../../mixins/uib-mixins'
@Component({ mixins: [Constants] })
export default class VHealthCheck extends Vue {
  iconnames: any
  $axios: any
  $t:any
  @Prop({ }) id!: string
  @Prop({ default: false }) 'asChild'!: string
  @Prop({ default: false }) 'closeroute'!: string

  healthcheckdata: Array<object> = []
  errorText: string = ''
  filter: string = ''
  expandAll: boolean = false

  getVariant (status: string) {
    if (status === 'error') { return 'danger' } else if (status === 'ok') { return 'success' } else if (status === 'warning') { return 'warning' } else { return 'primary' }
  }

  togglePartialResults (val) {
    for (const item of this.healthcheckdata) {
      this.$set(item, '_showDetails', val)
    }
  }

  fetch () {
    this.healthcheckdata = [
      {
        check_id: 'opsiconfd_config',
        check_name: 'Opsiconfd config',
        check_description: 'Check opsiconfd configuration',
        check_status: 'error',
        message: '1 issues found in the configuration.',
        details: {},
        upgrade_issue: null,
        partial_results: [
          {
            check_id: 'opsiconfd_config:log-level-stderr',
            check_name: 'Config log-level-stderr',
            check_description: '',
            check_status: 'ok',
            message: 'Log level NOTICE is suitable for productive use.',
            details: {
              config: 'log-level-stderr',
              value: 5
            },
            upgrade_issue: null
          },
          {
            check_id: 'opsiconfd_config:log-level-file',
            check_name: 'Config log-level-file',
            check_description: '',
            check_status: 'ok',
            message: 'Log level WARNING is suitable for productive use.',
            details: {
              config: 'log-level-file',
              value: 4
            },
            upgrade_issue: null
          },
          {
            check_id: 'opsiconfd_config:log-level',
            check_name: 'Config log-level',
            check_description: '',
            check_status: 'ok',
            message: 'Log level NOTICE is suitable for productive use.',
            details: {
              config: 'log-level',
              value: 5
            },
            upgrade_issue: null
          },
          {
            check_id: 'opsiconfd_config:debug-options',
            check_name: 'Config debug-options',
            check_description: '',
            check_status: 'ok',
            message: 'No debug options are set.',
            details: {
              config: 'debug-options',
              value: null
            },
            upgrade_issue: null
          },
          {
            check_id: 'opsiconfd_config:profiler',
            check_name: 'Config profiler',
            check_description: '',
            check_status: 'ok',
            message: 'Profiler is not enabled.',
            details: {
              config: 'profiler',
              value: false
            },
            upgrade_issue: null
          },
          {
            check_id: 'opsiconfd_config:run-as-user',
            check_name: 'Config run-as-user',
            check_description: '',
            check_status: 'error',
            message: 'Opsiconfd is runnning as user root.',
            details: {
              config: 'profiler',
              value: 'root'
            },
            upgrade_issue: null
          }
        ]
      },
      {
        check_id: 'disk_usage',
        check_name: 'Disk usage',
        check_description: 'Check disk usage',
        check_status: 'ok',
        message: 'Sufficient free space on all file systems.',
        details: {},
        upgrade_issue: null,
        partial_results: []
      },
      {
        check_id: 'depotservers',
        check_name: 'Depotserver check',
        check_description: 'Check configuration and state of depotservers',
        check_status: 'error',
        message: '6 issues found with the depot servers.',
        details: {},
        upgrade_issue: '4.3',
        partial_results: [
          {
            check_id: 'depotservers:bonifax.uib.local:depot_path',
            check_name: "Depotserver depot_path on 'bonifax.uib.local'",
            check_description: '',
            check_status: 'ok',
            message: 'The configured depot path corresponds to the default.',
            details: {
              path: '/var/lib/opsi/depot'
            },
            upgrade_issue: null
          },
          {
            check_id: 'depotservers:bonifax.uib.local:repository_path',
            check_name: "Depotserver repository_path on 'bonifax.uib.local'",
            check_description: '',
            check_status: 'ok',
            message: 'The configured repository path corresponds to the default.',
            details: {
              path: '/var/lib/opsi/repository'
            },
            upgrade_issue: null
          },
          {
            check_id: 'depotservers:bonifax.uib.local:workbench_path',
            check_name: "Depotserver workbench_path on 'bonifax.uib.local'",
            check_description: '',
            check_status: 'ok',
            message: 'The configured workbench path corresponds to the default.',
            details: {
              path: '/var/lib/opsi/workbench'
            },
            upgrade_issue: null
          },
          {
            check_id: 'depotservers:bonidepot.uib.local:depot_path',
            check_name: "Depotserver depot_path on 'bonidepot.uib.local'",
            check_description: '',
            check_status: 'ok',
            message: 'The configured depot path corresponds to the default.',
            details: {
              path: '/var/lib/opsi/depot'
            },
            upgrade_issue: null
          },
          {
            check_id: 'depotservers:bonidepot.uib.local:repository_path',
            check_name: "Depotserver repository_path on 'bonidepot.uib.local'",
            check_description: '',
            check_status: 'ok',
            message: 'The configured repository path corresponds to the default.',
            details: {
              path: '/var/lib/opsi/repository'
            },
            upgrade_issue: null
          },
          {
            check_id: 'depotservers:bonidepot.uib.local:workbench_path',
            check_name: "Depotserver workbench_path on 'bonidepot.uib.local'",
            check_description: '',
            check_status: 'error',
            message: "The local workbench path is no longer configurable in version 4.3 and is set to '/home/opsiproducts' on depot 'bonidepot.uib.local'.",
            details: {
              path: '/home/opsiproducts'
            },
            upgrade_issue: '4.3'
          },
          {
            check_id: 'depotservers:bwfscdummydepot.uib.local:depot_path',
            check_name: "Depotserver depot_path on 'bwfscdummydepot.uib.local'",
            check_description: '',
            check_status: 'ok',
            message: 'The configured depot path corresponds to the default.',
            details: {
              path: '/var/lib/opsi/depot'
            },
            upgrade_issue: null
          },
          {
            check_id: 'depotservers:bwfscdummydepot.uib.local:repository_path',
            check_name: "Depotserver repository_path on 'bwfscdummydepot.uib.local'",
            check_description: '',
            check_status: 'ok',
            message: 'The configured repository path corresponds to the default.',
            details: {
              path: '/var/lib/opsi/repository'
            },
            upgrade_issue: null
          },
          {
            check_id: 'depotservers:bwfscdummydepot.uib.local:workbench_path',
            check_name: "Depotserver workbench_path on 'bwfscdummydepot.uib.local'",
            check_description: '',
            check_status: 'ok',
            message: 'The configured workbench path corresponds to the default.',
            details: {
              path: '/var/lib/opsi/workbench'
            },
            upgrade_issue: null
          },
          {
            check_id: 'depotservers:dummy12x86.uib.local:depot_path',
            check_name: "Depotserver depot_path on 'dummy12x86.uib.local'",
            check_description: '',
            check_status: 'ok',
            message: 'The configured depot path corresponds to the default.',
            details: {
              path: '/var/lib/opsi/depot'
            },
            upgrade_issue: null
          },
          {
            check_id: 'depotservers:dummy12x86.uib.local:repository_path',
            check_name: "Depotserver repository_path on 'dummy12x86.uib.local'",
            check_description: '',
            check_status: 'ok',
            message: 'The configured repository path corresponds to the default.',
            details: {
              path: '/var/lib/opsi/repository'
            },
            upgrade_issue: null
          },
          {
            check_id: 'depotservers:dummy12x86.uib.local:workbench_path',
            check_name: "Depotserver workbench_path on 'dummy12x86.uib.local'",
            check_description: '',
            check_status: 'error',
            message: "The local workbench path is no longer configurable in version 4.3 and is set to '/home/opsiproducts' on depot 'dummy12x86.uib.local'.",
            details: {
              path: '/home/opsiproducts'
            },
            upgrade_issue: '4.3'
          },
          {
            check_id: 'depotservers:notejeena.uib.local:depot_path',
            check_name: "Depotserver depot_path on 'notejeena.uib.local'",
            check_description: '',
            check_status: 'ok',
            message: 'The configured depot path corresponds to the default.',
            details: {
              path: '/var/lib/opsi/depot'
            },
            upgrade_issue: null
          },
          {
            check_id: 'depotservers:notejeena.uib.local:repository_path',
            check_name: "Depotserver repository_path on 'notejeena.uib.local'",
            check_description: '',
            check_status: 'ok',
            message: 'The configured repository path corresponds to the default.',
            details: {
              path: '/var/lib/opsi/repository'
            },
            upgrade_issue: null
          },
          {
            check_id: 'depotservers:notejeena.uib.local:workbench_path',
            check_name: "Depotserver workbench_path on 'notejeena.uib.local'",
            check_description: '',
            check_status: 'ok',
            message: 'The configured workbench path corresponds to the default.',
            details: {
              path: '/var/lib/opsi/workbench'
            },
            upgrade_issue: null
          },
          {
            check_id: 'depotservers:opsi.raspberry.local:depot_path',
            check_name: "Depotserver depot_path on 'opsi.raspberry.local'",
            check_description: '',
            check_status: 'ok',
            message: 'The configured depot path corresponds to the default.',
            details: {
              path: '/var/lib/opsi/depot'
            },
            upgrade_issue: null
          },
          {
            check_id: 'depotservers:opsi.raspberry.local:repository_path',
            check_name: "Depotserver repository_path on 'opsi.raspberry.local'",
            check_description: '',
            check_status: 'ok',
            message: 'The configured repository path corresponds to the default.',
            details: {
              path: '/var/lib/opsi/repository'
            },
            upgrade_issue: null
          },
          {
            check_id: 'depotservers:opsi.raspberry.local:workbench_path',
            check_name: "Depotserver workbench_path on 'opsi.raspberry.local'",
            check_description: '',
            check_status: 'ok',
            message: 'The configured workbench path corresponds to the default.',
            details: {
              path: '/var/lib/opsi/workbench'
            },
            upgrade_issue: null
          },
          {
            check_id: 'depotservers:tst-srv-001.uib.local:depot_path',
            check_name: "Depotserver depot_path on 'tst-srv-001.uib.local'",
            check_description: '',
            check_status: 'ok',
            message: 'The configured depot path corresponds to the default.',
            details: {
              path: '/var/lib/opsi/depot'
            },
            upgrade_issue: null
          },
          {
            check_id: 'depotservers:tst-srv-001.uib.local:repository_path',
            check_name: "Depotserver repository_path on 'tst-srv-001.uib.local'",
            check_description: '',
            check_status: 'ok',
            message: 'The configured repository path corresponds to the default.',
            details: {
              path: '/var/lib/opsi/repository'
            },
            upgrade_issue: null
          },
          {
            check_id: 'depotservers:tst-srv-001.uib.local:workbench_path',
            check_name: "Depotserver workbench_path on 'tst-srv-001.uib.local'",
            check_description: '',
            check_status: 'error',
            message: "The local workbench path is no longer configurable in version 4.3 and is set to '/home/opsiproducts' on depot 'tst-srv-001.uib.local'.",
            details: {
              path: '/home/opsiproducts'
            },
            upgrade_issue: '4.3'
          },
          {
            check_id: 'depotservers:tst-srv-002.uib.local:depot_path',
            check_name: "Depotserver depot_path on 'tst-srv-002.uib.local'",
            check_description: '',
            check_status: 'ok',
            message: 'The configured depot path corresponds to the default.',
            details: {
              path: '/var/lib/opsi/depot'
            },
            upgrade_issue: null
          },
          {
            check_id: 'depotservers:tst-srv-002.uib.local:repository_path',
            check_name: "Depotserver repository_path on 'tst-srv-002.uib.local'",
            check_description: '',
            check_status: 'ok',
            message: 'The configured repository path corresponds to the default.',
            details: {
              path: '/var/lib/opsi/repository'
            },
            upgrade_issue: null
          },
          {
            check_id: 'depotservers:tst-srv-002.uib.local:workbench_path',
            check_name: "Depotserver workbench_path on 'tst-srv-002.uib.local'",
            check_description: '',
            check_status: 'error',
            message: "The local workbench path is no longer configurable in version 4.3 and is set to '/home/opsiproducts' on depot 'tst-srv-002.uib.local'.",
            details: {
              path: '/home/opsiproducts'
            },
            upgrade_issue: '4.3'
          },
          {
            check_id: 'depotservers:tst-srv-003.uib.local:depot_path',
            check_name: "Depotserver depot_path on 'tst-srv-003.uib.local'",
            check_description: '',
            check_status: 'ok',
            message: 'The configured depot path corresponds to the default.',
            details: {
              path: '/var/lib/opsi/depot'
            },
            upgrade_issue: null
          },
          {
            check_id: 'depotservers:tst-srv-003.uib.local:repository_path',
            check_name: "Depotserver repository_path on 'tst-srv-003.uib.local'",
            check_description: '',
            check_status: 'ok',
            message: 'The configured repository path corresponds to the default.',
            details: {
              path: '/var/lib/opsi/repository'
            },
            upgrade_issue: null
          },
          {
            check_id: 'depotservers:tst-srv-003.uib.local:workbench_path',
            check_name: "Depotserver workbench_path on 'tst-srv-003.uib.local'",
            check_description: '',
            check_status: 'error',
            message: "The local workbench path is no longer configurable in version 4.3 and is set to '/home/opsiproducts' on depot 'tst-srv-003.uib.local'.",
            details: {
              path: '/home/opsiproducts'
            },
            upgrade_issue: '4.3'
          },
          {
            check_id: 'depotservers:vbrupertdepot1.uib.local:depot_path',
            check_name: "Depotserver depot_path on 'vbrupertdepot1.uib.local'",
            check_description: '',
            check_status: 'ok',
            message: 'The configured depot path corresponds to the default.',
            details: {
              path: '/var/lib/opsi/depot'
            },
            upgrade_issue: null
          },
          {
            check_id: 'depotservers:vbrupertdepot1.uib.local:repository_path',
            check_name: "Depotserver repository_path on 'vbrupertdepot1.uib.local'",
            check_description: '',
            check_status: 'ok',
            message: 'The configured repository path corresponds to the default.',
            details: {
              path: '/var/lib/opsi/repository'
            },
            upgrade_issue: null
          },
          {
            check_id: 'depotservers:vbrupertdepot1.uib.local:workbench_path',
            check_name: "Depotserver workbench_path on 'vbrupertdepot1.uib.local'",
            check_description: '',
            check_status: 'error',
            message: "The local workbench path is no longer configurable in version 4.3 and is set to '/home/opsiproducts' on depot 'vbrupertdepot1.uib.local'.",
            details: {
              path: '/home/opsiproducts'
            },
            upgrade_issue: '4.3'
          }
        ]
      },
      {
        check_id: 'system_packages',
        check_name: 'System packages',
        check_description: 'Check system package versions',
        check_status: 'warning',
        message: 'Out of 3 packages checked, 0 are not installed and 1 are out of date.',
        details: {
          packages: 3,
          not_installed: 0,
          outdated: 1
        },
        upgrade_issue: null,
        partial_results: [
          {
            check_id: 'system_packages:opsiconfd',
            check_name: "System package 'opsiconfd'",
            check_description: '',
            check_status: 'warning',
            message: "Package 'opsiconfd' is out of date. Installed version '4.2.0.304-1' < available version '4.2.0.305-1'",
            details: {
              package: 'opsiconfd',
              available_version: '4.2.0.305-1',
              version: '4.2.0.304-1',
              outdated: true
            },
            upgrade_issue: null
          },
          {
            check_id: 'system_packages:opsi-utils',
            check_name: "System package 'opsi-utils'",
            check_description: '',
            check_status: 'ok',
            message: "Package 'opsi-utils' is up to date. Installed version: '4.2.0.196-1'",
            details: {
              package: 'opsi-utils',
              available_version: '4.2.0.196-1',
              version: '4.2.0.196-1',
              outdated: false
            },
            upgrade_issue: null
          },
          {
            check_id: 'system_packages:opsipxeconfd',
            check_name: "System package 'opsipxeconfd'",
            check_description: '',
            check_status: 'ok',
            message: "Package 'opsipxeconfd' is up to date. Installed version: '4.2.0.32-1'",
            details: {
              package: 'opsipxeconfd',
              available_version: '4.2.0.32-1',
              version: '4.2.0.32-1',
              outdated: false
            },
            upgrade_issue: null
          }
        ]
      },
      {
        check_id: 'product_on_depots',
        check_name: 'Products on depots',
        check_description: 'Check opsi package versions on depots',
        check_status: 'error',
        message: 'Out of 2 products on 10 depots checked, 11 are not installed and 9 are out of date.',
        details: {
          products: 2,
          depots: 10,
          not_installed: 11,
          outdated: 9
        },
        upgrade_issue: '4.3',
        partial_results: [
          {
            check_id: 'product_on_depots:bonifax.uib.local:opsi-script',
            check_name: "Product 'opsi-script' on 'bonifax.uib.local'",
            check_description: '',
            check_status: 'error',
            message: "Product 'opsi-script' is outdated on depot 'bonifax.uib.local'. Installed version '4.12.4.19-1' < available version '4.12.7.5-3'.",
            details: {
              depot_id: 'bonifax.uib.local',
              product_id: 'opsi-script',
              version: '4.12.4.19-1',
              available_version: '4.12.7.5-3'
            },
            upgrade_issue: '4.3'
          },
          {
            check_id: 'product_on_depots:bonifax.uib.local:opsi-client-agent',
            check_name: "Product 'opsi-client-agent' on 'bonifax.uib.local'",
            check_description: '',
            check_status: 'error',
            message: "Product 'opsi-client-agent' is outdated on depot 'bonifax.uib.local'. Installed version '4.2.0.0-1.43743' < available version '4.2.0.44-1'.",
            details: {
              depot_id: 'bonifax.uib.local',
              product_id: 'opsi-client-agent',
              version: '4.2.0.0-1.43743',
              available_version: '4.2.0.44-1'
            },
            upgrade_issue: '4.3'
          },
          {
            check_id: 'product_on_depots:bonidepot.uib.local:opsi-script',
            check_name: "Product 'opsi-script' on 'bonidepot.uib.local'",
            check_description: '',
            check_status: 'error',
            message: "Product 'opsi-script' is outdated on depot 'bonidepot.uib.local'. Installed version '4.12.4.17-1' < available version '4.12.7.5-3'.",
            details: {
              depot_id: 'bonidepot.uib.local',
              product_id: 'opsi-script',
              version: '4.12.4.17-1',
              available_version: '4.12.7.5-3'
            },
            upgrade_issue: '4.3'
          },
          {
            check_id: 'product_on_depots:bonidepot.uib.local:opsi-client-agent',
            check_name: "Product 'opsi-client-agent' on 'bonidepot.uib.local'",
            check_description: '',
            check_status: 'error',
            message: "Product 'opsi-client-agent' is outdated on depot 'bonidepot.uib.local'. Installed version '4.1.1.32-1' < available version '4.2.0.44-1'.",
            details: {
              depot_id: 'bonidepot.uib.local',
              product_id: 'opsi-client-agent',
              version: '4.1.1.32-1',
              available_version: '4.2.0.44-1'
            },
            upgrade_issue: '4.3'
          },
          {
            check_id: 'product_on_depots:bwfscdummydepot.uib.local:opsi-script',
            check_name: "Product 'opsi-script' on 'bwfscdummydepot.uib.local'",
            check_description: '',
            check_status: 'error',
            message: "Product 'opsi-script' is not installed on depot 'bwfscdummydepot.uib.local'.",
            details: {
              depot_id: 'bwfscdummydepot.uib.local',
              product_id: 'opsi-script'
            },
            upgrade_issue: '4.3'
          },
          {
            check_id: 'product_on_depots:bwfscdummydepot.uib.local:opsi-client-agent',
            check_name: "Product 'opsi-client-agent' on 'bwfscdummydepot.uib.local'",
            check_description: '',
            check_status: 'error',
            message: "Product 'opsi-client-agent' is outdated on depot 'bwfscdummydepot.uib.local'. Installed version '4.1.0.0-47' < available version '4.2.0.44-1'.",
            details: {
              depot_id: 'bwfscdummydepot.uib.local',
              product_id: 'opsi-client-agent',
              version: '4.1.0.0-47',
              available_version: '4.2.0.44-1'
            },
            upgrade_issue: '4.3'
          },
          {
            check_id: 'product_on_depots:dummy12x86.uib.local:opsi-script',
            check_name: "Product 'opsi-script' on 'dummy12x86.uib.local'",
            check_description: '',
            check_status: 'error',
            message: "Product 'opsi-script' is not installed on depot 'dummy12x86.uib.local'.",
            details: {
              depot_id: 'dummy12x86.uib.local',
              product_id: 'opsi-script'
            },
            upgrade_issue: '4.3'
          },
          {
            check_id: 'product_on_depots:dummy12x86.uib.local:opsi-client-agent',
            check_name: "Product 'opsi-client-agent' on 'dummy12x86.uib.local'",
            check_description: '',
            check_status: 'error',
            message: "Product 'opsi-client-agent' is outdated on depot 'dummy12x86.uib.local'. Installed version '4.0.7.12-1' < available version '4.2.0.44-1'.",
            details: {
              depot_id: 'dummy12x86.uib.local',
              product_id: 'opsi-client-agent',
              version: '4.0.7.12-1',
              available_version: '4.2.0.44-1'
            },
            upgrade_issue: '4.3'
          },
          {
            check_id: 'product_on_depots:notejeena.uib.local:opsi-script',
            check_name: "Product 'opsi-script' on 'notejeena.uib.local'",
            check_description: '',
            check_status: 'error',
            message: "Product 'opsi-script' is not installed on depot 'notejeena.uib.local'.",
            details: {
              depot_id: 'notejeena.uib.local',
              product_id: 'opsi-script'
            },
            upgrade_issue: '4.3'
          },
          {
            check_id: 'product_on_depots:notejeena.uib.local:opsi-client-agent',
            check_name: "Product 'opsi-client-agent' on 'notejeena.uib.local'",
            check_description: '',
            check_status: 'error',
            message: "Product 'opsi-client-agent' is not installed on depot 'notejeena.uib.local'.",
            details: {
              depot_id: 'notejeena.uib.local',
              product_id: 'opsi-client-agent'
            },
            upgrade_issue: '4.3'
          },
          {
            check_id: 'product_on_depots:opsi.raspberry.local:opsi-script',
            check_name: "Product 'opsi-script' on 'opsi.raspberry.local'",
            check_description: '',
            check_status: 'error',
            message: "Product 'opsi-script' is not installed on depot 'opsi.raspberry.local'.",
            details: {
              depot_id: 'opsi.raspberry.local',
              product_id: 'opsi-script'
            },
            upgrade_issue: '4.3'
          },
          {
            check_id: 'product_on_depots:opsi.raspberry.local:opsi-client-agent',
            check_name: "Product 'opsi-client-agent' on 'opsi.raspberry.local'",
            check_description: '',
            check_status: 'error',
            message: "Product 'opsi-client-agent' is not installed on depot 'opsi.raspberry.local'.",
            details: {
              depot_id: 'opsi.raspberry.local',
              product_id: 'opsi-client-agent'
            },
            upgrade_issue: '4.3'
          },
          {
            check_id: 'product_on_depots:tst-srv-001.uib.local:opsi-script',
            check_name: "Product 'opsi-script' on 'tst-srv-001.uib.local'",
            check_description: '',
            check_status: 'error',
            message: "Product 'opsi-script' is not installed on depot 'tst-srv-001.uib.local'.",
            details: {
              depot_id: 'tst-srv-001.uib.local',
              product_id: 'opsi-script'
            },
            upgrade_issue: '4.3'
          },
          {
            check_id: 'product_on_depots:tst-srv-001.uib.local:opsi-client-agent',
            check_name: "Product 'opsi-client-agent' on 'tst-srv-001.uib.local'",
            check_description: '',
            check_status: 'error',
            message: "Product 'opsi-client-agent' is outdated on depot 'tst-srv-001.uib.local'. Installed version '4.0.7.11-2' < available version '4.2.0.44-1'.",
            details: {
              depot_id: 'tst-srv-001.uib.local',
              product_id: 'opsi-client-agent',
              version: '4.0.7.11-2',
              available_version: '4.2.0.44-1'
            },
            upgrade_issue: '4.3'
          },
          {
            check_id: 'product_on_depots:tst-srv-002.uib.local:opsi-script',
            check_name: "Product 'opsi-script' on 'tst-srv-002.uib.local'",
            check_description: '',
            check_status: 'error',
            message: "Product 'opsi-script' is not installed on depot 'tst-srv-002.uib.local'.",
            details: {
              depot_id: 'tst-srv-002.uib.local',
              product_id: 'opsi-script'
            },
            upgrade_issue: '4.3'
          },
          {
            check_id: 'product_on_depots:tst-srv-002.uib.local:opsi-client-agent',
            check_name: "Product 'opsi-client-agent' on 'tst-srv-002.uib.local'",
            check_description: '',
            check_status: 'error',
            message: "Product 'opsi-client-agent' is outdated on depot 'tst-srv-002.uib.local'. Installed version '4.0.2.2-2' < available version '4.2.0.44-1'.",
            details: {
              depot_id: 'tst-srv-002.uib.local',
              product_id: 'opsi-client-agent',
              version: '4.0.2.2-2',
              available_version: '4.2.0.44-1'
            },
            upgrade_issue: '4.3'
          },
          {
            check_id: 'product_on_depots:tst-srv-003.uib.local:opsi-script',
            check_name: "Product 'opsi-script' on 'tst-srv-003.uib.local'",
            check_description: '',
            check_status: 'error',
            message: "Product 'opsi-script' is not installed on depot 'tst-srv-003.uib.local'.",
            details: {
              depot_id: 'tst-srv-003.uib.local',
              product_id: 'opsi-script'
            },
            upgrade_issue: '4.3'
          },
          {
            check_id: 'product_on_depots:tst-srv-003.uib.local:opsi-client-agent',
            check_name: "Product 'opsi-client-agent' on 'tst-srv-003.uib.local'",
            check_description: '',
            check_status: 'error',
            message: "Product 'opsi-client-agent' is outdated on depot 'tst-srv-003.uib.local'. Installed version '4.0.2.3-2' < available version '4.2.0.44-1'.",
            details: {
              depot_id: 'tst-srv-003.uib.local',
              product_id: 'opsi-client-agent',
              version: '4.0.2.3-2',
              available_version: '4.2.0.44-1'
            },
            upgrade_issue: '4.3'
          },
          {
            check_id: 'product_on_depots:vbrupertdepot1.uib.local:opsi-script',
            check_name: "Product 'opsi-script' on 'vbrupertdepot1.uib.local'",
            check_description: '',
            check_status: 'error',
            message: "Product 'opsi-script' is not installed on depot 'vbrupertdepot1.uib.local'.",
            details: {
              depot_id: 'vbrupertdepot1.uib.local',
              product_id: 'opsi-script'
            },
            upgrade_issue: '4.3'
          },
          {
            check_id: 'product_on_depots:vbrupertdepot1.uib.local:opsi-client-agent',
            check_name: "Product 'opsi-client-agent' on 'vbrupertdepot1.uib.local'",
            check_description: '',
            check_status: 'error',
            message: "Product 'opsi-client-agent' is not installed on depot 'vbrupertdepot1.uib.local'.",
            details: {
              depot_id: 'vbrupertdepot1.uib.local',
              product_id: 'opsi-client-agent'
            },
            upgrade_issue: '4.3'
          }
        ]
      },
      {
        check_id: 'product_on_clients',
        check_name: 'Products on clients',
        check_description: 'Check opsi package versions on clients',
        check_status: 'ok',
        message: 'All important products are up to date on all clients.',
        details: {},
        upgrade_issue: null,
        partial_results: []
      },
      {
        check_id: 'redis',
        check_name: 'Redis server',
        check_description: 'Check Redis server state',
        check_status: 'ok',
        message: 'Redis is running and RedisTimeSeries is loaded.',
        details: {
          connection: true,
          timeseries: false
        },
        upgrade_issue: null,
        partial_results: []
      },
      {
        check_id: 'mysql',
        check_name: 'MySQL server',
        check_description: 'Check MySQL server state',
        check_status: 'ok',
        message: 'Connection to MySQL is working.',
        details: {},
        upgrade_issue: null,
        partial_results: []
      },
      {
        check_id: 'opsi_licenses',
        check_name: 'OPSI licenses',
        check_description: 'Check opsi licensing state',
        check_status: 'error',
        message: '0 active clients, licensing issues detected.',
        details: {
          client_numbers: {
            macos: 0,
            linux: 0,
            windows: 0,
            inactive: 881,
            all: 0
          }
        },
        upgrade_issue: null,
        partial_results: [
          {
            check_id: 'opsi_licenses:directory-connector',
            check_name: "OPSI license for module 'directory-connector'",
            check_description: '',
            check_status: 'error',
            message: "License for module 'directory-connector' is over the limit of 0.",
            details: {
              module_id: 'directory-connector',
              state: 'over_limit',
              client_number: 0
            },
            upgrade_issue: null
          },
          {
            check_id: 'opsi_licenses:license_management',
            check_name: "OPSI license for module 'license_management'",
            check_description: '',
            check_status: 'error',
            message: "License for module 'license_management' is over the limit of 0.",
            details: {
              module_id: 'license_management',
              state: 'over_limit',
              client_number: 0
            },
            upgrade_issue: null
          },
          {
            check_id: 'opsi_licenses:linux_agent',
            check_name: "OPSI license for module 'linux_agent'",
            check_description: '',
            check_status: 'error',
            message: "License for module 'linux_agent' is over the limit of 0.",
            details: {
              module_id: 'linux_agent',
              state: 'over_limit',
              client_number: 0
            },
            upgrade_issue: null
          },
          {
            check_id: 'opsi_licenses:local_imaging',
            check_name: "OPSI license for module 'local_imaging'",
            check_description: '',
            check_status: 'error',
            message: "License for module 'local_imaging' is over the limit of 0.",
            details: {
              module_id: 'local_imaging',
              state: 'over_limit',
              client_number: 0
            },
            upgrade_issue: null
          },
          {
            check_id: 'opsi_licenses:macos_agent',
            check_name: "OPSI license for module 'macos_agent'",
            check_description: '',
            check_status: 'error',
            message: "License for module 'macos_agent' is over the limit of 0.",
            details: {
              module_id: 'macos_agent',
              state: 'over_limit',
              client_number: 0
            },
            upgrade_issue: null
          },
          {
            check_id: 'opsi_licenses:monitoring',
            check_name: "OPSI license for module 'monitoring'",
            check_description: '',
            check_status: 'error',
            message: "License for module 'monitoring' is over the limit of 0.",
            details: {
              module_id: 'monitoring',
              state: 'over_limit',
              client_number: 0
            },
            upgrade_issue: null
          },
          {
            check_id: 'opsi_licenses:mysql_backend',
            check_name: "OPSI license for module 'mysql_backend'",
            check_description: '',
            check_status: 'error',
            message: "License for module 'mysql_backend' is over the limit of 0.",
            details: {
              module_id: 'mysql_backend',
              state: 'over_limit',
              client_number: 0
            },
            upgrade_issue: null
          },
          {
            check_id: 'opsi_licenses:scalability1',
            check_name: "OPSI license for module 'scalability1'",
            check_description: '',
            check_status: 'error',
            message: "License for module 'scalability1' is over the limit of 0.",
            details: {
              module_id: 'scalability1',
              state: 'over_limit',
              client_number: 0
            },
            upgrade_issue: null
          },
          {
            check_id: 'opsi_licenses:secureboot',
            check_name: "OPSI license for module 'secureboot'",
            check_description: '',
            check_status: 'error',
            message: "License for module 'secureboot' is over the limit of 0.",
            details: {
              module_id: 'secureboot',
              state: 'over_limit',
              client_number: 0
            },
            upgrade_issue: null
          },
          {
            check_id: 'opsi_licenses:uefi',
            check_name: "OPSI license for module 'uefi'",
            check_description: '',
            check_status: 'error',
            message: "License for module 'uefi' is over the limit of 0.",
            details: {
              module_id: 'uefi',
              state: 'over_limit',
              client_number: 0
            },
            upgrade_issue: null
          },
          {
            check_id: 'opsi_licenses:userroles',
            check_name: "OPSI license for module 'userroles'",
            check_description: '',
            check_status: 'error',
            message: "License for module 'userroles' is over the limit of 0.",
            details: {
              module_id: 'userroles',
              state: 'over_limit',
              client_number: 0
            },
            upgrade_issue: null
          },
          {
            check_id: 'opsi_licenses:wim-capture',
            check_name: "OPSI license for module 'wim-capture'",
            check_description: '',
            check_status: 'error',
            message: "License for module 'wim-capture' is over the limit of 0.",
            details: {
              module_id: 'wim-capture',
              state: 'over_limit',
              client_number: 0
            },
            upgrade_issue: null
          },
          {
            check_id: 'opsi_licenses:win-vhd',
            check_name: "OPSI license for module 'win-vhd'",
            check_description: '',
            check_status: 'error',
            message: "License for module 'win-vhd' is over the limit of 0.",
            details: {
              module_id: 'win-vhd',
              state: 'over_limit',
              client_number: 0
            },
            upgrade_issue: null
          },
          {
            check_id: 'opsi_licenses:vpn',
            check_name: "OPSI license for module 'vpn'",
            check_description: '',
            check_status: 'error',
            message: "License for module 'vpn' is over the limit of 0.",
            details: {
              module_id: 'vpn',
              state: 'over_limit',
              client_number: 0
            },
            upgrade_issue: null
          }
        ]
      },
      {
        check_id: 'deprecated_calls',
        check_name: 'Deprecated RPCs',
        check_description: 'Check use of deprecated RPC methods',
        check_status: 'ok',
        message: 'No deprecated method calls found.',
        details: {},
        upgrade_issue: null,
        partial_results: []
      }
    ]
    // const request = { id: 1, jsonrpc: '2.0', method: 'service_healthCheck', params: [] }
    // const host = window.location.hostname
    // const baseURL = 'https://' + host + ':4447/rpc'
    // await this.$axios.$post(baseURL, request)
    //   .then((response) => {
    //     this.healthcheckdata = response.result
    //   }).catch((error) => {
    //     const detailedError = ((error?.response?.data?.message) ? error.response.data.message : '') + ' ' + ((error?.response?.data?.details) ? error.response.data.details : '')
    //     const ref = (this.$refs.healthCheckAlert as any)
    //     ref.alert(this.$t('message.error.fetch') as string + 'Health Check', 'danger', detailedError)
    //     this.errorText = this.$t('message.error.defaulttext') as string
    //   })
  }
}
</script>
