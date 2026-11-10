# Spec Delta

## Purpose

The diagnostics overview helps administrators quickly scan Health Check results and navigate to related module and system information. It presents status summaries with distinct, accessible visual cues.

## ADDED Requirements

### Requirement: Health Check summaries use subtle semantic status backgrounds
The diagnostics overview SHALL distinguish success, warning, and error summary cards with subtle backgrounds matching their semantic status colors in light and dark themes.

#### Scenario: Scan Health Check summary statuses
- **WHEN** the Health Check summary is displayed
- **THEN** the success, warning, and error cards have distinct subtle status-colored backgrounds and retain readable labels and counts

#### Scenario: Read summary statuses in either theme
- **WHEN** the diagnostics overview is displayed in light or dark theme
- **THEN** each status card remains distinguishable and its text remains legible

### Requirement: Status color does not carry filter selection by itself
The diagnostics overview SHALL expose the selected Health Check filter through an interaction state distinct from the semantic status tint, without relying on color alone.

#### Scenario: Select a status filter
- **WHEN** a user activates a Health Check status summary card
- **THEN** the matching Health Check filter is applied and the selected state is programmatically exposed and visually distinguishable from the status tint

### Requirement: Module summary remains distinct from Health Check statuses
The module summary SHALL remain a navigation control to the modules overview, use a subtle primary-colored background, and SHALL NOT use success, warning, or error status coloring to imply module health. When active, its selected state SHALL be indicated independently with primary selection styling.

#### Scenario: Navigate to modules
- **WHEN** a user activates the module summary card
- **THEN** the modules overview opens and the card retains its subtle primary-colored background with a distinct primary indication of its active state
