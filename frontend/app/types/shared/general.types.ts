/**
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2026
All rights reserved.
License: AGPL-3.0
*/

export type StringFunctionMap = Record<string, () => void>
export type StringArrayMap<T = unknown> = Record<string, T[]>
export type StringAnyMap<T = unknown> = Record<string, T>
export type StringStringMap = Record<string, string>
export type StringStringOrUndefinedMap = Record<string, string | undefined>
export type StringBooleanMap = Record<string, boolean>
export type NestedStringMap = Record<string, Record<string, string>>
export type DisabledFeatures = string[]
