# server-configuration-access Specification

## Purpose

Prevent server-configuration editing without opsiserver-write permission while preserving client editing.

## Requirements

### Requirement: Make server configuration read-only without write permission

With user roles enabled and `user.{username}.privilege.host.opsiserver.write=false`, the WebGUI SHALL keep global and server/depot configuration readable with non-editable input controls, including `user.{...}` role parameters and attributes. Corresponding WebGUI API writes SHALL return HTTP 403 before mutation. Client-only editing SHALL retain its existing permissions.

#### Scenario: Server configuration write denied
- **WHEN** a user without server-write permission attempts a global or server/depot configuration change
- **THEN** the configuration fields cannot be changed in the WebGUI, including `user.{...}` role parameters, and a direct WebGUI API write returns HTTP 403 without changes

#### Scenario: Shared request includes server targets
- **WHEN** a user without server-write permission submits configuration-state changes containing both client and server/depot targets
- **THEN** the whole request returns HTTP 403 without changes

#### Scenario: Client-only editing
- **WHEN** the same user submits an otherwise permitted client-only change
- **THEN** the missing server-write permission does not block it

#### Scenario: No server-write restriction
- **WHEN** server-write permission is true, the setting is absent, or user roles are disabled
- **THEN** this role adds no restriction to existing server-configuration editing checks
