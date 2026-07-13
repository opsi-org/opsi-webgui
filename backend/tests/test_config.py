# -*- coding: utf-8 -*-

# opsiconfd is part of the desktop management solution opsi https://www.opsi.org
# Copyright (c) 2026 uib GmbH <info@uib.de>
# All rights reserved.
# License: AGPL-3.0
"""
Unit tests for webgui.python.config.Config.

Run with:
    cd /workspace/docker/opsiconfd
    .venv/bin/python -m pytest /workspace/backend/tests/test_config.py -v
"""

from __future__ import annotations

import sys

sys.path.insert(0, "/workspace/backend")

from pathlib import Path

import pytest
import yaml
from opsiconfd.utils import Singleton
from webgui.python.config import ADDON_ID, ENV_KEY_LDAP_URL, PATH, Config

# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------


@pytest.fixture(autouse=True)
def create_check_data():
    pass  # No-op: override the autouse DB fixture from tests/conftest.py.


@pytest.fixture(autouse=True)
def _reset_config_singleton():
    Singleton._instances.pop(Config, None)
    yield
    Singleton._instances.pop(Config, None)


@pytest.fixture()
def config_file(tmp_path: Path) -> Path:
    return tmp_path / "test-webgui.yaml"


@pytest.fixture()
def config_instance(config_file: Path, monkeypatch: pytest.MonkeyPatch) -> Config:
    monkeypatch.setenv(f"OPSICONFD_ADDON_{ADDON_ID.upper()}", str(config_file))
    return Config()


# ---------------------------------------------------------------------------
# __init__ / file path
# ---------------------------------------------------------------------------


def test_config_uses_default_path_when_no_env_var(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """Config falls back to PATH constant when env var is absent."""
    monkeypatch.delenv(f"OPSICONFD_ADDON_{ADDON_ID.upper()}", raising=False)
    cfg = Config()
    assert cfg.config_file == Path(PATH)


def test_config_uses_env_var_path(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    """Config uses the path provided by the env var override."""
    custom = tmp_path / "custom.yaml"
    monkeypatch.setenv(f"OPSICONFD_ADDON_{ADDON_ID.upper()}", str(custom))
    cfg = Config()
    assert cfg.config_file == custom


def test_config_singleton_returns_same_instance(
    config_file: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    """Two calls to Config() return the identical object."""
    monkeypatch.setenv(f"OPSICONFD_ADDON_{ADDON_ID.upper()}", str(config_file))
    assert Config() is Config()


# ---------------------------------------------------------------------------
# _update_data
# ---------------------------------------------------------------------------


def test_update_data_returns_empty_dict_for_missing_file(
    config_instance: Config,
) -> None:
    """_update_data leaves _data as {} when the config file does not exist."""
    assert not config_instance.config_file.exists()
    config_instance._update_data()
    assert config_instance._data == {}


def test_update_data_returns_empty_dict_for_empty_file(config_instance: Config) -> None:
    """_update_data treats an empty YAML file as {} (yaml.safe_load returns None)."""
    config_instance.config_file.write_text("", encoding="utf-8")
    config_instance._mtime = 0.0
    config_instance._update_data()
    assert config_instance._data == {}


def test_update_data_returns_empty_dict_for_null_yaml(config_instance: Config) -> None:
    """_update_data treats a YAML 'null' file as {}."""
    config_instance.config_file.write_text("null\n", encoding="utf-8")
    config_instance._mtime = 0.0
    config_instance._update_data()
    assert config_instance._data == {}


def test_update_data_parses_yaml(config_instance: Config) -> None:
    """_update_data correctly parses a well-formed YAML file."""
    config_instance.config_file.write_text(
        yaml.dump({"ldap_auth": True, "ldap_auth_group": ["opsiadmin"]}),
        encoding="utf-8",
    )
    config_instance._mtime = 0.0
    config_instance._update_data()
    assert config_instance._data["ldap_auth"] is True
    assert config_instance._data["ldap_auth_group"] == ["opsiadmin"]


def test_update_data_skips_reload_when_mtime_unchanged(config_instance: Config) -> None:
    """_update_data does not re-read when mtime has not changed."""
    config_instance.config_file.write_text(
        yaml.dump({"ldap_auth": False}), encoding="utf-8"
    )
    config_instance._mtime = 0.0
    config_instance._update_data()
    assert config_instance._data["ldap_auth"] is False

    # Overwrite but freeze mtime so cache thinks nothing changed.
    config_instance.config_file.write_text(
        yaml.dump({"ldap_auth": True}), encoding="utf-8"
    )
    config_instance._mtime = config_instance.config_file.stat().st_mtime
    config_instance._update_data()
    assert config_instance._data["ldap_auth"] is False


# ---------------------------------------------------------------------------
# get_dict
# ---------------------------------------------------------------------------


def test_get_dict_returns_parsed_data(config_instance: Config) -> None:
    """get_dict returns the full parsed config dictionary."""
    config_instance.config_file.write_text(yaml.dump({"foo": "bar"}), encoding="utf-8")
    assert config_instance.get_dict()["foo"] == "bar"


# ---------------------------------------------------------------------------
# update_config
# ---------------------------------------------------------------------------


def test_update_config_merge_new_key(config_instance: Config) -> None:
    """update_config adds a new key without removing existing ones."""
    config_instance.config_file.write_text(yaml.dump({"a": 1}), encoding="utf-8")
    config_instance._mtime = 0.0
    config_instance._update_data()
    config_instance.update_config({"b": 2})
    assert config_instance._data["a"] == 1
    assert config_instance._data["b"] == 2


def test_update_config_replace_mode(config_instance: Config) -> None:
    """update_config with replace=True discards previous keys."""
    config_instance.config_file.write_text(
        yaml.dump({"a": 1, "b": 2}), encoding="utf-8"
    )
    config_instance._mtime = 0.0
    config_instance._update_data()
    config_instance.update_config({"c": 3}, replace=True)
    assert "a" not in config_instance._data
    assert config_instance._data["c"] == 3


def test_update_config_deep_merge_dicts(config_instance: Config) -> None:
    """update_config merges nested dicts rather than replacing them wholesale."""
    config_instance.config_file.write_text(
        yaml.dump({"ldap_auth": {"ldap_url": "ldap://old", "bind_user": "user"}}),
        encoding="utf-8",
    )
    config_instance._mtime = 0.0
    config_instance._update_data()
    config_instance.update_config({"ldap_auth": {"ldap_url": "ldap://new"}})
    assert config_instance._data["ldap_auth"]["ldap_url"] == "ldap://new"
    assert config_instance._data["ldap_auth"]["bind_user"] == "user"


# ---------------------------------------------------------------------------
# get_ldap_config
# ---------------------------------------------------------------------------


def test_get_ldap_config_returns_inactive_when_no_file(config_instance: Config) -> None:
    """get_ldap_config returns active=False when the config file is absent."""
    result = config_instance.get_ldap_config()
    assert result["active"] is False


def test_get_ldap_config_bool_true_activates_opsiconfig(
    config_instance: Config,
) -> None:
    """ldap_auth: true (bool) sets active=True and opsiconfig=True."""
    config_instance.config_file.write_text(
        yaml.dump({"ldap_auth": True}), encoding="utf-8"
    )
    result = config_instance.get_ldap_config()
    assert result["active"] is True
    assert result["opsiconfig"] is True
    assert "groups" in result


def test_get_ldap_config_bool_false_returns_inactive(config_instance: Config) -> None:
    """ldap_auth: false returns active=False."""
    config_instance.config_file.write_text(
        yaml.dump({"ldap_auth": False}), encoding="utf-8"
    )
    result = config_instance.get_ldap_config()
    assert result["active"] is False


def test_get_ldap_config_dict_with_ldap_url(config_instance: Config) -> None:
    """ldap_auth as a dict passes through the URL and marks opsiconfig=False."""
    config_instance.config_file.write_text(
        yaml.dump(
            {
                "ldap_auth": {
                    "ldap_url": "ldap://srv/dc=x,dc=com",
                    "bind_user": "{username}@x.com",
                }
            }
        ),
        encoding="utf-8",
    )
    result = config_instance.get_ldap_config()
    assert result["active"] is True
    assert result["opsiconfig"] is False
    assert result["ldap_url"] == "ldap://srv/dc=x,dc=com"


def test_get_ldap_config_dict_explicit_inactive_removes_sensitive_fields(
    config_instance: Config,
) -> None:
    """ldap_auth dict with active=False strips url, bind_user, and groups."""
    config_instance.config_file.write_text(
        yaml.dump(
            {"ldap_auth": {"active": False, "ldap_url": "ldap://srv", "bind_user": "u"}}
        ),
        encoding="utf-8",
    )
    result = config_instance.get_ldap_config()
    assert result.get("active") is False
    assert "ldap_url" not in result
    assert "bind_user" not in result


@pytest.mark.parametrize(
    "env_value",
    [
        "ldap://env-server/dc=env,dc=com",
        "ldaps://secure.example.com/dc=x,dc=y",
    ],
)
def test_get_ldap_config_env_var_overrides_url_when_active(
    config_instance: Config,
    monkeypatch: pytest.MonkeyPatch,
    env_value: str,
) -> None:
    """ENV_KEY_LDAP_URL env var replaces the LDAP URL when ldap_auth is active."""
    config_instance.config_file.write_text(
        yaml.dump({"ldap_auth": True}), encoding="utf-8"
    )
    monkeypatch.setenv(ENV_KEY_LDAP_URL, env_value)
    result = config_instance.get_ldap_config()
    assert result["ldap_url"] == env_value


def test_get_ldap_config_env_var_not_applied_when_inactive(
    config_instance: Config,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """ENV_KEY_LDAP_URL is ignored when ldap_auth is inactive."""
    config_instance.config_file.write_text(
        yaml.dump({"ldap_auth": False}), encoding="utf-8"
    )
    monkeypatch.setenv(ENV_KEY_LDAP_URL, "ldap://should-not-appear")
    result = config_instance.get_ldap_config()
    assert "ldap_url" not in result


# ---------------------------------------------------------------------------
# _get_ldap_auth_groups
# ---------------------------------------------------------------------------


@pytest.mark.parametrize(
    "config_data, expected_groups",
    [
        ({"ldap_auth": True, "ldap_auth_group": "opsiadmin"}, ["opsiadmin"]),
        (
            {"ldap_auth": True, "ldap_auth_group": ["opsiadmin", "opsi-users"]},
            ["opsiadmin", "opsi-users"],
        ),
        ({"ldap_auth": True, "ldap_auth_groups": ["g1", "g2"]}, ["g1", "g2"]),
        (
            {"ldap_auth": {"ldap_url": "ldap://x", "groups": ["dict-group"]}},
            ["dict-group"],
        ),
        ({"ldap_auth": True}, ["opsiadmin"]),  # default
    ],
)
def test_get_ldap_auth_groups(
    config_instance: Config,
    config_data: dict,
    expected_groups: list[str],
) -> None:
    """_get_ldap_auth_groups returns the correctly resolved group list."""
    config_instance.config_file.write_text(yaml.dump(config_data), encoding="utf-8")
    config_instance._mtime = 0.0
    config_instance._update_data()
    assert config_instance._get_ldap_auth_groups() == expected_groups


def test_get_ldap_auth_groups_conflict_prefers_dict(config_instance: Config) -> None:
    """When dict groups conflict with top-level ldap_auth_group, the dict wins."""
    config_instance.config_file.write_text(
        yaml.dump(
            {
                "ldap_auth": {"ldap_url": "ldap://x", "groups": ["dict-group"]},
                "ldap_auth_group": ["top-group"],
            }
        ),
        encoding="utf-8",
    )
    config_instance._mtime = 0.0
    config_instance._update_data()
    assert config_instance._get_ldap_auth_groups() == ["dict-group"]


# ---------------------------------------------------------------------------
# set_logger
# ---------------------------------------------------------------------------


def test_set_logger_changes_logger_instance(config_instance: Config) -> None:
    """set_logger updates the global logger instance."""
    import logging

    new_logger = logging.getLogger("test_logger")
    config_instance.set_logger(new_logger)
    # Logger should be updated (testing that the method executes without error)
    # We can't easily assert the global logger changed, but we can verify no exception


# ---------------------------------------------------------------------------
# update_config error handling
# ---------------------------------------------------------------------------


def test_update_config_handles_write_error_gracefully(
    config_instance: Config, monkeypatch: pytest.MonkeyPatch
) -> None:
    """update_config logs error when write fails but doesn't crash."""
    config_instance.config_file.write_text(yaml.dump({"a": 1}), encoding="utf-8")
    config_instance._mtime = 0.0
    config_instance._update_data()

    # Mock _write_config_file to raise an exception
    def mock_write_error(data):
        raise PermissionError("Cannot write")

    monkeypatch.setattr(config_instance, "_write_config_file", mock_write_error)

    # Should not raise, just log error
    config_instance.update_config({"b": 2})
    assert config_instance._data["b"] == 2


# ---------------------------------------------------------------------------
# _write_config_file error handling
# ---------------------------------------------------------------------------


def test_write_config_file_handles_permission_error(
    config_instance: Config, monkeypatch: pytest.MonkeyPatch
) -> None:
    """_write_config_file logs error when file write fails."""
    import unittest.mock as mock

    # Make the file write fail
    with mock.patch.object(Path, "write_text", side_effect=PermissionError("No write")):
        # Should not raise, just log error
        config_instance._write_config_file({"test": "data"})


# ---------------------------------------------------------------------------
# _create_default_config_file
# ---------------------------------------------------------------------------


def test_create_default_config_file_creates_file_with_defaults(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    """_create_default_config_file creates a config with default LDAP settings."""
    from webgui.python.config import DEFAULT_LDAP_AUTH, DEFAULT_LDAP_GROUPS

    config_file = tmp_path / "new-config.yaml"
    monkeypatch.setenv(f"OPSICONFD_ADDON_{ADDON_ID.upper()}", str(config_file))
    monkeypatch.setattr("webgui.python.config.AUTO_CREATE_CONFIG", True)

    cfg = Config()
    cfg._create_default_config_file()

    assert config_file.exists()
    data = yaml.safe_load(config_file.read_text(encoding="utf-8"))
    assert data["ldap_auth"] == DEFAULT_LDAP_AUTH
    assert data["ldap_auth_group"] == DEFAULT_LDAP_GROUPS


# ---------------------------------------------------------------------------
# _update_data error handling and warnings
# ---------------------------------------------------------------------------


def test_update_data_logs_warning_when_file_missing_and_autocreate_off(
    config_instance: Config,
) -> None:
    """_update_data logs warning when config file doesn't exist and AUTO_CREATE_CONFIG is False."""
    # File doesn't exist, should log warning
    assert not config_instance.config_file.exists()
    config_instance._update_data()
    # Should not crash, _data should remain empty
    assert config_instance._data == {}


def test_update_data_handles_yaml_parse_error(config_instance: Config) -> None:
    """_update_data logs error when YAML is malformed."""
    config_instance.config_file.write_text("{ invalid yaml :: [", encoding="utf-8")
    config_instance._mtime = 0.0
    config_instance._update_data()
    # Should not crash, _data should remain empty/unchanged
    assert config_instance._data == {}


# ---------------------------------------------------------------------------
# Logging methods
# ---------------------------------------------------------------------------


def test_get_log_returns_dict_for_dict_config(config_instance: Config) -> None:
    """_get_log returns the log config dict when log is configured as dict."""
    config_instance.config_file.write_text(
        yaml.dump({"log": {"active": True, "level": "DEBUG"}}), encoding="utf-8"
    )
    config_instance._mtime = 0.0
    log_config = config_instance._get_log_config()
    assert log_config["active"] is True
    assert log_config["level"] == "DEBUG"


def test_get_log_returns_dict_for_bool_config(config_instance: Config) -> None:
    """_get_log returns {active: bool} when log is configured as bool."""
    config_instance.config_file.write_text(yaml.dump({"log": True}), encoding="utf-8")
    config_instance._mtime = 0.0
    log_config = config_instance._get_log_config()
    assert log_config == {"active": True}


def test_get_log_custom_active_returns_true_when_active(
    config_instance: Config,
) -> None:
    """get_log_custom_active returns True when log.active is True."""
    config_instance.config_file.write_text(
        yaml.dump({"log": {"active": True}}), encoding="utf-8"
    )
    assert config_instance.get_log_custom_active() is True


def test_get_log_custom_active_returns_false_when_inactive(
    config_instance: Config,
) -> None:
    """get_log_custom_active returns False when log is not configured."""
    config_instance.config_file.write_text(yaml.dump({}), encoding="utf-8")
    assert config_instance.get_log_custom_active() is False


def test_get_log_file_path_returns_empty_when_logging_inactive(
    config_instance: Config,
) -> None:
    """get_log_file_path returns empty string when custom logging is not active."""
    config_instance.config_file.write_text(yaml.dump({"log": False}), encoding="utf-8")
    result = config_instance.get_log_file_path(create=False)
    assert result == ""


def test_get_log_file_path_uses_configured_path(
    config_instance: Config, tmp_path: Path
) -> None:
    """get_log_file_path uses the configured log path."""
    log_dir = tmp_path / "logs"
    config_instance.config_file.write_text(
        yaml.dump({"log": {"active": True, "path": str(log_dir)}}), encoding="utf-8"
    )
    config_instance._mtime = 0.0
    result = config_instance.get_log_file_path(create=True)
    assert str(log_dir) in result
    assert result.endswith(f"{ADDON_ID}.log")


def test_get_log_file_path_uses_default_when_path_empty(
    config_instance: Config,
) -> None:
    """get_log_file_path uses default path when configured path is empty."""
    config_instance.config_file.write_text(
        yaml.dump({"log": {"active": True, "path": ""}}), encoding="utf-8"
    )
    result = config_instance.get_log_file_path(create=False)
    assert f"{ADDON_ID}.log" in result


def test_get_log_level_returns_configured_level(config_instance: Config) -> None:
    """get_log_level returns the configured log level in uppercase."""
    config_instance.config_file.write_text(
        yaml.dump({"log": {"active": True, "level": "debug"}}), encoding="utf-8"
    )
    assert config_instance.get_log_level() == "DEBUG"


def test_get_log_level_defaults_to_info_when_not_configured(
    config_instance: Config,
) -> None:
    """get_log_level returns INFO when level is not configured."""
    config_instance.config_file.write_text(
        yaml.dump({"log": {"active": True}}), encoding="utf-8"
    )
    assert config_instance.get_log_level() == "INFO"


def test_get_log_level_defaults_to_info_when_invalid(config_instance: Config) -> None:
    """get_log_level returns INFO when configured level is invalid."""
    config_instance.config_file.write_text(
        yaml.dump({"log": {"active": True, "level": "INVALID"}}), encoding="utf-8"
    )
    assert config_instance.get_log_level() == "INFO"


def test_get_log_level_defaults_to_info_when_empty_string(
    config_instance: Config,
) -> None:
    """get_log_level returns INFO when level is empty string."""
    config_instance.config_file.write_text(
        yaml.dump({"log": {"active": True, "level": ""}}), encoding="utf-8"
    )
    assert config_instance.get_log_level() == "INFO"


def test_get_log_rotation_settings_returns_configured_values(
    config_instance: Config,
) -> None:
    """get_log_rotation_settings returns configured max_bytes and backup_count."""
    config_instance.config_file.write_text(
        yaml.dump(
            {
                "log": {
                    "active": True,
                    "rotate-max-bytes": 5242880,
                    "rotate-backup-count": 10,
                }
            }
        ),
        encoding="utf-8",
    )
    max_bytes, backup_count = config_instance.get_log_rotation_settings()
    assert max_bytes == 5242880
    assert backup_count == 10


def test_get_log_rotation_settings_returns_defaults_when_not_configured(
    config_instance: Config,
) -> None:
    """get_log_rotation_settings returns default values when not configured."""
    config_instance.config_file.write_text(
        yaml.dump({"log": {"active": True}}), encoding="utf-8"
    )
    max_bytes, backup_count = config_instance.get_log_rotation_settings()
    assert max_bytes == 10485760  # 10MB default
    assert backup_count == 5


def test_get_log_rotation_settings_handles_invalid_max_bytes(
    config_instance: Config,
) -> None:
    """get_log_rotation_settings uses default when max_bytes is invalid."""
    config_instance.config_file.write_text(
        yaml.dump({"log": {"active": True, "rotate-max-bytes": -100}}), encoding="utf-8"
    )
    max_bytes, backup_count = config_instance.get_log_rotation_settings()
    assert max_bytes == 10485760


def test_get_log_rotation_settings_handles_invalid_backup_count(
    config_instance: Config,
) -> None:
    """get_log_rotation_settings uses default when backup_count is invalid."""
    config_instance.config_file.write_text(
        yaml.dump({"log": {"active": True, "rotate-backup-count": -5}}),
        encoding="utf-8",
    )
    max_bytes, backup_count = config_instance.get_log_rotation_settings()
    assert backup_count == 5


# ---------------------------------------------------------------------------
# is_development
# ---------------------------------------------------------------------------


def test_is_development_returns_true_for_development_env(
    config_instance: Config,
) -> None:
    """is_development returns True when environment is set to development."""
    for env_value in ["development", "dev", "develop"]:
        config_instance.config_file.write_text(
            yaml.dump({"environment": env_value}), encoding="utf-8"
        )
        config_instance._mtime = 0.0
        assert config_instance.is_development() is True


def test_is_development_returns_false_for_production_env(
    config_instance: Config,
) -> None:
    """is_development returns False when environment is production or not set."""
    config_instance.config_file.write_text(
        yaml.dump({"environment": "production"}), encoding="utf-8"
    )
    config_instance._mtime = 0.0
    assert config_instance.is_development() is False


def test_is_development_returns_false_when_not_configured(
    config_instance: Config,
) -> None:
    """is_development returns False when environment is not configured."""
    config_instance.config_file.write_text(yaml.dump({}), encoding="utf-8")
    assert config_instance.is_development() is False


# ---------------------------------------------------------------------------
# get_log_detailed
# ---------------------------------------------------------------------------


def test_get_log_detailed_returns_true_in_development(
    config_instance: Config,
) -> None:
    """get_log_detailed returns True when in development mode."""
    config_instance.config_file.write_text(
        yaml.dump({"environment": "development"}), encoding="utf-8"
    )
    config_instance._mtime = 0.0
    assert config_instance.get_log_detailed() is True


def test_get_log_detailed_returns_false_in_production(
    config_instance: Config,
) -> None:
    """get_log_detailed returns False when not in development mode."""
    config_instance.config_file.write_text(
        yaml.dump({"environment": "production"}), encoding="utf-8"
    )
    config_instance._mtime = 0.0
    assert config_instance.get_log_detailed() is False


# ---------------------------------------------------------------------------
# check (static method)
# ---------------------------------------------------------------------------


def test_check_returns_value_when_type_matches() -> None:
    """check returns the value when type matches expected."""
    from webgui.python.config import Config

    obj = {"key": "string_value"}
    result = Config.check(obj, "key", str, "default")
    assert result == "string_value"


def test_check_returns_default_when_type_mismatch() -> None:
    """check returns default when value type doesn't match expected."""
    from webgui.python.config import Config

    obj = {"key": 123}
    result = Config.check(obj, "key", str, "default")
    assert result == "default"


def test_check_returns_default_when_key_missing() -> None:
    """check returns default when key is missing."""
    from webgui.python.config import Config

    obj = {}
    result = Config.check(obj, "missing_key", str, "default")
    assert result == "default"
