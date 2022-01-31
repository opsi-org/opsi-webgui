// /**
//  * @module mockmodule for storybook
//  */

const axios = require('axios')
const MockAdapter = require('axios-mock-adapter')
const mock = new MockAdapter(axios, { onNoMatch: 'throwException' })

module.exports.mock = mock