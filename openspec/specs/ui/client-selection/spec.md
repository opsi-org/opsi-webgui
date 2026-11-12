# client-selection Specification

## Purpose

Defines a consistent global client selection across the client table and group tree while keeping selection independent of actual group membership.

## Requirements

### Requirement: Client selection is global by client identity

The frontend SHALL maintain one selection state per client ID. Every displayed occurrence of a client and its client-table row SHALL reflect that state. Multiple group memberships SHALL NOT create multiple selected targets for the same client.

#### Scenario: Select a client appearing in two groups
- **GIVEN** client X is a direct member of groups A and B
- **WHEN** the user selects X under A
- **THEN** X is selected under both A and B and in the client table
- **AND** X contributes exactly one client to the selected count

#### Scenario: Deselect a client in the table
- **GIVEN** X is selected and appears in multiple groups
- **WHEN** the user deselects X in the client table
- **THEN** every displayed occurrence of X is unchecked
- **AND** each affected group reflects its remaining selected members

#### Scenario: Deselect a client in the tree
- **GIVEN** X is selected and appears in multiple groups
- **WHEN** the user deselects one occurrence of X in the tree
- **THEN** X is deselected in the table and at every other occurrence

### Requirement: Group selection operates on recursive client membership

Selecting a group SHALL add clients from that group and its descendants to the global selection, subject to existing access restrictions, depot scope, and selection limits. Deselecting a fully selected group SHALL remove its recursive clients globally, including clients shared with other groups. Unrelated selected clients SHALL remain selected.

#### Scenario: Select a parent group
- **GIVEN** A directly contains X, its subgroup B directly contains Y, and the selection limit is not reached
- **WHEN** the user selects A
- **THEN** X and Y are selected, including when B has not been expanded

#### Scenario: Deselect an overlapping group
- **GIVEN** A contains X and Y, B contains Y and Z, and X, Y, Z and unrelated client W are selected
- **WHEN** the user deselects fully selected A
- **THEN** X and Y are deselected globally while Z and W remain selected
- **AND** B is partially selected rather than retaining Y through an independent selection source

### Requirement: Group checkboxes summarize recursive selection

For a group with known recursive membership in the current access and depot scope, its checkbox SHALL be checked when all members are selected, unchecked when none are selected, and indeterminate otherwise. An empty group SHALL be unchecked. Checkbox state SHALL NOT depend on whether descendant rows are expanded.

#### Scenario: Select only part of a group
- **GIVEN** A has recursive members X and Y
- **WHEN** only X is selected
- **THEN** A is indeterminate
- **AND** selecting Y makes A checked and clearing both makes A unchecked

#### Scenario: Collapse a selected group
- **GIVEN** all recursive members of A have been loaded for selection and are selected
- **WHEN** the user collapses or expands A
- **THEN** A remains checked

### Requirement: Selection does not change direct group membership

Selecting or deselecting clients or groups SHALL NOT change stored group assignments, the displayed group hierarchy, or direct membership lists shared across views. The Groups view SHALL display only direct members of the selected ordinary group, irrespective of prior Quick Panel selection.

#### Scenario: Open Groups after selecting a parent in Quick Panel
- **GIVEN** A directly contains X and subgroup B directly contains Y
- **WHEN** the user selects A in Quick Panel and opens A in Groups without refreshing membership data
- **THEN** the direct-member list for A contains X but not Y
- **AND** B still directly contains Y and the hierarchy is unchanged
- **AND** no group-membership write is submitted by the selection

#### Scenario: Repeat selection with a warm membership cache
- **GIVEN** the direct-member data for A and B has already been loaded
- **WHEN** the user selects and deselects A repeatedly in Quick Panel
- **THEN** the direct-member lists remain unchanged in both Quick Panel and Groups
