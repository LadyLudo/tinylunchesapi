const { expect } = require('chai')
const knex = require('knex')
const app = require('../src/app')
const supertest = require('supertest')
const helpers = require('./test-helpers')

describe('Users Endpoints', function() {



let db

const {
    testItems,
    testUsers,
  } = helpers.makeItemsFixtures()
  const testUser = testUsers[0]

    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DATABASE_URL,
        })
        app.set('db', db)
    })

    after('disconnect from db', () => db.destroy())

    before('clean the table', () => db('users').delete())

    afterEach('cleanup', () => db('users').delete())

describe('GET /api/users/id', () => {
    context('Given there are users in the database', () => {
        const testUsers = helpers.makeUsersArray()
        
        beforeEach('insert users', () => {
            return db  
                .into('users')
                .insert(testUsers)
        })

        it('Responds with 200 and the expected user', () => {
            const user_id = 2
            const expectedUser = testUsers[user_id -1]
            return supertest(app)
                .get(`/api/users/${user_id}`)
                .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                .expect(200, expectedUser)
        })
        
    })
})

describe('POST /api/users', () => {
    context(`User Validation`, () => {
        beforeEach('insert users', () =>
          helpers.seedUsers(
            db,
            testUsers,
          )
        )

    const requiredFields = ['password', 'username']
    requiredFields.forEach(field => {
        const newUser = {
            password: 'test123',
            username: 'john@gmail.com'
        }
        
    it(`responds with 400 and an error when the ${field} is missing in the request body`, () => {
        delete newUser[field]

        return supertest(app)
        .post('/api/users')
        .send(newUser)
        .expect(400, {
            error: { message: `Missing '${field}' in request body`}
        })
    })
    })

    it(`responds 400 'Password must be longer than 8 characters' when empty password`, () => {
        const userShortPassword = {
            username: 'test user name',
            password: '1234567',
        }
        return supertest(app)
            .post('/api/users')
            .send(userShortPassword)
            .expect(400, { error: `Password must be longer than 8 characters` })
    })
    it(`responds 400 'Password must be less than 72 characters' when long password`, () => {
        const userLongPassword = {
            username: 'test user name',
            password: '*'.repeat(73),
        }
        return supertest(app)
            .post('/api/users')
            .send(userLongPassword)
            .expect(400, { error: `Password must be less than 72 characters` })
    })
    it(`responds 400 error when password starts with spaces`, () => {
        const userPasswordStartsSpaces = {
            username: 'test user name',
            password: ' 1Aa!2Bb@',
        }
        return supertest(app)
            .post('/api/users')
            .send(userPasswordStartsSpaces)
            .expect(400, { error: `Password must not start or end with empty spaces` })
    })
    it(`responds with 400 error when password ends with spaces`, () => {
        const userPasswordEndsSpaces = {
            username: 'test user name',
            password: '1Aa!2Bb@ ',
        }
        return supertest(app)
            .post('/api/users')
            .send(userPasswordEndsSpaces)
            .expect(400, { error: `Password must not start or end with empty spaces` })
    })
    it(`responds 400 'User name already taken' when user_name isn't unique`, () => {
        const duplicateUser = {
            username: testUser.username,
            password: '11AAaa!!',
        }
        return supertest(app)
            .post('/api/users')
            .send(duplicateUser)
            .expect(400, { error: `Username already taken` })
    })

})
    
})

describe('DELETE /api/users/:user_id', () => {
    context('Given there are users in the database', () => {
        const testUsers = helpers.makeUsersArray()
        
        beforeEach('insert users', () => {
            return db  
                .into('users')
                .insert(testUsers)
        })

        it('responds with 204 and removes the article', () => {
            const idToRemove = 2
            const expectedUsers = testUsers.filter(user => user.id !== idToRemove)
            return supertest(app)
                .delete(`/api/users/${idToRemove}`)
                .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                .expect(204)
                .then(res =>
                    supertest(app)
                        .get(`/api/users/${idToRemove}`)
                        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                        .expect(204)
                )
        })
    })
})

describe('PATCH /api/users/:id', () => {
    context('Given there are users in the database', () => {
        const testUsers = helpers.makeUsersArray()
        
        beforeEach('insert users', () => {
            return db  
                .into('users')
                .insert(testUsers)
        })

        it('Responds with 204 and updates the article', () => {
            const idToUpdate = 2
            const updatedUser = {
                password: 'updatedtest123',
                username: 'johnjr@gmail.com'
            }
            const expectedUser = {
                ...testUsers[idToUpdate -1],
                ...updatedUser
            }
            return supertest(app)
                .patch(`/api/users/${idToUpdate}`)
                .send(updatedUser)
                .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                .expect(204)
                .then(res => 
                    supertest(app)
                        .get(`/api/users/${idToUpdate}`)
                        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                        .expect(200)
                )
        })

        it('Responds with 400 when no required fields supplied', () => {
            const idToUpdate = 2
            return supertest(app)
                .patch(`/api/users/${idToUpdate}`)
                .send({ irrelevantField: 'foo' })
                .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                .expect(400, {
                    error: {
                        message: `Request body must contain either 'password' or 'username'`
                    }
                })
        })

        it('Responds with 204 when updating only a subset of fields', () => {
            const idToUpdate = 2
            const updatedUser = {
                password: 'updatedtest123',
            }
            const expectedUser = {
                ...testUsers[idToUpdate -1],
                ...updatedUser
            }

            return supertest(app)
                .patch(`/api/users/${idToUpdate}`)
                .send({
                    ...updatedUser,
                    fieldToIgnore: 'should not be in GET response'
                })
                .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                .expect(204)
                .then(res => 
                    supertest(app)
                        .get(`/api/users/${idToUpdate}`)
                        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                        .expect(200)
                )
        })
    })
})
})