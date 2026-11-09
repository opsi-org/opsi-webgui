# Tasks

## 1. ConfigServer terminal access

- [x] 1.1 Read the terminal prohibition list, expose the `ConfigServer` match through the existing user configuration, and apply it to WebGUI terminal access. Verify focused tests cover lists with/without `ConfigServer`, an absent setting, and blocked direct access/connection.

## 2. Server-configuration editing

- [x] 2.1 Reuse the server-write permission in server editors and complete its WebGUI API checks for global configuration, server/depot attributes, and server/depot configuration states. Verify denied writes change nothing, permitted writes succeed, and client-only editing remains available.

## 3. Verification

- [x] 3.1 Run the focused permission tests and frontend type check; review the diff against the two rules and verify no unrelated behavior changes.

## 4. Permission UI corrections

- [x] 4.1 Keep the role-restricted terminal menu entry visible but disabled with a permission hint. Verify the disabled entry, blocked direct access, and blocked connection attempts.
- [x] 4.2 Apply the read-only state to global and server/depot configuration input controls, including `user.{...}` role parameters. Verify values cannot be changed or marked as modified, while permitted server editing and client-only editing remain available.
