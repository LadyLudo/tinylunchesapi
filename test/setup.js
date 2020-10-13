const { expect } = require('chai')
const supertest = require('supertest')
require('dotenv').config()

process.env.NODE_ENV = 'test'
process.env.JWT_EXPIRY = '3m'

global.expect = expect
global.supertest = supertest