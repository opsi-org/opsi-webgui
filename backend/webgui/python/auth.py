import os

from fastapi import HTTPException, Request, status
from fastapi.requests import HTTPConnection
from fastapi.security import HTTPBasic
from opsiconfd.auth.ldap import LDAPAuthentication
from opsiconfd.config import opsi_config  # type: ignore
from opsiconfd.session import authenticate as opsiconfd_authenticate
from opsiconfd.session import ensure_session, post_authenticate
from starlette.types import Receive

from .config import ENV_KEY_LDAP_URL, Config
from .utils import get_logger

SESSION_LIFETIME = 3600  # seconds (1 hour)

logger = get_logger()
TAG = "[auth]"


class AuthException(Exception):
    def __init__(self, message: str, title: str = "Error"):
        super().__init__(message)
        self.title = title


class Authentication:
    def __init__(self):
        self.config_ldap = Config().get_ldap_config()

        self.session = None
        _type, _config_file, _config = self._get_config()

        logger.info(
            f"{TAG} LDAP authentication active with type '{_type}' and config file '{_config_file}' active ldap {self.config_ldap.get('active', False)}"
        )
        if self.config_ldap.get("active", False):
            if not _config.get("ldap_url"):
                title = "LDAP Configuration Error"
                message = f"LDAP authentication is active but no LDAP URL provided in config ({_type}). Please provide a valid LDAP URL to enable LDAP authentication."
                logger.error(message)
                raise AuthException(message, title=title)
            logger.info(f"{TAG} LDAP authentication enabled with config: {_config}")
            self.auth = LDAPAuthentication(**_config)

    def _get_config(self):
        _active = self.config_ldap.get("active", False)
        _active_opsiconfig = self.config_ldap.get("opsiconfig", False)
        _config_file = None
        _config = None
        _type = "none"
        if _active and _active_opsiconfig:
            logger.debug(f"{TAG} Using backend data for LDAP authentication module")
            _type = "opsiconfig"
            _config_file = opsi_config.config_file
            _config = dict(opsi_config.get("ldap_auth") or {})
        elif _active:
            logger.debug(f"{TAG} Using custom data for LDAP authentication module")
            _type = "customconfig"
            _config_file = Config().config_file
            _config = {
                "ldap_url": self.config_ldap.get("ldap_url", ""),
                "bind_user": self.config_ldap.get("bind_user", ""),
                "group_filter": self.config_ldap.get("group_filter", ""),
                "use_member_of_rdn": bool(
                    self.config_ldap.get("use_member_of_rdn", False)
                ),
            }
        else:
            logger.debug(
                f"{TAG} LDAP authentication not active. Using default authentication."
            )

        if _active:
            # Override ldap_url with env var if set
            env_ldap_url = os.getenv(ENV_KEY_LDAP_URL)
            logger.info(
                f"{TAG} LDAP authentication module type: {_type}, config file: {_config_file}, active: {_active}, opsiconfig: {_active_opsiconfig}, env_ldap_url: {env_ldap_url}"
            )
            if env_ldap_url:
                _config["ldap_url"] = env_ldap_url
                logger.info(f"{TAG} LDAP URL overridden by env var: {env_ldap_url}")
        return _type, _config_file, _config

    async def authenticate(self, connection: HTTPConnection, receive: Receive) -> None:
        try:
            if self.config_ldap.get("active", False):
                await self.__authenticate_ldap(connection, receive)
            else:
                logger.debug(
                    f"{TAG} LDAP authentication not active, falling back to backend auth"
                )
                await self.__authenticate_backend(connection, receive)
        except Exception as err:
            logger.error(f"{TAG} Authentication failed: {err}", with_event=True)
            raise HTTPException(
                status_code=(
                    err.status_code
                    if isinstance(err, HTTPException)
                    else status.HTTP_401_UNAUTHORIZED
                ),
                detail=err.detail if isinstance(err, HTTPException) else "Unauthorized",
            ) from err

    async def __authenticate_ldap(
        self, connection: HTTPConnection, receive: Receive
    ) -> bool:
        if not self.config_ldap.get("active", False) or (
            not self.config_ldap.get("opsiconfig", False)
            and not self.config_ldap.get("ldap_url")
        ):
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="LDAP not configured correctly. Either set active True or provide necessary LDAP configuration.",
            )
        # reload session to get updated data
        session = await ensure_session(scope=connection.scope)
        logger.debug(
            f"{TAG} Starting LDAP authentication for session '{session.session_id}'"
        )
        logger.detailed(
            f"{TAG} Session data at start of LDAP authentication: {session.__dict__}"
        )
        session.authenticated = False
        session.user_groups = set()
        await session.store(wait=True)

        try:
            username, password, _ = await self._get_credentials(connection, receive)
            # password += totp if totp else ""
        except HTTPException as err:
            logger.error(f"{TAG} Failed to get credentials: {err}", with_event=True)
            raise err

        if session.username and session.username != username:
            # this happens if a user is already logged in in admininterface and tries to login with another user
            logger.warning(
                f"{TAG} Session exists for user '{session.username}', attempting to login as different user '{username}'",
                with_event=True,
            )

        groupnames = self._check_group_ldap(username, password)
        if groupnames:
            session.authenticated = True
            # Store only the groups the user is actually member of, not all configured groups
            session.user_groups = set(groupnames)
            session.max_age = self.config_ldap.get("session_lifetime", SESSION_LIFETIME)
            session.username = username
            await session.store(wait=True)
            await post_authenticate(connection.scope)
            logger.detailed(
                f"{TAG} Session data after LDAP authentication: {session.__dict__}"
            )
            return True

        return False

    async def __authenticate_backend(
        self, connection: HTTPConnection, receive: Receive
    ) -> None:
        username, password, mfa_otp = await self._get_credentials(connection, receive)
        await opsiconfd_authenticate(
            scope=connection.scope,
            username=username,
            password=password,
            mfa_otp=mfa_otp,
        )  # creates session

    async def _get_credentials(
        self, connection: HTTPConnection, receive: Receive, log_errors: bool = True
    ) -> tuple[str, str, str | None]:
        errors = []
        try:
            return await self.__get_credentials_form_data(connection, receive)
        except Exception as err:
            if log_errors:
                logger.warning(
                    f"Failed to get credentials from form data [2]. (Error {err})",
                    with_event=True,
                )
            errors.append(err)
        try:
            return await self.__get_credentials_http_basic(connection, receive)
        except Exception as err:
            if log_errors:
                logger.warning(
                    f"Failed to get credentials from HTTP Basic auth [1]. (Error {err})",
                    with_event=True,
                )
            errors.append(err)

        if log_errors:
            logger.error(
                f"Failed to get credentials. Errors: {errors}", with_event=True
            )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid credentials"
        )

    async def __get_credentials_form_data(
        self, connection: HTTPConnection, receive: Receive
    ) -> tuple[str, str, str | None]:
        form = await Request(connection.scope, receive).form()
        username = str(form.get("username", ""))
        password = str(form.get("password", ""))
        mfa_otp = str(form.get("mfa_otp", ""))
        if not username or not password:
            raise ValueError(f"Username or password missing in form data: {form}")
        logger.debug(
            f"{TAG} Retrieved credentials from form data for user '{username}'"
        )
        return username, password, mfa_otp

    async def __get_credentials_http_basic(
        self, connection: HTTPConnection, receive: Receive
    ) -> tuple[str, str, str | None]:
        creds = await HTTPBasic(auto_error=False)(Request(connection.scope, receive))
        if (
            creds
            and getattr(creds, "username", None)
            and getattr(creds, "password", None)
        ):
            logger.debug(
                f"{TAG} Retrieved credentials from HTTP Basic auth for user '{creds.username}'"
            )
            return creds.username, creds.password, getattr(creds, "mfa_otp", None)
        raise ValueError(f"{TAG} Credentials not provided in HTTP Basic auth")

    async def credentials_provided(
        self, connection: HTTPConnection, receive: Receive
    ) -> bool:
        try:
            logger.trace(f"{TAG} Checking if credentials provided in request")
            await self._get_credentials(connection, receive, log_errors=False)
            logger.debug(f"{TAG} Credentials provided in request")
            return True
        except HTTPException:
            pass
        logger.trace(
            f"{TAG} No credentials provided in request (session-based auth possible)"
        )
        return False

    def _check_group_ldap(self, username, password) -> tuple[list[str]]:
        auth = self.auth.get_instance()
        try:
            auth.authenticate(username, password)
        except Exception as err:
            logger.error(
                f"{TAG} LDAP authentication failed for user {username}: {err}",
                with_event=True,
            )
            raise err

        try:
            groupnames = auth.get_groupnames(username)
        except Exception as err:
            logger.error(
                f"{TAG} Getting LDAP groups failed for user {username}.... {err}",
                with_event=True,
            )
            raise err

        if self._check_group_membership(groupnames, "from LDAP authentication"):
            return groupnames
        return []

    def _check_group_membership(self, usergroups: list[str], info: str = "") -> bool:
        """Check if user is member of at least one of the required groups."""
        if not self.config_ldap.get("active"):
            return True

        required_groups = self.config_ldap.get("groups", [])
        if not required_groups:
            logger.warning(f"{TAG} LDAP is active but no required groups configured")
            return True

        # User must be in at least one of the required groups
        user_groups_set = set(usergroups)
        required_groups_set = set(required_groups)

        if not user_groups_set.intersection(required_groups_set):
            info = f" ({info})" if info else ""
            logger.debug(
                f"{TAG} User groups '{usergroups}' do not include any of the required groups "
                f"'{required_groups}'{info}",
                with_event=True,
            )
            return False

        logger.debug(
            f"{TAG} User is member of required group(s): "
            f"{user_groups_set.intersection(required_groups_set)}"
        )
        return True

    async def authenticated(
        self, connection: HTTPConnection | None = None, receive: Receive | None = None
    ) -> bool:
        session = (
            await ensure_session(scope=connection.scope)
            if connection
            else await ensure_session()
        )
        if session is None:
            logger.warning(f"{TAG} No session found for request", with_event=True)
            return False
        logger.debug(
            f"{TAG} Validating authentication for session '{session.session_id}'"
        )

        logger.detailed(
            f"{TAG} Session data for authentication check: {session.__dict__}"
        )
        if not session.authenticated:
            logger.debug(
                f"{TAG} Session not authenticated",
                with_event=True,
            )
            session.user_groups = set()
            session.username = None
            session.authenticated = False
            await session.store(wait=True)
            await post_authenticate(connection.scope)
            return False
        logger.debug(
            f"{TAG} Active session for user '{session.username}' with groups {session.user_groups}"
        )
        if not self._check_group_membership(session.user_groups, "from session check"):
            logger.warning(
                f"{TAG} User does not belong to the required group", with_event=True
            )
            session.authenticated = False
            await session.store(wait=True)
            await post_authenticate(connection.scope)
            return False
        logger.debug(f"{TAG} User is (still) authenticated.")
        await session.store(wait=True)
        await post_authenticate(connection.scope)
        return True
