
async function login_saml() {
// BASE_URL = "https://opsiserver43-dev.opsi.test:4447"
// # BASE_URL = "https://127.0.0.1:44431"
// session = Session()

// res = session.get(f"{BASE_URL}/auth/session_id", verify=False)
// res.raise_for_status()
// session_id = res.json()
// print(session_id)
  const url_1 = '/auth/saml/login'
  // const url_1 = '/auth/saml/login&redirect=/addons/webgui/app/clients'
  // const url_2 = '/auth/saml/callback/login
// useApiGET
// url = f"{BASE_URL}/auth/saml/login?session_id={session_id}&redirect=close_window"
// print(url)
// webbrowser.open(url)
  useApiGET(url_1)
// res = session.post(f"{BASE_URL}/auth/wait_authenticated", json={"wait_time": 60}, verify=False)
// print(res)

}