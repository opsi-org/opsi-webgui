import json
import os

entry_products = (
    "product_createObjects",
    ["name"],
    {
        "name": "test 1",
        "licenseRequired": False,
        "setupScript": "setup.opsiscript",
        "uninstallScript": "",
        "updateScript": "",
        "alwaysScript": "",
        "onceScript": "",
        "customScript": "",
        "userLoginScript": "",
        "priority": 0,
        "description": "",
        "advice": "",
        "productClassIds": None,
        "windowsSoftwareIds": None,
        "id": "00-1-test",
        "productVersion": "1.0",
        "packageVersion": "3",
        "type": "LocalbootProduct",
    },
)
entry_pod = (
    "productOnDepot_createObjects",
    ["productId"],
    {
        "locked": False,
        "productId": "00-1-test",
        "productType": "LocalbootProduct",
        "productVersion": "1.0",
        "packageVersion": "3",
        "depotId": "depot3.uib.local",
        "type": "ProductOnDepot",
        # "ident": "00-mzks-profile;LocalbootProduct;1.0;3;bonifax.uib.local"
    },
)

entry_poc = (
    "productOnClient_createObjects",
    ["productId"],
    {
        "targetConfiguration": None,
        "installationStatus": "installed",
        "actionRequest": "setup",
        "lastAction": None,
        "actionProgress": None,
        "actionResult": None,
        "productVersion": None,
        "packageVersion": None,
        # "modificationTime": "2025-06-02 09:57:30",
        "actionSequence": -1,
        "productId": "00-1-test",
        "productType": "LocalbootProduct",
        "clientId": "bad-111.uib.local",
        "type": "ProductOnClient",
    },
)

entry_d = (
    "host_createOpsiDepotserver",
    ["id", "description"],
    {
        "id": "depot1.uib.local",
        "description": "Depot Server 1",
    },
)

entry_c = (
    "host_createOpsiClient",
    ["id", "description"],
    {
        "id": "bad-1.uib.local",
        "description": "Bad Client 1",
        "type": "OpsiClient",
        "ipAddress": "255.255.255.255",
        "macAddress": "00:11:22:33:44:55",
    },
)


def main(entries=(entry_d,)):
    try:
        for _ in range(2):
            for entry in entries:
                method, updateKeys, val = entry
                item = val.copy()
                for key in updateKeys:
                    # item[key] = str(item[key]).replace("test", str(_ + 1))
                    item[key] = str(item[key]).replace("1", str(_ + 1))

            cmd = "opsi-cli jsonrpc execute {} '[{}]'".format(method, json.dumps(item))
            print("Running:", cmd)
            # catch output
            os.system(cmd)
    except Exception as e:
        print("Error:", e)


if __name__ == "__main__":
    main()
