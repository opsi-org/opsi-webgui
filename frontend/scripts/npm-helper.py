import os
import argparse
import subprocess
import json
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
    parser.add_argument('--versions-sort', action='store', help='Sort packages by: package, version, latest, published, is_outdated', default='published')

    parser.add_argument('--update-npm', action='store_true', help='Update npm')
    parser.add_argument('--install-clean', action='store_true', help='Install packages clean')
    return parser

class VersionShower:
    @staticmethod
    def run(sort_by='published'):
        packages = VersionShower.get_installed_packages()
        packages_outdated = VersionShower.get_outdated_packages()
        if not packages:
            print("no packages found or error while fetching packages")
            return

        print("get publish time...       ", end="\r")
        results = []
        longest_package_name = 0
        for package_name, version in packages.items():
            longest_package_name = max(longest_package_name, len(package_name))
            latest_version = packages_outdated.get(package_name, {}).get('latest', '')
            publish_time = VersionShower.get_package_publish_time(package_name, latest_version if latest_version else version)
            time_diff = VersionShower.format_time_difference(publish_time)
            results.append({
                "package": package_name,
                "version": version,
                "wanted": packages_outdated.get(package_name, {}).get('wanted', ''),
                "latest": latest_version,
                "is_outdated": packages_outdated.get(package_name, {}).get('latest', '') != '',
                "published": publish_time,
                "time_diff": time_diff
            })
            if package_name == 'npm' or package_name == 'node':
                results[-1]['package'] = f"# (global) {package_name:<4}"
                # results[-1]['package'] = f"#{package_name} (global)"
        longest_package_name += 2
        header = f"{'packagename':<{longest_package_name}}{'version':<15}{'latest':<15}{'published':<20}"
        print(header)
        print("-" * len(header))

        results.sort(key=lambda x: str(x[sort_by]) or '')
        for result in results:

            row_current = f"{result['package']:<{longest_package_name}}{result['version']:<15}"
            row_latest = f"{result['latest']:<15}{result['time_diff']:<20}"
            if result['is_outdated']:
                print(f"{bcolors.WARNING}{row_current}{bcolors.OKGREEN}{row_latest}{bcolors.ENDC}")
            else:
                print(row_current + row_latest)
            # print(f"{result['package']:<{longest_package_name}}{result['time_diff']:<20}{result['version']:<15}{result['latest']:<15}")
            # print(f"{result['package']:<{longest_package_name}}{result['time_diff']:<20}{result['version']:<15}{bcolors.WARNING}{result['latest']:<15}{bcolors.ENDC}")

    @staticmethod
    def get_installed_packages():
        """Ruft die Liste der installierten npm-Pakete und ihre Versionen ab."""
        print("get installed packages...", end="\r")
        try:
            result = subprocess.run(['npm', 'list', '--depth=0', '--json'],
                                stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, check=True)
            packages = json.loads(result.stdout).get('dependencies', {})
            pkgs =  {name: data['version'] for name, data in packages.items()}
            pkgs['npm'] = subprocess.run(['npm', '--version'], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, check=True).stdout.strip()
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

            pkgs['npm'] = { 'current': subprocess.run(['npm', '--version'], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, check=True).stdout.strip(), 'latest': subprocess.run(['npm', 'view', 'npm', 'dist-tags.latest'], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, check=True).stdout.strip()}

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
    def get_package_publish_time(package_name, version):
        """Ruft den Veröffentlichungszeitpunkt eines Pakets für die angegebene Version ab."""
        url = f"https://registry.npmjs.org/{package_name}"
        if package_name == 'node':
            url = "https://nodejs.org/dist/index.json"
        try:
            with urllib.request.urlopen(url) as response:
                data = json.loads(response.read().decode('utf-8'))
                if package_name == 'node':
                    result = list(filter(lambda x:x["version"].replace('v', '')==version,data))
                    return result[0]['date'] if result and len(result) == 1 else "unknown"

                return data['time'].get(version, "Unbekannt")
        except Exception as e:
            print(f"error while fetching publish time for {package_name}@{version}", e)
            return "unknown"

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
            seconds = delta.seconds
            if days > 0:
                return f"{days: 5} days ago"
            elif seconds >= 3600:
                return f"{seconds // 3600: 5} hours ago"
            elif seconds >= 60:
                return f"{seconds // 60: 5} minutes ago"
            else:
                return "just now"
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
        VersionShower.run(sort_by=args.versions_sort)
    elif args.update_npm:
        subprocess.run(['npm', 'install', '-g', 'npm'], check=True)
        subprocess.run(['npm', '--version'], check=True)
    elif args.install_clean:
        subprocess.run(['npm', 'cache', 'clean', '--force'])
        subprocess.run(['rm', '-rf', 'node_modules'])
        subprocess.run(['rm', '', 'package-lock.json'])
        subprocess.run(['npm', 'install', '--verbose'])

if __name__ == '__main__':
    main()