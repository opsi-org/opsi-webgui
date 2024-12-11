import os
import argparse
import subprocess
import json
import sys
import urllib.request
from datetime import datetime


VERSION = '0.1.0'
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
    parser.add_argument('--versions', action='store_true', help='List all versions of a package')
    parser.add_argument('--versions-sort', action='store', help='Sort packages by: package, version, latest, published, is_outdated', default='is_outdated')
    parser.add_argument('--versions-outdated', action='store_true', help='List only outdated packages')
    # outdated-warn-days
    # outdated-error-days
    parser.add_argument('--versions-outdated-warn', action='store', help='Warn if package is outdated for x days', default=7)
    parser.add_argument('--versions-outdated-error', action='store', help='Error if package is outdated for x days', default=30)
    parser.add_argument('--update-npm', action='store_true', help='Update npm')
    parser.add_argument('--install-clean', action='store_true', help='Install packages clean')
    return parser

class VersionShower:
    @staticmethod
    def run(sort_by='is_outdated', only_outdated=False, warn_days=7, error_days=30):
        packages = VersionShower.get_installed_packages()
        packages_outdated = VersionShower.get_outdated_packages()
        if not packages:
            print("no packages found or error while fetching packages")
            return

        print("get publish time...       ", end="\r")
        results = []
        longest_values = {}
        # longest_package_name = 0
        for package_name, version in packages.items():
            # longest_package_name = max(longest_package_name, len(package_name))
            VersionShower.add_package_info(package_name, version, packages_outdated, results, only_outdated, warn_days, error_days)
            VersionShower.update_longest_values(longest_values, results[-1])
        # for each key/value in longest_values, add 1 to the value
        longest_values = {key: value + 1 for key, value in longest_values.items()}
        VersionShower.print_table(results, longest_values, sort_by)
        # if any package has color warn return 1, if any package has color error return 2
        for result in results:
            if result['color'] == bcolors.WARNING:
                sys.exit(1)
            if result['color'] == bcolors.FAIL:
                sys.exit(2)

    @staticmethod
    def update_longest_values(longest_values, result):
        for key, value in result.items():
            if key not in longest_values:
                longest_values[key] = len(str(value))
            else:
                longest_values[key] = max(longest_values[key], len(str(value)))

    @staticmethod
    def print_table(results, width, sort_by):
        packagejson = json.loads(open('package.json').read())
        header =  f"{'name':<{width['package']}}"
        header += f"{'current':<{width['version']}}"
        header += f"{'latest':<{width['latest']}} "
        header += f"{'time_diff_latest': >{width['time_diff_latest'] + 9}}"

        print(f"{header}\n{'-' * len(header)}")
        results.sort(key=lambda x: str(x[sort_by]) or '')
        for result in results:
            time_diff_latest = (str(result['time_diff_latest'] if result['time_diff_latest'] > -1 else result['time_diff_current']))  + " days ago"
            time_diff_num = width['time_diff_latest'] if result['time_diff_latest'] > result['time_diff_current'] else width['time_diff_current']

            row_current = f"{result['package']:<{width['package']}}"
            row_current += f"{result['version']:<{width['version']}}"

            row_latest = f" {result['latest']:<{width['latest']}} "
            row_latest += f"{time_diff_latest: >{time_diff_num + 9}}"
            if not result['is_outdated']:
                print(f"{result['color']}{row_current}{row_latest} {result['comment']}")
            else:
                print(f"{result['color']}{row_current}{bcolors.OKGREEN}{row_latest}{bcolors.ENDC} {result['comment']}")
            if packagejson.get('dependenciesComments', {}).get(result['_package'], '') != '':
                print(f"  -> {packagejson['dependenciesComments'][result['_package']]}")

    @staticmethod
    def add_package_info(package_name, version, packages_outdated, results, only_outdated=False, warn_days=7, error_days=30):
        latest_version = packages_outdated.get(package_name, {}).get('latest', '')
        is_outdated = latest_version != '' and version != latest_version
        if only_outdated and not is_outdated:
            return

        publish_current, published_latest = VersionShower.get_package_publish_time(package_name, version, latest_version)
        time_diff_latest = VersionShower.format_time_difference(published_latest if is_outdated else publish_current)
        time_diff_current = VersionShower.format_time_difference(publish_current)
        time_diff_latest = time_diff_latest if time_diff_latest != '' and time_diff_latest != 'unknown' and time_diff_latest != time_diff_current else -1
        results.append({
            "_package": package_name,
            "package": package_name,
            "version": version,
            "wanted": packages_outdated.get(package_name, {}).get('wanted', ''),
            "latest": latest_version,
            "is_outdated": is_outdated,
            "publish_current": publish_current,
            "published": published_latest,
            "time_diff_current": time_diff_current,
            "time_diff_latest": time_diff_latest,
            "color": bcolors.FAIL if time_diff_latest > error_days else (bcolors.WARNING if time_diff_latest > warn_days else ''),
            "comment": ""
        })
        if is_outdated and results[-1]['color'] != '':
            if package_name == 'npm' or package_name == 'node':
                results[-1]['comment'] = "update /workspace/.devcontainer/Dockerfile"
            else:
                results[-1]['comment'] = f"use 'npm install {package_name}@{latest_version}' to update"

        if package_name == 'npm' or package_name == 'node':
            results[-1]['package'] = f"# (global) {package_name:<4}"

    @staticmethod
    def get_installed_packages():
        """Ruft die Liste der installierten npm-Pakete und ihre Versionen ab."""
        print("get installed packages...", end="\r")
        try:
            result = subprocess.run(['npm', 'list', '--depth=0', '--json'],
                                stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, check=True)
            packages = json.loads(result.stdout).get('dependencies', {})
            pkgs =  {name: data['version'] for name, data in packages.items()}
            pkgs['npm'] = subprocess.run(['npm', '--version'], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, check=True).stdout.strip().replace('v', '')
            pkgs['node'] = subprocess.run(['node', '--version'], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, check=True).stdout.strip().replace('v', '')
            return pkgs
        except subprocess.CalledProcessError as e:
            print("error while fetching npm installed package list with command:", e.cmd)
            print("error message:", e.stderr)
            return {}

    @staticmethod
    def get_outdated_packages():
        """Ruft die Liste der veralteten npm-Pakete und ihre Versionen ab."""
        def _json_and_format(data):
            packages = json.loads(data)
            pkgs = {name: { 'current': data['current'], 'wanted': data['wanted'], 'latest': data['latest'] } for name, data in packages.items()}
            # special cases for npm and node:
            _npm_current = subprocess.run(['npm', '--version'], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, check=True).stdout.strip()
            _npm_latest = subprocess.run(['npm', 'view', 'npm', 'dist-tags.latest'], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, check=True).stdout.strip()
            pkgs['npm'] = { 'current': _npm_current, 'latest': _npm_latest if _npm_latest != _npm_current else ''}

            _node_current = subprocess.run(['node', '--version'], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, check=True).stdout.strip().replace('v', '')
            _node_latest = subprocess.run(['npm', 'view', 'node', 'dist-tags.latest'], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, check=True).stdout.strip()
            pkgs['node'] = { 'current': _node_current, 'latest': _node_latest if _node_latest != _node_current else ''}

            return pkgs
        print("get outdated packages...", end="\r")
        try:
            result = subprocess.run(['npm', 'outdated', '--json'],
                                stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, check=True)
            return _json_and_format(result.stdout)
        except subprocess.CalledProcessError as e:
            if e.returncode == 1 and e.stdout.startswith('{'):
                print("warning: npm outdated returned ExperimentalWarning (try to ignore)")
                return _json_and_format(e.stdout)
            print("error while fetching npm outdated package list with command:", e.cmd)
            print("error message: ", e.returncode)
            print("error message: ", e.stderr)
            return {}

    @staticmethod
    def get_package_publish_time(package_name, version, latest_version) -> tuple[str, str]:
        """Ruft den Veröffentlichungszeitpunkt eines Pakets für die angegebene Version ab."""
        url = f"https://registry.npmjs.org/{package_name}"
        if package_name == 'node':
            url = "https://nodejs.org/dist/index.json"
        try:
            with urllib.request.urlopen(url) as response:
                data = json.loads(response.read().decode('utf-8'))
                if package_name == 'node':
                    result = list(filter(lambda x:x["version"].replace('v', '')==version or x["version"].replace('v', '')==latest_version, data))
                    if len(result) == 0:
                        raise ValueError(f"no version found for {package_name}@{version} or {package_name}@{latest_version}")
                    if latest_version == '' or len(result) == 1:
                        date = result[0].get('date', '')
                        return (date, "unknown") if result[0]["version"].replace('v', '') == version else ("unknown", date)
                    if len(result) > 2:
                        raise ValueError(f"more than 2 versions found for {package_name}@{version} and {package_name}@{latest_version}: {result}")

                    res1_date, res1_ver = result[0].get('date', ''), result[0].get('version', '')
                    res2_date = result[1].get('date', '')

                    return (res1_date, res2_date) if res1_ver == version else (res2_date, res1_date)

                return data['time'].get(version, "unknown"), data['time'].get(latest_version, "unknown")
        except Exception as e:
            print(f"error while fetching publish time for {package_name}@{version}", e)
            return "unknown", "unknown"

    @staticmethod
    def format_time_difference(published_time):
        """Berechnet die Zeitdifferenz zwischen dem Veröffentlichungszeitpunkt und jetzt."""
        if not published_time:
            return "unknown"
        try:
            published_date = datetime.fromisoformat(published_time.replace('Z', ''))
            now = datetime.now()
            delta = now - published_date
            days = delta.days
            # seconds = delta.seconds
            if days > 0:
                return days
                # return f"{days: 5} days ago"
            # elif seconds >= 3600:
            #     return f"{seconds // 3600: 5} hours ago"
            # elif seconds >= 60:
            #     return f"{seconds // 60: 5} minutes ago"
            else:
                return 0
        except ValueError:
            return "unknown date format: " + published_time

def main():
    args = argparser().parse_args()
    if args.v:
        print('version ', VERSION)
        return

    current_path = os.getcwd()
    if current_path != '/workspace/frontend':
        os.chdir('/workspace/frontend')

    if args.versions:
        VersionShower.run(sort_by=args.versions_sort, only_outdated=args.versions_outdated, warn_days=args.versions_outdated_warn, error_days=args.versions_outdated_error)
    elif args.update_npm:
        subprocess.run(['npm', 'install', '-g', 'npm'], check=True)
        subprocess.run(['npm', '--version'], check=True)
    elif args.install_clean:
        subprocess.run(['npm', 'cache', 'clean', '--force'])
        subprocess.run(['rm', '-rf', 'node_modules'])
        subprocess.run(['rm', 'package-lock.json'])
        subprocess.run(['npm', 'install', '--verbose'])

if __name__ == '__main__':
    main()