# opsiconfd is part of the desktop management solution opsi https://www.opsi.org
# Copyright (c) 2026 uib GmbH <info@uib.de>
# All rights reserved.
# License: AGPL-3.0
"""
addon opsi-portal - config
"""

import logging
import os
from pathlib import Path
from typing import Any

import yaml
from opsi.logging import get_logger
from opsiconfd.utils import Singleton  # type: ignore

from .const import ADDON_ID

PATH = f"/etc/opsi/opsiconfd-addon-{ADDON_ID}.yaml"
FILEMODE = 0o660

AUTO_CREATE_CONFIG = False  # Set to True to automatically create a default config file if it doesn't exist

DEFAULT_LDAP_AUTH = False
DEFAULT_LDAP_GROUPS = ["opsiadmin"]  # List of AD groups, user must be in at least one
DEFAULT_LOG_CONFIG_ACTIVE = False
DEFAULT_LOG_LEVEL = "INFO"
DEFAULT_LOG_FOLDER = "/var/log/opsi/opsiconfd/addons/"

logger = get_logger(ADDON_ID)

ENV_KEY_LDAP_URL = "OPSI_TEST_LDAP_URL"  # Environment variable key for LDAP URL override


class Config(metaclass=Singleton):  # pylint: disable=too-few-public-methods
	"""
	Example (default) configuration file:
	ldap_auth: True  # boolean: True if LDAP auth is active (and read from /etc/opsi/opsi.conf), False otherwise or can be an dict with the configuration
	ldap_auth_group: ["opsiadmin", "opsi-users"]  # string or list of AD groups (user must be in at least one)
	"""

	def __init__(self):
		self._data = {}
		self._mtime = 0.0
		# Allow overriding config file path via environment variable for tests
		cfg_path = os.getenv(f"OPSICONFD_ADDON_{ADDON_ID.upper()}", PATH)
		self.config_file = Path(cfg_path)
		logger.debug(f"Using config file: {self.config_file}")
		if not self.config_file.exists() and AUTO_CREATE_CONFIG:
			self._create_default_config_file()

	def set_logger(self, logger_instance: logging.Logger) -> None:
		"""Set logger instance for the Config class."""
		global logger
		logger = logger_instance

	def get_dict(self) -> dict:
		self._update_data()
		return self._data

	def update_config(self, data: dict, replace: bool = False):
		self._update_data()
		if replace:
			self._data = data
		else:
			# Merge new data with existing data
			for key, value in data.items():
				if isinstance(value, dict) and key in self._data and isinstance(self._data[key], dict):
					self._data[key].update(value)
				else:
					self._data[key] = value
		# Write updated config back to file
		try:
			self._write_config_file(self._data)
		except Exception as err:  # pylint: disable=broad-except
			logger.error(f"Failed to write config file '{self.config_file}': {err}")

	def _write_config_file(self, data: dict):
		try:
			logger.warning(f"Writing full config data to file: {data}")
			self.config_file.write_text(yaml.dump(data), encoding="utf-8")
			self.config_file.chmod(FILEMODE)
			self._update_data()
			# self._mtime = self.config_file.stat().st_mtime
			# self._data = data
		except Exception as err:  # pylint: disable=broad-except
			logger.error(f"Failed to write config file '{self.config_file}': {err}")

	def _create_default_config_file(self):
		self._data = {
			"ldap_auth": DEFAULT_LDAP_AUTH,
			"ldap_auth_group": DEFAULT_LDAP_GROUPS,  # Can be string or list
		}

		self._write_config_file(self._data)

	def _update_data(self, _logger=None):
		if not self.config_file.exists() and not AUTO_CREATE_CONFIG:
			return
		elif not self.config_file.exists():
			logger.warning(f"Config file '{self.config_file}' does not exist. Creating default config file.")
			return

		mtime = self.config_file.stat().st_mtime
		if self._mtime == mtime:
			return
		self._mtime = mtime
		try:
			self._data = yaml.safe_load(self.config_file.read_text(encoding="utf-8")) or {}
			logger.debug(f"Config data from '{self.config_file}': {self._data}")
		except Exception as err:  # pylint: disable=broad-except
			logger.error(f"Failed to read config file '{self.config_file}': {err}")

	def get_ldap_config(
		self,
	) -> dict[str, str | bool | int | list[str]]:
		##### response is always a config dict
		self._update_data()
		ldap_auth = self._data.get("ldap_auth")
		ldap_config_res: dict[str, Any] = {"active": False}

		if isinstance(ldap_auth, bool) and ldap_auth:
			### use backend session.get_auth_module
			ldap_config_res["active"] = True
			ldap_config_res["opsiconfig"] = True
			ldap_config_res["groups"] = self._get_ldap_auth_groups()
		elif isinstance(ldap_auth, dict):
			# Its already a dict (with auth data)
			ldap_config_res = {str(k): v if isinstance(v, (bool, int, list)) else str(v) for k, v in ldap_auth.items()}
			ldap_config_res["groups"] = self._get_ldap_auth_groups()
			ldap_config_res["opsiconfig"] = False
			if "active" not in ldap_config_res:
				ldap_config_res["active"] = True
			elif ldap_config_res["active"] in [False, "false", "False", "FALSE"]:
				if "ldap_url" in ldap_config_res:
					del ldap_config_res["ldap_url"]
				if "groups" in ldap_config_res:
					del ldap_config_res["groups"]
				if "bind_user" in ldap_config_res:
					del ldap_config_res["bind_user"]
				if "group_filter" in ldap_config_res:
					del ldap_config_res["group_filter"]
				if "use_member_of_rdn" in ldap_config_res:
					del ldap_config_res["use_member_of_rdn"]

		ldap_url_env = os.getenv(ENV_KEY_LDAP_URL, None)
		if ldap_url_env and ldap_config_res.get("active", False):
			ldap_config_res["ldap_url"] = ldap_url_env
			logger.debug(f"LDAP URL overridden by {ENV_KEY_LDAP_URL} env var: {ldap_url_env}")
		return ldap_config_res

	def _get_ldap_auth_groups(self, default_groups: list[str] | None = None) -> list[str]:
		"""Get LDAP auth groups from config. Supports both single group (string) and multiple groups (list).
		User must be in at least one of the configured groups.
		Config key 'ldap_auth_group' accepts both string and list.
		"""
		self._update_data()
		if default_groups is None:
			default_groups = DEFAULT_LDAP_GROUPS

		# Check for groups in ldap_auth dict
		groups_1 = None
		if isinstance(self._data.get("ldap_auth"), dict):
			groups_in_dict = self._data.get("ldap_auth", {}).get("groups")
			if groups_in_dict:
				if isinstance(groups_in_dict, str):
					groups_1 = [groups_in_dict]
				elif isinstance(groups_in_dict, list):
					groups_1 = groups_in_dict

		# Check for groups in top-level config
		# Both ldap_auth_group and ldap_auth_groups are supported
		# ldap_auth_group can be either string or list
		groups_2 = None
		ldap_auth_group = self._data.get("ldap_auth_group")
		ldap_auth_groups = self._data.get("ldap_auth_groups")

		# ldap_auth_group (singular) takes precedence and accepts both string and list
		if ldap_auth_group is not None:
			if isinstance(ldap_auth_group, str):
				groups_2 = [ldap_auth_group]
			elif isinstance(ldap_auth_group, list):
				groups_2 = ldap_auth_group
		# ldap_auth_groups (plural) as alternative
		elif ldap_auth_groups:
			if isinstance(ldap_auth_groups, str):
				groups_2 = [ldap_auth_groups]
			elif isinstance(ldap_auth_groups, list):
				groups_2 = ldap_auth_groups

		# Resolve conflicts
		if groups_1 and groups_2 and set(groups_1) != set(groups_2):
			logger.warning(
				f"Conflicting LDAP group configuration: ldap_auth.groups={groups_1!r} "
				f"vs ldap_auth_group={groups_2!r}. Using ldap_auth.groups."
			)
			return groups_1

		groups = groups_1 or groups_2 or default_groups

		if not groups:
			logger.warning("No LDAP groups configured")
			return default_groups

		logger.debug(f"Configured LDAP groups: {groups}")
		return groups

	def _get_log_config(self) -> dict[str, Any]:
		self._update_data()
		log_config = self._data.get("log", DEFAULT_LOG_CONFIG_ACTIVE)
		if isinstance(log_config, bool):
			return {"active": log_config}
		if isinstance(log_config, dict):
			return log_config

	def get_log_custom_active(self) -> bool:
		self._update_data()
		log_config = self._get_log_config()
		return bool(log_config) and log_config.get("active", DEFAULT_LOG_CONFIG_ACTIVE)

	def get_log_file_path(self, create: bool = True) -> str:
		self._update_data()
		if not self.get_log_custom_active():
			logger.warning("Custom logging is not active, using default log file path")
			return ""
		filepath = self._get_log_config().get("path", f"{DEFAULT_LOG_FOLDER}{ADDON_ID}")
		if not isinstance(filepath, str) or filepath.strip() == "":
			filepath = f"{DEFAULT_LOG_FOLDER}{ADDON_ID}/{ADDON_ID}.log"
		log_file = os.path.join(filepath, f"{ADDON_ID}.log")
		if create and not os.path.exists(log_file):
			logger.warning(f"Creating log file path: {log_file}")
			log_file_path = Path(log_file).parent
			log_file_path.mkdir(parents=True, exist_ok=True)
			Path(log_file).touch()
			# TODO: set permissions
			# Path(log_file).chmod(FILEMODE)
		return log_file

	def get_log_level(self) -> str:
		self._update_data()
		log_level = self._get_log_config().get("level", DEFAULT_LOG_LEVEL)
		if not isinstance(log_level, str) or log_level.strip() == "":
			log_level = "INFO"
		if log_level.upper() not in logging._nameToLevel:
			log_level = "INFO"
		return log_level.upper()

	def get_log_rotation_settings(self) -> tuple[int, int]:
		self._update_data()
		max_bytes = self._get_log_config().get("rotate-max-bytes", 10485760)
		backup_count = self._get_log_config().get("rotate-backup-count", 5)
		if not isinstance(max_bytes, int) or max_bytes <= 0:
			max_bytes = 10485760
		if not isinstance(backup_count, int) or backup_count < 0:
			backup_count = 5
		return max_bytes, backup_count

	def is_development(self) -> bool:
		self._update_data()
		env = self._data.get("environment", "production")
		if isinstance(env, str) and env.lower() in ["development", "dev", "develop"]:
			return True
		return False

	def get_log_detailed(self) -> bool:
		return self.is_development()

	def check(obj, key: str, expected_type: type, default: Any = None) -> Any:
		value = obj.get(key, default)
		if not isinstance(value, expected_type):
			logger.warning(
				f"Expected '{key}' to be of type {expected_type.__name__}, but got {type(value).__name__}. Using default value: {default!r}"
			)
			return default
		return value
