import json
import argparse
import os
import re
import sys


VERSION = '0.2.0'

class bcolors:
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKCYAN = '\033[96m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'

def argparser():
    parser = argparse.ArgumentParser(description='Run npm commands')
    # call function to list all versions of a package
    parser.add_argument('-v', action='store_true', help='Print current version')
    parser.add_argument('-c', '--compare', action='store_true', help='Compare keys in two JSON files')
    parser.add_argument('-f1', '--file1', type=str, help='Path to first JSON file', default='locale/opsi-webgui_en.json')
    parser.add_argument('-f2', '--file2', type=str, help='Path to second JSON file', default='locale/opsi-webgui_de.json')

    parser.add_argument('-s', '--search-missing', action='store_true', help='Search for keys missing translation keys in files')
    # parser.add_argument('-r', '--regex-files', type=str, help='Files to search in', default='scripts/compare_translation_keys.*')
    parser.add_argument('-i','--include', action='append', help='Files to search in (can be regex)', default=['*.vue', '*.js', '*.ts', '*.tsx', '*.jsx'])
    parser.add_argument('-e','--exclude', action='append', help='Files to exclude from search', default=[
        '*.story.vue',
        'node_modules/', 'build/', 'dist/', 'coverage/', 'public/', 'assets/', 'locale/', '.nuxt/', 'tests/', '.config/', 'histoire/', 'test-results/', 'test-configs', 'plugins',
        # 'components', 'composables', 'pages', 'plugins', 'store', 'layouts', 'middleware', 'static', 'assets', 'api', 'utils', 'services', 'filters', 'directives', 'mixins', 'hooks', 'layouts', 'assets', 'styles'
    ])

    # parser.add_argument('-f', '--files', type=list, help='Files to search in', default=['components/**/*.js', 'pages/**/*.js'])
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

def wildcard_to_regex(pattern):
    """Konvertiert einen Wildcard-Ausdruck (z. B. '**/*.py') in eine Regex."""
    # Escape Punkte, um sie als Zeichen statt als Regex-Syntax zu behandeln
    pattern = pattern.replace('.', '\\.')
    # **/ -> .*/ für beliebige Verzeichnistiefe
    pattern = pattern.replace('**/', '(.*\\/)?')
    # * -> [^/]* für beliebige Zeichen außer '/'
    pattern = pattern.replace('*', '[^/]*')
    # ? -> . für genau ein beliebiges Zeichen
    pattern = pattern.replace('?', '.')
    # Füge Start- und Endmarkierung hinzu
    return '^' + pattern + '$'

def search_translation_keys_in_files(translation_file, includes, excludes):
    """ Search for keys from file1 in files given by regex """
    regex_include = wildcard_to_regex("(" + ")|(".join(includes) + ")")
    regex_exclude = wildcard_to_regex("(" + ")|(".join(excludes) + ")")
    rootdir = os.getcwd()
    # print(translation_file, includes, rootdir, regex_include, regex_exclude)
    keys = json.loads(open(translation_file, 'r').read()).keys()
    keys_found = {}

    for root, dirs, files in os.walk(rootdir):
        if any(exclude in root for exclude in excludes) or \
            re.match(regex_exclude, rootdir) or \
            re.match(regex_exclude, rootdir.replace(rootdir + '/', '')):
            continue

        for file in files:
            fullpath = os.path.join(root, file)
            if re.match(regex_exclude, fullpath) or \
                re.match(regex_exclude, fullpath.replace(rootdir + '/', '')) or \
                re.match(regex_exclude, file):
                # print(f"{fullpath} (skip)")
                continue

            if not re.match(regex_include, fullpath) and \
                not re.match(regex_include, fullpath.replace(rootdir + '/', '')) and \
                not re.match(regex_include, file):
                # print(f"{fullpath} (skip)")
                continue
            # print(f"{fullpath} ")
            with open(fullpath, 'r', encoding='utf-8') as f:
                try:
                    content = f.read()
                except UnicodeDecodeError:
                    print(f"Error reading file {fullpath}")
                    continue
                for key in keys:
                    if key in content:
                        keys_found[key] = True


    keys_not_found = set(keys) - set(keys_found.keys())
    str_keys_not_found = '\n\t'.join(list(sorted(keys_not_found)))

    if len(keys_not_found) > 0:
        print(f"Keys not found in files:\n\t{str_keys_not_found}\n")
        print(bcolors.FAIL, 'Number of keys not found:', len(keys_not_found), bcolors.ENDC)
        sys.exit(1)

    print(bcolors.OKGREEN, 'All keys found in files', bcolors.ENDC)


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
    if args.search_missing:
        search_translation_keys_in_files(args.file1, args.include, args.exclude)

if __name__ == '__main__':
    main()