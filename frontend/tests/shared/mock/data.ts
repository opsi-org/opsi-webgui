/**
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
*/

export const serverDiagnostic = {
  system: {
    product_name: 'N13xWU',
    docker: true,
  },
  processor: {
    vendor: 'GenuineIntel',
    model: 'Intel(R) Core(TM) i5-8250U CPU @ 1.60GHz',
    flags: ['fpu', 'fma'],
  },
  os_release: {
    PRETTY_NAME: 'Debian GNU/Linux 12 (bookworm)',
    NAME: 'Debian GNU/Linux',
    VERSION_ID: '12',
    VERSION: '12 (bookworm)',
    VERSION_CODENAME: 'bookworm',
    ID: 'debian',
  },
  health_check: [
    {
      check_id: 'opsi_config',
      check_name: 'OPSI Configuration',
      check_status: 'ok',
      message: 'No issues found in the opsi configuration.',
    },
    {
      check_id: 'opsiconfd_config',
      check_name: 'Opsiconfd config',
      check_status: 'ok',
      message: 'No issues found in the configuration.',
    },
    {
      check_id: 'opsi_licenses',
      check_name: 'OPSI Licenses',
      check_status: 'ok',
      message: 'All licenses are below the limit.',
      partial_results: [
        {
          check_id: 'opsi_licenses:directory-connector',
          check_name: "OPSI license for module 'directory-connector'",
          check_description: '',
          check_status: 'ok',
          message: "License for module 'directory-connector' is below the limit of 0.",
        },
      ],
    },
  ],
}
