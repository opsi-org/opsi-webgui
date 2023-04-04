import { mock, data } from '../../.utils/storybook/mock'
mock.onGet('/api/opsidata/log').reply(200, data.logs.clients)
// ?selectedClient=client1&selectedLogType=opsiconfd

export default {
  title: 'View/V Clients Log',
  parameters: { docs: { description: { component: 'Client Logs View' } } }
}

const PrimaryTemplate = () => ({
  template: '<ViewVClientsLog id="client1" :testdata="mytestdata" />',
  computed: {
    mytestdata () {
      return ['null',
        '[0] [2023-03-31 12:29:49.371] [ ] opsiclientd service start (service.py:132)',
        '[1] [2023-03-31 12:29:49.371] [ ] opsiclientd service start (service.py:132)',
        '[2] [2023-03-31 12:29:49.371] [ ] opsiclientd service start (service.py:132)',
        '[3] [2023-03-31 12:29:49.371] [ ] opsiclientd service start (service.py:132)',
        '[4] [2023-03-31 12:29:49.371] [ ] opsiclientd service start (service.py:132)',
        '[5] [2023-03-31 12:29:49.371] [ ] opsiclientd service start (service.py:132)',
        '[6] [2023-03-31 12:29:49.371] [ ] opsiclientd service start (service.py:132)',
        '[7] [2023-03-31 12:29:49.371] [ ] opsiclientd service start (service.py:132)',
        '[8] [2023-03-31 12:29:49.371] [ ] opsiclientd service start (service.py:132)',
        '[0] [2023-03-31 12:29:49.371] [ ] opsiclientd service start (service.py:132)',
        '[7] [2023-03-31 12:29:49.371] [ ] OpsiclientdService initiating (service.py:35)', '[7] [2023-03-31 12:29:49.371] [ ] OpsiclientdService initiated (service.py:39)', '[5] [2023-03-31 12:29:49.371] [ ] Handling start request (service.py:87)', '[7] [2023-03-31 12:29:49.371] [ ] Reporting service status: 4 (service.py:48)', '[7] [2023-03-31 12:29:49.371] [ ] Took 0.00 seconds to report service running status (service.py:91)', '[7] [2023-03-31 12:29:49.640] [ ] Opsiclient initiating (Opsiclientd.py:67)', '[7] [2023-03-31 12:29:49.640] [ ] EventListener initiated (Basic.py:248)', '[7] [2023-03-31 12:29:49.672] [opsiclientd ] Found running \'opsiclientd\' process: psutil.Process(pid=5892, name=\'opsiclientd.exe\', status=\'running\', started=\'12:29:46\') (__init__.py:52)', '[7] [2023-03-31 12:29:49.694] [opsiclientd ] Setting state \'shutdown_cancel_counter\' to 0 (State.py:108)', '[5] [2023-03-31 12:29:49.694] [opsiclientd ] Starting timeline (database location: C:\opsi.org\opsiclientd\timeline.sqlite) (Timeline.py:137)', '[6] [2023-03-31 12:29:49.694] [opsiclientd ] Connecting to sqlite:///C:\opsi.org\opsiclientd\timeline.sqlite (SQLite.py:71)', '[7] [2023-03-31 12:29:49.709] [opsiclientd ] SQLite connected: <SQLite(database=C:\opsi.org\opsiclientd\timeline.sqlite)> (SQLite.py:92)', '[5] [2023-03-31 12:29:49.725] [opsiclientd ] Trying to read config from file: \'C:\Program Files (x86)\opsi.org\opsi-client-agent\opsiclientd\opsiclientd.conf\' (Config.py:527)', '[7] [2023-03-31 12:29:49.725] [opsiclientd ] Parsing ini file \'C:\Program Files (x86)\opsi.org\opsi-client-agent\opsiclientd\opsiclientd.conf\' (__init__.py:543)', '[7] [2023-03-31 12:29:49.725] [opsiclientd ] Trying to lock file \'C:\Program Files (x86)\opsi.org\opsi-client-agent\opsiclientd\opsiclientd.conf\' (0/2000) (__init__.py:228)', '[7] [2023-03-31 12:29:49.725] [opsiclientd ] File \'C:\Program Files (x86)\opsi.org\opsi-client-agent\opsiclientd\opsiclientd.conf\' locked after 0 millis (__init__.py:249)', '[7] [2023-03-31 12:29:49.725] [opsiclientd ] Finished reading file after 0.000 seconds (__init__.py:620)', '[6] [2023-03-31 12:29:49.725] [opsiclientd ] Setting config global.log_level to 6 (Config.py:499)']
    }
  }
})

// named export Primary to create respective story
export const VClientsLog = PrimaryTemplate.bind({})
