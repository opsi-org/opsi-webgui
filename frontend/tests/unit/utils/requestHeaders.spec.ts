/*
 * This file is part of opsi-webgui application.
 * opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
 * Copyright (c) uib GmbH <info@uib.de> 2026
 * All rights reserved.
 * License: AGPL-3.0
 *
 * Unit tests for request header helpers (customFetch plugin logic).
 */
import { describe, it, expect } from 'vitest'
import {
	headersToObject,
	mergeRequestHeaders,
	shouldSendSessionHeader,
} from '~/app/utils/requestHeaders'

describe('headersToObject', () => {
	it('returns empty object for undefined', () => {
		expect(headersToObject(undefined)).toEqual({})
	})

	it('converts Headers instance to plain object', () => {
		const headers = new Headers({ 'X-Test': 'abc' })
		expect(headersToObject(headers)).toEqual({ 'x-test': 'abc' })
	})

	it('passes through plain objects', () => {
		expect(headersToObject({ A: '1' })).toEqual({ A: '1' })
	})
})

describe('shouldSendSessionHeader', () => {
	it('skips logout and user configuration urls', () => {
		expect(shouldSendSessionHeader('/auth/logout')).toBe(false)
		expect(shouldSendSessionHeader('/user/configuration')).toBe(false)
	})

	it('sends for regular api urls', () => {
		expect(shouldSendSessionHeader('/opsidata/clients')).toBe(true)
	})
})

describe('mergeRequestHeaders', () => {
	it('adds session lifetime header for regular urls', () => {
		const result = mergeRequestHeaders({}, '/opsidata/clients', 1800, false)
		expect(result['X-opsi-session-lifetime']).toBe('1800')
		expect(result['Content-Type']).toBe('application/json')
		expect(result['Accept']).toContain('application/json')
	})

	it('omits session lifetime header for excluded urls', () => {
		const result = mergeRequestHeaders({}, '/auth/logout', 1800, false)
		expect(
			Object.keys(result).some(
				(k) => k.toLowerCase() === 'x-opsi-session-lifetime'
			)
		).toBe(false)
	})

	it('omits Content-Type for FormData bodies', () => {
		const result = mergeRequestHeaders({}, '/opsidata/clients', 1800, true)
		expect(result['Content-Type']).toBeUndefined()
	})

	it('does not duplicate a pre-existing lowercased session header', () => {
		// Regression: on retries/interceptor re-entry, ofetch normalizes headers
		// to lowercase. Merging 'x-opsi-session-lifetime' + newly added
		// 'X-opsi-session-lifetime' sent '1800, 1800', which the server rejects
		// as "Invalid X-opsi-session-lifetime header".
		const existing = { 'x-opsi-session-lifetime': '1800' }
		const result = mergeRequestHeaders(existing, '/opsidata/clients', 1800, false)
		const sessionKeys = Object.keys(result).filter(
			(k) => k.toLowerCase() === 'x-opsi-session-lifetime'
		)
		expect(sessionKeys).toEqual(['X-opsi-session-lifetime'])
		expect(result['X-opsi-session-lifetime']).toBe('1800')
	})

	it('replaces a pre-existing header with the current expiry value', () => {
		const existing = { 'X-opsi-session-lifetime': '900' }
		const result = mergeRequestHeaders(existing, '/opsidata/clients', 1800, false)
		expect(result['X-opsi-session-lifetime']).toBe('1800')
	})

	it('keeps unrelated existing headers', () => {
		const existing = { Authorization: 'Bearer x' }
		const result = mergeRequestHeaders(existing, '/opsidata/clients', 1800, false)
		expect(result['Authorization']).toBe('Bearer x')
	})
})
