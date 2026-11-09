# Design

## Context

The WebGUI already loads user roles and exposes `server_write_access`. Terminal access uses Messagebus; its prohibition setting is a list, not a boolean.

## Goals / Non-Goals

Implement only the two rules in [proposal.md](proposal.md), reusing the existing permission flow.

## Decisions

- Read `user.{username}.connect.terminal.forbidden` as a list and expose whether it contains `ConfigServer` through the existing user-configuration response. Honor the existing role activation switch; an absent entry adds no restriction.
- Use that result in the existing terminal access check. For this role restriction, keep the terminal menu entry visible but disabled with a permission hint; continue to block navigation to the terminal, direct access, and connection attempts. This is a WebGUI restriction, not Messagebus-server enforcement.
- Reuse `server_write_access` for read-only global and server/depot editors, including `user.{...}` role parameters. Pass the read-only state through to the input controls so values cannot be changed locally, and retain the existing server-write guard for global configuration and server/depot attribute writes.
- For the shared object-configuration endpoint, check stored target types before writing: deny a request containing server/depot targets when server writes are forbidden, without partially applying it. Client-only requests retain their existing behavior.

## Risks / Trade-offs

- Denying server-configuration writes must not block client-configuration changes.
- Terminal access is restricted in the WebGUI only, not in opsiconfd.
