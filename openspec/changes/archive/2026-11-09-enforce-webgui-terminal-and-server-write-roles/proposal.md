# Proposal

## Why

The WebGUI must honor the existing roles for ConfigServer terminal access and server-configuration editing.

## What Changes

- Keep the terminal menu entry visible but disabled with a permission hint when `user.{username}.connect.terminal.forbidden` contains `ConfigServer`. Block direct access and connection attempts.
- Make global and server/depot configuration fields read-only when `user.{username}.privilege.host.opsiserver.write` is false, including `user.{...}` role parameters, and deny the corresponding WebGUI API writes. Client editing remains unchanged.

## Capabilities

### New Capabilities

- `terminal-access`: Honor the ConfigServer entry in the terminal prohibition list.
- `server-configuration-access`: Honor the opsiserver-write role for server configuration.

### Modified Capabilities

None.

## Impact

Existing user-configuration API/store, terminal permission checks, server-configuration editors and write endpoints, and focused permission tests. No new dependencies.
