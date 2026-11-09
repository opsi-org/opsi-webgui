# Spec Delta

## Purpose

Honor the ConfigServer terminal prohibition in the WebGUI's existing access checks.

## ADDED Requirements

### Requirement: Block terminal access for ConfigServer

With user roles enabled, the WebGUI SHALL keep the terminal menu entry visible but disabled with a permission hint when `user.{username}.connect.terminal.forbidden` contains `ConfigServer`. Direct access and connection attempts SHALL remain blocked. The value SHALL be treated as a list, not a boolean.

#### Scenario: ConfigServer is forbidden
- **WHEN** the user's terminal prohibition list contains `ConfigServer`
- **THEN** the terminal menu entry remains visible but disabled with a permission hint, and the WebGUI denies navigation to the terminal, direct access, and connection attempts

#### Scenario: ConfigServer is not forbidden
- **WHEN** the list does not contain `ConfigServer`, the setting is absent, or user roles are disabled
- **THEN** this role adds no restriction to the existing terminal access checks
