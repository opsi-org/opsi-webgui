import json
import argparse
import os
import re
import sys
from collections import defaultdict


VERSION = '0.2.0'

# Ordnerpfade definieren
BASE_DIR = './'
PAGES_DIR = 'pages/'
COMPONENTS_DIR = 'components/'
COMPOSABLES_DIR = 'composables/'
UTILS_DIR = 'utils/'
LAYOUTS_DIR = 'layouts/'

# Speichert Abhängigkeiten zwischen Komponenten
component_dependencies = defaultdict(set)
quiet = True
file_to_folder = {}
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
    parser.add_argument('-v', action='store_true', help='Print current version')
    parser.add_argument('-d', '--detailed', action='store_false', help='Print current version')
    return parser

def myprint(*args, **kwargs):
    if not quiet or (len(args) > 0 and args[0] == bcolors.FAIL):
        print(*args, **kwargs)

def file_to_path(path, rm_prefix='components/'):
    if path.startswith(rm_prefix):
        path = path[len(rm_prefix):]
    parts = path.split(os.sep)
    last_part = parts[-1].replace('.vue', '')
    path = ''.join(part[0].capitalize() + part[1:] for part in parts[:-1])
    return last_part, path

def path_to_id(path, rm_prefix='components/', location=None):
    if path.endswith('.vue'):
        path = path[:-4]
    if path.startswith('~'):
        path = path[2:]
    if path.startswith(rm_prefix):
        path = path[len(rm_prefix):]
    if path.startswith('.') and location:
        path = os.path.join(location, path)
    # Normalisiere den Pfad
    normalized_path = os.path.normpath(path)
    # Teile den Pfad in Teile und konkateniere sie
    parts = normalized_path.split(os.sep)

    last_part = parts[-1].replace('.vue', '')
    pid = ''.join(part[0].capitalize() + part[1:] for part in parts[:-1]) + last_part

    return pid

def collect_vue_files(directory):
    """Sammelt alle .vue Dateien in einem Verzeichnis rekursiv"""
    vue_files = []
    for root, _, files in os.walk(directory):
        for file in files:
            if file.endswith('.vue') and not file.endswith('.story.vue'):
                vue_files.append(os.path.join(root, file))
    myprint(bcolors.OKBLUE, 'found', len(vue_files), 'files in folder', directory, bcolors.ENDC)

    all_vue_files = {}
    all_vue_files.update({path_to_id(file, directory): False for file in vue_files if not file.startswith('pages') })
    return vue_files, all_vue_files

def extract_used_components(file_path):
    """Analysiert eine Vue-Datei und extrahiert alle verwendeten Komponenten aus dem <template>-Tag"""
    component_usage_pattern = r'<([A-Z][\w\d]*)'
    used_components = set()
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
        template_match = re.search(r'<template([\s\S]*?)(?:</script|$)', content)
        if template_match:
            template_content = template_match.group(1)
            matches = re.findall(component_usage_pattern, template_content)
            used_components.update(matches)
    return used_components
def extract_used_components_in_script(file_path):
    """Analysiert eine Vue-Datei und extrahiert alle verwendeten Komponenten aus dem <script>-Tag. importiert mit from '...';"""
    component_usage_pattern = r"""\s*from\s*['\"]([^'\"]+\.vue)['\"]"""
    used_components = set()

    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
        # Extrahiere nur den Inhalt des <template>-Tags
        template_match = re.search(r'<script([\s\S]*?)(?:</script|$)', content)
        if template_match:
            template_content = template_match.group(1)
            # Suche nach Komponenten-Namen im Template-Inhalt
            matches = re.findall(component_usage_pattern, template_content)
            myprint(bcolors.WARNING, 'found', len(matches), 'components in file', file_path, ':', matches, bcolors.ENDC)
            file, folder = file_to_path(file_path)
            matches = [path_to_id(match, location=folder) for match in matches]
            myprint(bcolors.WARNING, 'found', len(matches), 'components in file', file_path, ':', matches, bcolors.ENDC)
            used_components.update(matches)
    # myprint(bcolors.OKGREEN, 'found', len(used_components), 'components in file', file_path, ':', used_components, bcolors.ENDC)
    return used_components
def extract_used_layouts(file_path, prefix='Layouts'):
    """Analysiert eine Vue-Datei und extrahiert alle verwendeten Layouts aus dem <script>-Tag"""
    pattern = r"definePageMeta\s*\(\s*\{\s*layout\s*:\s*['\"]([^'\"]+)['\"]\s*\}\s*\)" # definePageMeta({ layout: 'auth' })

    used_layouts = set()

    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
        # Extrahiere nur den Inhalt des <template>-Tags
        template_match = re.search(r'<script([\s\S]*?)</script>', content)
        if template_match:
            template_content = template_match.group(1)

            # Suche nach Komponenten-Namen im Template-Inhalt
            matches = re.findall(pattern, template_content)
            if matches:
                matches = [f'{prefix}{match}' for match in matches]
            used_layouts.update(matches)


    myprint(bcolors.OKGREEN, 'found', len(used_layouts), 'layouts in file', file_path, ':', used_layouts, bcolors.ENDC)
    return used_layouts


def map_component_dependencies():
    """Erstellt eine Karte von Abhängigkeiten zwischen Komponenten rekursiv"""
    # Sammle alle Komponenten-Dateien
    component_files, _ = collect_vue_files(COMPONENTS_DIR)
    layout_files, _ = collect_vue_files(LAYOUTS_DIR)
    component_files.extend(layout_files)
    myprint(bcolors.OKBLUE, 'found', len(component_files), 'vue files: ', component_files, bcolors.ENDC)

    # Analysiere jede Komponente und finde ihre Abhängigkeiten
    for file_path in sorted(component_files):
        file_id = path_to_id(file_path)
        used_components = extract_used_components(file_path)
        # used_components.update(extract_used_layouts(file_path))
        used_components.update(extract_used_components_in_script(file_path))
        component_dependencies[file_id].update(used_components)
        myprint(bcolors.OKCYAN, 'analyzing', file_id, 'in file', file_path, ':', used_components, bcolors.ENDC)

    myprint(bcolors.OKGREEN, 'found', len(component_dependencies), 'dependencies', component_dependencies, bcolors.ENDC)

def resolve_dependencies(component_name, resolved=None, seen=None, space=""):
    """Verfolgt rekursiv alle Abhängigkeiten einer Komponente"""
    if resolved is None:
        resolved = set()
    if seen is None:
        seen = set()

    seen.add(component_name)
    dependencies = component_dependencies.get(component_name, [])
    # myprint(space, component_name, '->', dependencies)
    for dependency in dependencies:
        # dep_id = file_to_folder.get(dependency, '') + dependency
        # myprint(bcolors.WARNING, space, component_name, '->', dependency, ' => ', dep_id, bcolors.ENDC)
        if dependency not in resolved:
            resolved.add(dependency)
            if dependency not in seen:
                resolve_dependencies(dependency, resolved, seen, space + '  ')

    return resolved

def get_components_in_layouts(page_file = None, used_layouts=None):
    all_used_components = set()
    if not used_layouts:
        if not page_file:
            raise ValueError('page_file or used_layouts must be provided')
        used_layouts = extract_used_layouts(page_file)
    for layout in used_layouts:
        all_used_components.add(layout)
        resolved_dependencies = resolve_dependencies(layout)
        all_used_components.update(resolved_dependencies)
    return all_used_components

def analyze_pages():
    """Analysiert die Seiten und findet alle verwendeten Komponenten"""
    page_files, _ = collect_vue_files(PAGES_DIR)

    all_used_components = set()
    all_used_components.update(get_components_in_layouts(used_layouts=['Layoutsdefault']))

    for page_file in page_files:
        used_in_page = extract_used_components(page_file)
        myprint(bcolors.OKGREEN, 'found', len(used_in_page), 'components in file', page_file, ':', used_in_page, bcolors.ENDC)
        for component in used_in_page:
            # Verfolge rekursiv die Abhängigkeiten
            all_used_components.add(component)
            resolved_dependencies = resolve_dependencies(component)
            all_used_components.update(resolved_dependencies)

        # if "definePageMeta({ layout: 'xxxx' }) in pages script section
        all_used_components.update(get_components_in_layouts(page_file=page_file))
        # used_layouts = extract_used_layouts(page_file)
        # for layout in used_layouts:
        #     all_used_components.add(layout)
        #     resolved_dependencies = resolve_dependencies(layout)
        #     all_used_components.update(resolved_dependencies)
        # myprint(bcolors.OKGREEN, 'found', len(used_layouts), 'layouts in file', page_file, ':', used_layouts, bcolors.ENDC)
        myprint()



    return all_used_components

def main():
    args = argparser().parse_args()

    current_path = os.getcwd()
    path, frontenddir = os.path.split(current_path)
    if not args.detailed:
        global quiet
        quiet = False
    if frontenddir != 'frontend':

        myprint('Current directory is not frontend: ', path + ' --> ' + frontenddir + "... try change dir to /workspace/frontend")
        os.chdir('/workspace/frontend')

    if args.v:
        myprint(VERSION)
        return
    map_component_dependencies()
    # # Erstelle die Abhängigkeitskarte für alle Komponenten
    used_components_in_pages = analyze_pages()



    # map_component_dependencies()
    _, all_vue_files = collect_vue_files(COMPONENTS_DIR)
    _, all_layouts = collect_vue_files(LAYOUTS_DIR)
    # Analysiere Seiten und finde alle verwendeten Komponenten

    # Liste alle Komponenten im Projekt auf
    all_components = all_vue_files.keys()
    myprint(f"Alle Komponenten: {len(all_components)}")

    # Finde ungenutzte Komponenten
    unused_components = all_components - used_components_in_pages
    myprint(f"Benutzte Komponenten: {len(used_components_in_pages)}: {sorted(list(used_components_in_pages))}")
    myprint()
    myprint(f"Unbenutzte Komponenten: {len(unused_components)}: {sorted(list(unused_components))}")

    if len(unused_components) > 0:
        myprint(bcolors.FAIL, 'Number of unused components:', len(unused_components), unused_components, bcolors.ENDC)

if __name__ == '__main__':
    main()