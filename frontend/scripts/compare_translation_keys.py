import json
file1 = "locale/opsi-webgui_en.json"
file2 = "locale/opsi-webgui_de.json"
# JSON-Dateien laden
with open(file1, 'r') as file:
    json1 = json.load(file)

with open(file2, 'r') as file:
    json2 = json.load(file)

# Set mit allen Keys aus beiden Dateien
keys1 = set(json1.keys())
keys2 = set(json2.keys())

# Keys, die nur in file1.json oder nur in file2.json existieren
only_in_file1 = keys1 - keys2
only_in_file2 = keys2 - keys1
in_both_files = keys1 & keys2

print("Keys nur in ",file1, ': \n', only_in_file1)
print()
print("Keys nur in ",file2, ': \n', only_in_file2)
# print("Keys in beiden Dateien:", in_both_files)