const knex = require('knex')
const supertest = require('supertest')
const app = require('../src/app')
const helpers = require('./test-helpers')

describe('Protected Endpoints', function() {
    let db

    const {
        testUsers, 
        testItems,
    } =  helpers.makeItemsFixtures()

    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DATABASE_URL,
          })
          app.set('db', db)
    })

    after('disconnect from db', () => db.destroy())
    
    before('cleanup', () => helpers.cleanTables(db))
  
    afterEach('cleanup', () => helpers.cleanTables(db))

    beforeEach('insert items', () =>
    helpers.seedItemsTables(
        db,
        testUsers,
        testItems,
    )
  )

  const protectedEndpoints = [
    {
        name: 'GET /api/users/:id',
        path: '/api/users/1',
        method: supertest(app).get,
    },
    {
      name: 'GET /api/pantry/',
      path: '/api/pantry/',
      method: supertest(app).get,
    },
    {
      name: 'GET /api/pantry/:id',
      path: '/api/pantry/1',
      method: supertest(app).get,
    },
    {
      name: 'GET /api/pantry/users/:user_id',
      path: '/api/pantry/users/1',
      method: supertest(app).get,
    },
    {
      name: 'POST/api/pantry/',
      path: '/api/pantry/',
      method: supertest(app).post,
    },
    {
      name: 'DELETE /api/pantry/:id',
      path: '/api/pantry/1',
      method: supertest(app).delete,
    },
    {
      name: 'PATCH /api/pantry/:id',
      path: '/api/pantry/1',
      method: supertest(app).patch,
    },
    {
      name: 'GET /api/savedLunches',
      path: '/api/savedLunches/',
      method: supertest(app).get,
    },
    {
      name: 'GET /api/savedLunches/:id',
      path: '/api/savedLunches/1',
      method: supertest(app).get,
    },
    {
      name: 'GET /api/savedLunches/users/:user_id',
      path: '/api/savedLunches/users/1',
      method: supertest(app).get,
    },
    {
      name: 'POST/api/savedLunches/',
      path: '/api/savedLunches/',
      method: supertest(app).post,
    },
    {
      name: 'DELETE /api/savedLunches/:id',
      path: '/api/savedLunches/1',
      method: supertest(app).delete,
    },
    {
      name: 'PATCH /api/pantry/:id',
      path: '/api/savedLunches/1',
      method: supertest(app).patch,
    },

    ]

    protectedEndpoints.forEach(endpoint => {
        describe(endpoint.name, () => {
          it(`responds 401 'Missing bearer token' when no bearer token`, () => {
            return endpoint.method(endpoint.path)
            .expect(401, { error: `Missing bearer token` })
          })
  
          it(`responds 401 'Unauthorized request' when invalid JWT secret`, () => {
            const validUser = testUsers[0]
            const invalidSecret = 'bad-secret'
            return endpoint.method(endpoint.path)
            .set('Authorization', helpers.makeAuthHeader(validUser, invalidSecret))
              .expect(401, { error: 'Unauthorized request' })
          })
  
          it(`responds 401 'Unauthorized request' when invalid sub in payload`, () => {
            const invalidUser = { username: 'user-not-existy', id: 1 }
            return endpoint.method(endpoint.path)
            .set('Authorization', helpers.makeAuthHeader(invalidUser))
              .expect(401, { error: 'Unauthorized request' })
          })
        })
      })
})