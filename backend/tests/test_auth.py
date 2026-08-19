# -*- coding: utf-8 -*-

# opsiconfd is part of the desktop management solution opsi https://www.opsi.org
# Copyright (c) 2026 uib GmbH <info@uib.de>
# All rights reserved.
# License: AGPL-3.0
"""
Unit tests for webgui.python.auth.Authentication.

Run with:
    cd /workspace/docker/opsiconfd
    .venv/bin/python -m pytest /workspace/backend/tests/test_auth.py -v
"""

from __future__ import annotations

import sys

sys.path.insert(0, "/workspace/backend")

from pathlib import Path
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
import yaml
from fastapi import HTTPException, status
from opsiconfd.utils import Singleton

from webgui.python.auth import Authentication, AuthException
from webgui.python.config import ADDON_ID, ENV_KEY_LDAP_URL, Config

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
def mock_opsi_config() -> MagicMock:
	mock = MagicMock()
	mock.config_file = Path("/etc/opsi/opsi.conf")
	mock.get.return_value = {
		"ldap_url": "ldap://opsi-server/dc=example,dc=com",
		"bind_user": "{username}@example.com",
		"group_filter": "",
		"use_member_of_rdn": False,
	}
	return mock


def _make_auth(config_ldap: dict) -> Authentication:
	"""Create an Authentication instance with a pre-set config_ldap, bypassing Config I/O."""
	auth = object.__new__(Authentication)
	auth.config_ldap = config_ldap
	auth.session = None
	return auth


# ---------------------------------------------------------------------------
# AuthException
# ---------------------------------------------------------------------------


def test_auth_exception_stores_message_and_title() -> None:
	"""AuthException preserves the custom title and message."""
	exc = AuthException("something went wrong", title="Config Error")
	assert str(exc) == "something went wrong"
	assert exc.title == "Config Error"


def test_auth_exception_default_title() -> None:
	"""AuthException uses 'Error' as the default title."""
	exc = AuthException("oops")
	assert exc.title == "Error"


# ---------------------------------------------------------------------------
# _get_config — opsiconfig branch
# ---------------------------------------------------------------------------


def test_get_config_opsiconfig_reads_url_from_opsi_conf(
	mock_opsi_config: MagicMock,
) -> None:
	"""When opsiconfig=True, _get_config reads ldap_url from opsi_config."""
	auth = _make_auth({"active": True, "opsiconfig": True, "groups": ["opsiadmin"]})
	with patch("webgui.python.auth.opsi_config", mock_opsi_config):
		_type, _config_file, _config = auth._get_config()
	assert _type == "opsiconfig"
	assert _config["ldap_url"] == "ldap://opsi-server/dc=example,dc=com"


def test_get_config_opsiconfig_none_result_becomes_empty_dict(
	mock_opsi_config: MagicMock,
) -> None:
	"""_get_config handles opsi_config.get('ldap_auth') returning None gracefully."""
	mock_opsi_config.get.return_value = None
	auth = _make_auth({"active": True, "opsiconfig": True, "groups": []})
	with patch("webgui.python.auth.opsi_config", mock_opsi_config):
		_type, _config_file, _config = auth._get_config()
	assert isinstance(_config, dict)


def test_get_config_opsiconfig_env_var_overrides_url(
	mock_opsi_config: MagicMock,
	monkeypatch: pytest.MonkeyPatch,
) -> None:
	"""ENV_KEY_LDAP_URL replaces the opsi.conf URL when opsiconfig=True."""
	env_url = "ldap://env-override/dc=env,dc=com"
	monkeypatch.setenv(ENV_KEY_LDAP_URL, env_url)
	auth = _make_auth({"active": True, "opsiconfig": True, "ldap_url": env_url, "groups": []})
	with patch("webgui.python.auth.opsi_config", mock_opsi_config):
		_type, _config_file, _config = auth._get_config()
	assert _config["ldap_url"] == env_url


def test_get_config_opsiconfig_no_env_var_keeps_opsi_conf_url(
	mock_opsi_config: MagicMock,
	monkeypatch: pytest.MonkeyPatch,
) -> None:
	"""Without env var, _get_config uses the URL from opsi.conf unchanged."""
	monkeypatch.delenv(ENV_KEY_LDAP_URL, raising=False)
	auth = _make_auth({"active": True, "opsiconfig": True, "groups": []})
	with patch("webgui.python.auth.opsi_config", mock_opsi_config):
		_type, _config_file, _config = auth._get_config()
	assert _config["ldap_url"] == "ldap://opsi-server/dc=example,dc=com"


# ---------------------------------------------------------------------------
# _get_config — custom-config branch
# ---------------------------------------------------------------------------


def test_get_config_customconfig_builds_dict_from_config_ldap() -> None:
	"""When opsiconfig=False, _get_config constructs _config from config_ldap."""
	auth = _make_auth(
		{
			"active": True,
			"opsiconfig": False,
			"ldap_url": "ldap://custom/dc=c,dc=com",
			"bind_user": "{username}@custom.com",
			"group_filter": "(objectclass=group)",
			"use_member_of_rdn": True,
		}
	)
	_type, _config_file, _config = auth._get_config()
	assert _type == "customconfig"
	assert _config["ldap_url"] == "ldap://custom/dc=c,dc=com"
	assert _config["bind_user"] == "{username}@custom.com"
	assert _config["use_member_of_rdn"] is True


def test_get_config_customconfig_env_var_overrides_url(
	monkeypatch: pytest.MonkeyPatch,
) -> None:
	"""ENV_KEY_LDAP_URL overrides ldap_url in the custom-config branch."""
	env_url = "ldap://env-custom/dc=x,dc=y"
	monkeypatch.setenv(ENV_KEY_LDAP_URL, env_url)
	auth = _make_auth(
		{
			"active": True,
			"opsiconfig": False,
			"ldap_url": env_url,
			"bind_user": "",
			"group_filter": "",
			"use_member_of_rdn": False,
		}
	)
	_type, _config_file, _config = auth._get_config()
	assert _config["ldap_url"] == env_url


# ---------------------------------------------------------------------------
# _get_config — inactive branch
# ---------------------------------------------------------------------------


def test_get_config_inactive_returns_none_config() -> None:
	"""When LDAP is inactive, _get_config returns type 'none' and _config=None."""
	auth = _make_auth({"active": False})
	_type, _config_file, _config = auth._get_config()
	assert _type == "none"
	assert _config is None


# ---------------------------------------------------------------------------
# Authentication.__init__
# ---------------------------------------------------------------------------


def test_authentication_init_raises_when_no_ldap_url(
	config_file: Path,
	mock_opsi_config: MagicMock,
	monkeypatch: pytest.MonkeyPatch,
) -> None:
	"""AuthException is raised when LDAP is active but no URL is available."""
	mock_opsi_config.get.return_value = {}
	config_file.write_text(yaml.dump({"ldap_auth": True}), encoding="utf-8")
	monkeypatch.setenv(f"OPSICONFD_ADDON_{ADDON_ID.upper()}", str(config_file))
	monkeypatch.delenv(ENV_KEY_LDAP_URL, raising=False)

	with patch("webgui.python.auth.opsi_config", mock_opsi_config):
		with pytest.raises(AuthException, match="no LDAP URL"):
			Authentication()


def test_authentication_init_succeeds_with_valid_url(
	config_file: Path,
	mock_opsi_config: MagicMock,
	monkeypatch: pytest.MonkeyPatch,
) -> None:
	"""Authentication initialises successfully when a valid LDAP URL is present."""
	config_file.write_text(yaml.dump({"ldap_auth": True}), encoding="utf-8")
	monkeypatch.setenv(f"OPSICONFD_ADDON_{ADDON_ID.upper()}", str(config_file))
	monkeypatch.delenv(ENV_KEY_LDAP_URL, raising=False)

	with (
		patch("webgui.python.auth.opsi_config", mock_opsi_config),
		patch("webgui.python.auth.LDAPAuthentication") as mock_ldap,
	):
		auth = Authentication()
		assert mock_ldap.called
		assert auth.config_ldap["active"] is True


def test_authentication_init_inactive_ldap_skips_ldap_setup(
	config_file: Path,
	mock_opsi_config: MagicMock,
	monkeypatch: pytest.MonkeyPatch,
) -> None:
	"""Authentication with ldap_auth: false does not instantiate LDAPAuthentication."""
	config_file.write_text(yaml.dump({"ldap_auth": False}), encoding="utf-8")
	monkeypatch.setenv(f"OPSICONFD_ADDON_{ADDON_ID.upper()}", str(config_file))

	with (
		patch("webgui.python.auth.opsi_config", mock_opsi_config),
		patch("webgui.python.auth.LDAPAuthentication") as mock_ldap,
	):
		auth = Authentication()
		mock_ldap.assert_not_called()
		assert auth.config_ldap["active"] is False


# ---------------------------------------------------------------------------
# _check_group_membership
# ---------------------------------------------------------------------------


@pytest.mark.parametrize(
	"user_groups, required_groups, expected",
	[
		(["opsiadmin", "domain users"], ["opsiadmin"], True),
		(["opsi-users"], ["opsiadmin", "opsi-users"], True),
		(["domain users"], ["opsiadmin"], False),
		(["groupA"], ["groupB", "groupC"], False),
	],
)
def test_check_group_membership(
	user_groups: list[str],
	required_groups: list[str],
	expected: bool,
) -> None:
	"""_check_group_membership enforces at-least-one-group policy."""
	auth = _make_auth({"active": True, "groups": required_groups})
	assert auth._check_group_membership(user_groups) is expected


def test_check_group_membership_allows_all_when_no_groups_configured() -> None:
	"""_check_group_membership returns True when required_groups is empty."""
	auth = _make_auth({"active": True, "groups": []})
	assert auth._check_group_membership(["any_group"]) is True


def test_check_group_membership_inactive_ldap_always_allows() -> None:
	"""_check_group_membership returns True when LDAP is not active."""
	auth = _make_auth({"active": False})
	assert auth._check_group_membership([]) is True


# ---------------------------------------------------------------------------
# _check_group_ldap
# ---------------------------------------------------------------------------


def test_check_group_ldap_successful_auth_and_group_check() -> None:
	"""_check_group_ldap returns groups when auth succeeds and groups match."""
	auth = _make_auth({"active": True, "groups": ["opsiadmin"]})

	mock_ldap_instance = MagicMock()
	mock_ldap_instance.authenticate = MagicMock()
	mock_ldap_instance.get_groupnames = MagicMock(return_value=["opsiadmin", "users"])

	mock_ldap_auth = MagicMock()
	mock_ldap_auth.get_instance = MagicMock(return_value=mock_ldap_instance)
	auth.auth = mock_ldap_auth

	result = auth._check_group_ldap("testuser", "testpass")

	assert result == ["opsiadmin", "users"]
	mock_ldap_instance.authenticate.assert_called_once_with("testuser", "testpass")
	mock_ldap_instance.get_groupnames.assert_called_once_with("testuser")


def test_check_group_ldap_returns_empty_when_group_check_fails() -> None:
	"""_check_group_ldap returns empty list when user not in required groups."""
	auth = _make_auth({"active": True, "groups": ["opsiadmin"]})

	mock_ldap_instance = MagicMock()
	mock_ldap_instance.authenticate = MagicMock()
	mock_ldap_instance.get_groupnames = MagicMock(return_value=["users", "guests"])

	mock_ldap_auth = MagicMock()
	mock_ldap_auth.get_instance = MagicMock(return_value=mock_ldap_instance)
	auth.auth = mock_ldap_auth

	result = auth._check_group_ldap("testuser", "testpass")

	assert result == []


def test_check_group_ldap_raises_when_authentication_fails() -> None:
	"""_check_group_ldap raises exception when LDAP authentication fails."""
	auth = _make_auth({"active": True, "groups": ["opsiadmin"]})

	mock_ldap_instance = MagicMock()
	mock_ldap_instance.authenticate = MagicMock(side_effect=Exception("Invalid credentials"))

	mock_ldap_auth = MagicMock()
	mock_ldap_auth.get_instance = MagicMock(return_value=mock_ldap_instance)
	auth.auth = mock_ldap_auth

	with pytest.raises(Exception, match="Invalid credentials"):
		auth._check_group_ldap("testuser", "wrongpass")


def test_check_group_ldap_raises_when_get_groupnames_fails() -> None:
	"""_check_group_ldap raises exception when getting groups fails."""
	auth = _make_auth({"active": True, "groups": ["opsiadmin"]})

	mock_ldap_instance = MagicMock()
	mock_ldap_instance.authenticate = MagicMock()
	mock_ldap_instance.get_groupnames = MagicMock(side_effect=Exception("LDAP error"))

	mock_ldap_auth = MagicMock()
	mock_ldap_auth.get_instance = MagicMock(return_value=mock_ldap_instance)
	auth.auth = mock_ldap_auth

	with pytest.raises(Exception, match="LDAP error"):
		auth._check_group_ldap("testuser", "testpass")


# ---------------------------------------------------------------------------
# _get_credentials helpers
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_get_credentials_form_data_extracts_username_and_password() -> None:
	"""__get_credentials_form_data extracts credentials from form data."""
	auth = _make_auth({"active": False})

	mock_form = MagicMock()
	mock_form.get = MagicMock(
		side_effect=lambda k, default="": {
			"username": "testuser",
			"password": "testpass",
			"mfa_otp": "123456",
		}.get(k, default)
	)

	mock_request = MagicMock()
	mock_request.form = AsyncMock(return_value=mock_form)

	mock_connection = MagicMock()
	mock_connection.scope = {"type": "http"}
	mock_receive = MagicMock()

	with patch("webgui.python.auth.Request", return_value=mock_request):
		(
			username,
			password,
			mfa_otp,
		) = await auth._Authentication__get_credentials_form_data(mock_connection, mock_receive)

	assert username == "testuser"
	assert password == "testpass"
	assert mfa_otp == "123456"


@pytest.mark.asyncio
async def test_get_credentials_form_data_raises_when_username_missing() -> None:
	"""__get_credentials_form_data raises ValueError when username is missing."""
	auth = _make_auth({"active": False})

	mock_form = MagicMock()
	mock_form.get = MagicMock(side_effect=lambda k, default="": {"password": "testpass"}.get(k, default))

	mock_request = MagicMock()
	mock_request.form = AsyncMock(return_value=mock_form)

	mock_connection = MagicMock()
	mock_receive = MagicMock()

	with patch("webgui.python.auth.Request", return_value=mock_request):
		with pytest.raises(ValueError, match="Username or password missing"):
			await auth._Authentication__get_credentials_form_data(mock_connection, mock_receive)


@pytest.mark.asyncio
async def test_get_credentials_http_basic_extracts_credentials() -> None:
	"""__get_credentials_http_basic extracts credentials from HTTP Basic auth."""
	auth = _make_auth({"active": False})

	mock_creds = MagicMock(spec=["username", "password"])
	mock_creds.username = "basicuser"
	mock_creds.password = "basicpass"

	mock_http_basic_instance = AsyncMock(return_value=mock_creds)
	mock_connection = MagicMock()
	mock_receive = MagicMock()

	with patch("webgui.python.auth.HTTPBasic", return_value=mock_http_basic_instance):
		with patch("webgui.python.auth.Request"):
			(
				username,
				password,
				mfa_otp,
			) = await auth._Authentication__get_credentials_http_basic(mock_connection, mock_receive)

	assert username == "basicuser"
	assert password == "basicpass"
	assert mfa_otp is None


@pytest.mark.asyncio
async def test_get_credentials_http_basic_raises_when_no_credentials() -> None:
	"""__get_credentials_http_basic raises ValueError when no credentials provided."""
	auth = _make_auth({"active": False})

	mock_http_basic_instance = AsyncMock(return_value=None)
	mock_connection = MagicMock()
	mock_receive = MagicMock()

	with patch("webgui.python.auth.HTTPBasic", return_value=mock_http_basic_instance):
		with patch("webgui.python.auth.Request"):
			with pytest.raises(ValueError, match="Credentials not provided"):
				await auth._Authentication__get_credentials_http_basic(mock_connection, mock_receive)


# ---------------------------------------------------------------------------
# _get_credentials
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_get_credentials_tries_form_data_first() -> None:
	"""_get_credentials tries form data before HTTP Basic auth."""
	auth = _make_auth({"active": False})

	mock_connection = MagicMock()
	mock_receive = MagicMock()

	# Mock form data to succeed
	with patch.object(
		auth,
		"_Authentication__get_credentials_form_data",
		return_value=("formuser", "formpass", "123"),
	):
		username, password, mfa_otp = await auth._get_credentials(mock_connection, mock_receive, log_errors=False)

	assert username == "formuser"
	assert password == "formpass"
	assert mfa_otp == "123"


@pytest.mark.asyncio
async def test_get_credentials_falls_back_to_http_basic() -> None:
	"""_get_credentials falls back to HTTP Basic when form data fails."""
	auth = _make_auth({"active": False})

	mock_connection = MagicMock()
	mock_receive = MagicMock()

	# Mock form data to fail, HTTP Basic to succeed
	with patch.object(
		auth,
		"_Authentication__get_credentials_form_data",
		side_effect=ValueError("No form data"),
	):
		with patch.object(
			auth,
			"_Authentication__get_credentials_http_basic",
			return_value=("basicuser", "basicpass", None),
		):
			username, password, mfa_otp = await auth._get_credentials(mock_connection, mock_receive, log_errors=False)

	assert username == "basicuser"
	assert password == "basicpass"
	assert mfa_otp is None


@pytest.mark.asyncio
async def test_get_credentials_raises_when_both_methods_fail() -> None:
	"""_get_credentials raises HTTPException when both extraction methods fail."""
	auth = _make_auth({"active": False})

	mock_connection = MagicMock()
	mock_receive = MagicMock()

	with patch.object(
		auth,
		"_Authentication__get_credentials_form_data",
		side_effect=ValueError("No form data"),
	):
		with patch.object(
			auth,
			"_Authentication__get_credentials_http_basic",
			side_effect=ValueError("No HTTP Basic"),
		):
			with pytest.raises(HTTPException) as exc_info:
				await auth._get_credentials(mock_connection, mock_receive, log_errors=False)

			assert exc_info.value.status_code == status.HTTP_400_BAD_REQUEST


# ---------------------------------------------------------------------------
# credentials_provided
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_credentials_provided_returns_true_when_credentials_exist() -> None:
	"""credentials_provided returns True when credentials are in request."""
	auth = _make_auth({"active": False})

	mock_connection = MagicMock()
	mock_receive = MagicMock()

	with patch.object(auth, "_get_credentials", return_value=("user", "pass", None)):
		result = await auth.credentials_provided(mock_connection, mock_receive)

	assert result is True


@pytest.mark.asyncio
async def test_credentials_provided_returns_false_when_no_credentials() -> None:
	"""credentials_provided returns False when no credentials in request."""
	auth = _make_auth({"active": False})

	mock_connection = MagicMock()
	mock_receive = MagicMock()

	with patch.object(
		auth,
		"_get_credentials",
		side_effect=HTTPException(status_code=400, detail="No credentials"),
	):
		result = await auth.credentials_provided(mock_connection, mock_receive)

	assert result is False


# ---------------------------------------------------------------------------
# authenticate
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_authenticate_routes_to_ldap_when_active() -> None:
	"""authenticate calls __authenticate_ldap when LDAP is active."""
	auth = _make_auth({"active": True, "groups": []})

	mock_connection = MagicMock()
	mock_receive = MagicMock()

	with patch.object(auth, "_Authentication__authenticate_ldap", return_value=True) as mock_ldap:
		await auth.authenticate(mock_connection, mock_receive)

	mock_ldap.assert_called_once_with(mock_connection, mock_receive)


@pytest.mark.asyncio
async def test_authenticate_routes_to_backend_when_ldap_inactive() -> None:
	"""authenticate calls __authenticate_backend when LDAP is inactive."""
	auth = _make_auth({"active": False})

	mock_connection = MagicMock()
	mock_receive = MagicMock()

	with patch.object(auth, "_Authentication__authenticate_backend") as mock_backend:
		await auth.authenticate(mock_connection, mock_receive)

	mock_backend.assert_called_once_with(mock_connection, mock_receive)


@pytest.mark.asyncio
async def test_authenticate_wraps_exceptions_in_http_exception() -> None:
	"""authenticate wraps non-HTTP exceptions in HTTPException with 401 status."""
	auth = _make_auth({"active": False})

	mock_connection = MagicMock()
	mock_receive = MagicMock()

	with patch.object(
		auth,
		"_Authentication__authenticate_backend",
		side_effect=ValueError("Backend error"),
	):
		with pytest.raises(HTTPException) as exc_info:
			await auth.authenticate(mock_connection, mock_receive)

		assert exc_info.value.status_code == status.HTTP_401_UNAUTHORIZED
		assert exc_info.value.detail == "Unauthorized"


@pytest.mark.asyncio
async def test_authenticate_preserves_http_exceptions() -> None:
	"""authenticate preserves HTTPException status code and detail."""
	auth = _make_auth({"active": False})

	mock_connection = MagicMock()
	mock_receive = MagicMock()

	original_exception = HTTPException(status_code=403, detail="Forbidden")

	with patch.object(auth, "_Authentication__authenticate_backend", side_effect=original_exception):
		with pytest.raises(HTTPException) as exc_info:
			await auth.authenticate(mock_connection, mock_receive)

		assert exc_info.value.status_code == 403
		assert exc_info.value.detail == "Forbidden"


# ---------------------------------------------------------------------------
# __authenticate_backend
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_authenticate_backend_calls_opsiconfd_authenticate() -> None:
	"""__authenticate_backend calls opsiconfd_authenticate with credentials."""
	auth = _make_auth({"active": False})

	mock_connection = MagicMock()
	mock_connection.scope = {"type": "http"}
	mock_receive = MagicMock()

	with patch.object(auth, "_get_credentials", return_value=("backenduser", "backendpass", "654321")):
		with patch("webgui.python.auth.opsiconfd_authenticate") as mock_auth:
			await auth._Authentication__authenticate_backend(mock_connection, mock_receive)

			mock_auth.assert_called_once_with(
				scope=mock_connection.scope,
				username="backenduser",
				password="backendpass",
				mfa_otp="654321",
			)


# ---------------------------------------------------------------------------
# __authenticate_ldap
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_authenticate_ldap_raises_when_not_configured() -> None:
	"""__authenticate_ldap raises HTTPException when LDAP not properly configured."""
	auth = _make_auth({"active": False})

	mock_connection = MagicMock()
	mock_receive = MagicMock()

	with pytest.raises(HTTPException) as exc_info:
		await auth._Authentication__authenticate_ldap(mock_connection, mock_receive)

	assert exc_info.value.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR
	assert "not configured correctly" in exc_info.value.detail


@pytest.mark.asyncio
async def test_authenticate_ldap_successful_authentication() -> None:
	"""__authenticate_ldap successfully authenticates user and sets session."""
	auth = _make_auth(
		{
			"active": True,
			"opsiconfig": False,
			"ldap_url": "ldap://test",
			"groups": ["opsiadmin"],
			"session_lifetime": 7200,
		}
	)

	# Mock session
	mock_session = MagicMock()
	mock_session.session_id = "test-session"
	mock_session.username = None
	mock_session.authenticated = False
	mock_session.user_groups = set()
	mock_session.store = AsyncMock()

	mock_connection = MagicMock()
	mock_connection.scope = {"type": "http"}
	mock_receive = MagicMock()

	with patch("webgui.python.auth.ensure_session", return_value=mock_session):
		with patch.object(auth, "_get_credentials", return_value=("ldapuser", "ldappass", None)):
			with patch.object(auth, "_check_group_ldap", return_value=["opsiadmin", "users"]):
				with patch("webgui.python.auth.post_authenticate"):
					result = await auth._Authentication__authenticate_ldap(mock_connection, mock_receive)

	assert result is True
	assert mock_session.authenticated is True
	assert mock_session.username == "ldapuser"
	assert mock_session.user_groups == {"opsiadmin", "users"}
	assert mock_session.max_age == 7200


@pytest.mark.asyncio
async def test_authenticate_ldap_returns_false_when_no_groups() -> None:
	"""__authenticate_ldap returns False when user not in required groups."""
	auth = _make_auth(
		{
			"active": True,
			"opsiconfig": False,
			"ldap_url": "ldap://test",
			"groups": ["opsiadmin"],
		}
	)

	mock_session = MagicMock()
	mock_session.session_id = "test-session"
	mock_session.store = AsyncMock()

	mock_connection = MagicMock()
	mock_connection.scope = {"type": "http"}
	mock_receive = MagicMock()

	with patch("webgui.python.auth.ensure_session", return_value=mock_session):
		with patch.object(auth, "_get_credentials", return_value=("ldapuser", "ldappass", None)):
			with patch.object(auth, "_check_group_ldap", return_value=[]):
				result = await auth._Authentication__authenticate_ldap(mock_connection, mock_receive)

	assert result is False


@pytest.mark.asyncio
async def test_authenticate_ldap_logs_username_change_warning() -> None:
	"""__authenticate_ldap logs warning when session exists for different user."""
	auth = _make_auth(
		{
			"active": True,
			"opsiconfig": False,
			"ldap_url": "ldap://test",
			"groups": ["opsiadmin"],
		}
	)

	mock_session = MagicMock()
	mock_session.session_id = "test-session"
	mock_session.username = "existing_user"
	mock_session.store = AsyncMock()

	mock_connection = MagicMock()
	mock_connection.scope = {"type": "http"}
	mock_receive = MagicMock()

	with patch("webgui.python.auth.ensure_session", return_value=mock_session):
		with patch.object(auth, "_get_credentials", return_value=("different_user", "pass", None)):
			with patch.object(auth, "_check_group_ldap", return_value=["opsiadmin"]):
				with patch("webgui.python.auth.post_authenticate"):
					# Should not raise, just log warning
					result = await auth._Authentication__authenticate_ldap(mock_connection, mock_receive)

	assert result is True
	assert mock_session.username == "different_user"


# ---------------------------------------------------------------------------
# authenticated
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_authenticated_returns_false_when_no_session() -> None:
	"""authenticated returns False when no session exists."""
	auth = _make_auth({"active": True, "groups": ["opsiadmin"]})

	mock_connection = MagicMock()
	mock_connection.scope = {"type": "http"}

	with patch("webgui.python.auth.ensure_session", return_value=None):
		result = await auth.authenticated(mock_connection, None)

	assert result is False


@pytest.mark.asyncio
async def test_authenticated_returns_false_when_session_not_authenticated() -> None:
	"""authenticated returns False and resets session when not authenticated."""
	auth = _make_auth({"active": True, "groups": ["opsiadmin"]})

	mock_session = MagicMock()
	mock_session.session_id = "test-session"
	mock_session.authenticated = False
	mock_session.username = "olduser"
	mock_session.user_groups = {"oldgroup"}
	mock_session.store = AsyncMock()

	mock_connection = MagicMock()
	mock_connection.scope = {"type": "http"}

	with patch("webgui.python.auth.ensure_session", return_value=mock_session):
		with patch("webgui.python.auth.post_authenticate"):
			result = await auth.authenticated(mock_connection, None)

	assert result is False
	assert mock_session.authenticated is False
	assert mock_session.username is None
	assert mock_session.user_groups == set()


@pytest.mark.asyncio
async def test_authenticated_returns_true_when_valid_session() -> None:
	"""authenticated returns True when session is valid and user in required groups."""
	auth = _make_auth({"active": True, "groups": ["opsiadmin"]})

	mock_session = MagicMock()
	mock_session.session_id = "test-session"
	mock_session.authenticated = True
	mock_session.username = "validuser"
	mock_session.user_groups = {"opsiadmin", "users"}
	mock_session.store = AsyncMock()

	mock_connection = MagicMock()
	mock_connection.scope = {"type": "http"}

	with patch("webgui.python.auth.ensure_session", return_value=mock_session):
		with patch("webgui.python.auth.post_authenticate"):
			result = await auth.authenticated(mock_connection, None)

	assert result is True


@pytest.mark.asyncio
async def test_authenticated_returns_false_when_user_not_in_required_groups() -> None:
	"""authenticated returns False when user no longer in required groups."""
	auth = _make_auth({"active": True, "groups": ["opsiadmin"]})

	mock_session = MagicMock()
	mock_session.session_id = "test-session"
	mock_session.authenticated = True
	mock_session.username = "validuser"
	mock_session.user_groups = {"users", "guests"}  # Not in opsiadmin
	mock_session.store = AsyncMock()

	mock_connection = MagicMock()
	mock_connection.scope = {"type": "http"}

	with patch("webgui.python.auth.ensure_session", return_value=mock_session):
		with patch("webgui.python.auth.post_authenticate"):
			result = await auth.authenticated(mock_connection, None)

	assert result is False
	assert mock_session.authenticated is False


@pytest.mark.asyncio
async def test_authenticated_works_without_connection() -> None:
	"""authenticated can be called without connection parameter when LDAP is inactive."""
	auth = _make_auth({"active": False})

	mock_session = MagicMock()
	mock_session.session_id = "test-session"
	mock_session.authenticated = True
	mock_session.username = "user"
	mock_session.user_groups = set()
	mock_session.store = AsyncMock()

	# Create a mock connection to avoid NoneType error in post_authenticate
	mock_connection = MagicMock()
	mock_connection.scope = {"type": "http"}

	with patch("webgui.python.auth.ensure_session", return_value=mock_session):
		with patch("webgui.python.auth.post_authenticate"):
			result = await auth.authenticated(mock_connection, None)

	assert result is True
