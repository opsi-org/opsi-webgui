

export const Constants = {
  COMPONENT_OPTIONS_KEY: "nuxtI18n",
  STRATEGIES: {"PREFIX":"prefix","PREFIX_EXCEPT_DEFAULT":"prefix_except_default","PREFIX_AND_DEFAULT":"prefix_and_default","NO_PREFIX":"no_prefix"},
  REDIRECT_ON_OPTIONS: {"ALL":"all","ROOT":"root","NO_PREFIX":"no prefix"},
}
export const nuxtOptions = {
  isUniversalMode: false,
  trailingSlash: undefined,
}
export const options = {
  vueI18n: {"fallbackLocale":"en","messages":{"en":{"message":{"loading":"Loading","warning":"WARNING","success":"SUCCESS","error":"ERROR","loginFailed":"Login Failed","errortext":"Something went wrong !!!","add":" has been added succesfully.","delete":"Delete","deleteConfirm":"Are you sure you want to delete the client","deleteMessage":" has been deleted successfully.","exists":" already exists.","noClientsSelectedShowDepot":"0 clients selected (set depot value)","notOnEachDepot":"product installed only on {count}/{countall} depots","errorInPropertyFetch":"Something went wrong with ProductProperties","errorInDependenciesFetch":"Something went wrong with ProductDependencies","differentProductVersions":"Different versions exists"},"title":{"app":"OPSIWEB","overview":"OVERVIEW","support":"Support","manage":"MANAGE","depots":"Depots","allDepots":"All Depots","depotsconfig":"Depots - Configuration","clients":"Clients","clientsconfig":"Clients - Configuration","clientslog":"Clients - Logs","allClients":"All Clients","addNew":"Add New","addNewClient":"Add New Client","config":"Configuration","log":"Logs","products":"Products","configure":"CONFIGURE","settings":"Settings","localboot":"Localboot Products","netboot":"Netboot Products","hostattr":"Host Attributes","properties":"Property-Configuration","dependencies":"Dependencies","dependenciesEmpty":"(empty)","propertiesEmpty":"(empty)"},"values":{"mixed":"<mixed>","add":"+"},"table":{"filter":"Filter","showCol":"Show Columns","clientDetails":"Client Details","addtnlInfo":"Additional Information","perpage":"PerPage","emptyText":"No entries","fields":{"id":"ID","name":"Name","description":"Description","type":"Type","ip":"IP","hwAddr":"MAC","inventNum":"Inventory Number","created":"Created","lastSeen":"Last Seen","hostKey":"OPSI Host Key","otp":"One Time Password","notes":"Notes","stats":"Statistics","version":"(Depot) Version","instStatus":"Installation Status","actionResult":"ActionResult","clientsIds":"Installed on clients","depotIds":"Installed on depots","localbootid":"Product-ID","netbootid":"Product-ID","actionRequest":"Request","versionOutdated":"Outdated Products","actionRequestFailed":"Failed Products","rowactions":"Actions","productId":"Product Id","required":"required","pre-required":"pre-required","post-required":"post-required","on-deinstall":"on-deinstall","requiredType":"type","unknown":"unknown"}},"button":{"login":"Login","logout":"Logout","expand":"Expand","collapse":"Collapse","reset":"Reset","add":"Add"},"treeselect":{"hostGroups":"Host Groups","prodGroups":"Product Groups"},"formselect":{"depot":"Select a Depot","client":"Select a Client","logtype":"Select a Log type","tooltip":{"actionRequest":"Set actionRequest for all selected products"}},"loginPage":{"username":"Username","password":"Password","errortext":"Something went wrong. Is opsiconfd available?"},"supportPage":{"documentation":{"title":"Documentation","description":"Our documentation contains Getiing Started Guides and Manuals, which are step-by-step instructions that will help you get started with OPSI.","button":"View Documentation"},"forum":{"title":"Forum","description":"Share feedback, ask for help and connect with community on the OPSI Forum.","button":"Visit OPSI Forum"},"support":{"title":"Support","description":"Do you need support at OPSI? We will get you the help you need. ","button":"Learn More"}},"settingsPage":{"localspecific":"Local Specific Settings","theme":"Theme","mode":"User Mode","modules":"Modules Content"},"userinfo":{"normal":"Normal Mode","normal_desc":"Product actionRequest changes can be saved immediately.","expert":"Expert Mode","expert_desc":"There is a Overview of changes with Delete/Save features."}}}},
  vueI18nLoader: false,
  locales: [],
  defaultLocale: "",
  defaultDirection: "ltr",
  routesNameSeparator: "___",
  defaultLocaleRouteNameSuffix: "default",
  sortRoutes: true,
  strategy: "prefix_except_default",
  lazy: false,
  langDir: null,
  rootRedirect: null,
  detectBrowserLanguage: {"alwaysRedirect":false,"cookieCrossOrigin":false,"cookieDomain":null,"cookieKey":"i18n_redirected","cookieSecure":false,"fallbackLocale":"","redirectOn":"root","useCookie":true},
  differentDomains: false,
  baseUrl: "",
  vuex: {"moduleName":"i18n","syncRouteParams":true},
  parsePages: true,
  pages: {},
  skipSettingLocaleOnNavigate: false,
  onBeforeLanguageSwitch: () => {},
  onLanguageSwitched: () => null,
  locale: "en",
  normalizedLocales: [],
  localeCodes: [],
  additionalMessages: [],
}

export const localeMessages = {}
