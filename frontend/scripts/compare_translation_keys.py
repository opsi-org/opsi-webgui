import json
import argparse
import os

VERSION = '0.1.0'


def argparser():
    parser = argparse.ArgumentParser(description='Run npm commands')
    # call function to list all versions of a package
    parser.add_argument('-v', action='store_true', help='Print current version')
    parser.add_argument('-f1', '--file1', type=str, help='Path to first JSON file', default='locale/opsi-webgui_en.json')
    parser.add_argument('-f2', '--file2', type=str, help='Path to second JSON file', default='locale/opsi-webgui_de.json')
    parser.add_argument('-c', '--compare', action='store_true', help='Compare keys in two JSON files')
    # parser.add_argument('-s', '--search', type=str, help='Search for keys in files')
    return parser

def compare_translation_keys_in_files(file1, file2):
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
    str_keys1 = '\n\t'.join(list(only_in_file1))
    str_keys2 = '\n\t'.join(list(only_in_file2))
    print(f"Keys missing in {file1}:\n\t{str_keys2}\n")
    print(f"Keys missing in {file2}:\n\t{str_keys1}\n")

def main():
    args = argparser().parse_args()

    current_path = os.getcwd()
    if current_path != '/workspace/frontend':
        os.chdir('/workspace/frontend')

    if args.v:
        print(VERSION)
        return
    if args.compare:
        compare_translation_keys_in_files(args.file1, args.file2)
        # return
if __name__ == '__main__':
    main()