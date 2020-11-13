const { expect } = require('chai')
const knex = require('knex')
const app = require('../src/app')
const supertest = require('supertest')
const helpers = require('./test-helpers')

describe('SavedLunches Endpoints', function () {

    let db

    const {
        testUsers,
        testSaved,
    } = helpers.makeItemsFixtures()

    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DATABASE_URL,
        })
        app.set('db', db)
    })

after('disconnect from db', () => db.destroy())

before('clean the table', () => db('saved_lunches').delete())

afterEach('cleanup', () => helpers.cleanTables(db))

describe('GET /api/savedLunches', function () {
    context('Given no lists', () => {
        beforeEach('insert users', () => 
        helpers.seedUsers(
            db,
            testUsers,
        )
    )
        it('responds with 200 and an empty list', () => {
            return supertest(app)
                .get('/api/savedLunches')
                .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                .expect(200, [])
        })
    })
    context('Given that there are lists in the database', () => {
        beforeEach('insert users', () => 
            helpers.seedUsers(
                db,
                testUsers,
            )
        )
        beforeEach('insert Lists', () => {
            return db   
                .into('saved_lunches')
                .insert(testSaved)
        })

        it('Responds with 200 and all of the Lists', () => {
            return supertest(app)
                .get('/api/savedLunches')
                .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                .expect(200, testSaved)
        })
    })
})

describe('GET /api/savedLunches/:id', () => {
    context('Given no lists', () => {
        beforeEach('insert users', () => 
        helpers.seedUsers(
            db,
            testUsers,
        )
    )
        it('responds with 404', () => {
            const id = 123456
            return supertest(app)
                .get(`/api/savedLunches/${id}`)
                .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                .expect(404)
        })
    })
    context('Given there are lists in the database', () => {
        beforeEach('insert users', () => {
            helpers.seedUsers(
                db,
                testUsers,
            )
        })
        beforeEach('insert Lists', () => {
            return db   
                .into('saved_lunches')
                .insert(testSaved)
        })

        it('Responds with 200 and the expected List', () => {
            const id = 2
            const expectedList = testSaved[id -1]
            return supertest(app)
                .get(`/api/savedLunches/${id}`)
                .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                .expect(200, expectedList)
        })
    })
})

describe('POST /api/savedLunches/', () => {
    beforeEach('insert users', () => {
        helpers.seedUsers(
            db,
            testUsers,
        )
    })
    it('Creates a list, responding with 201 and the new List', () => {
        const newList = {
            user_id: 1,
            title: 'test title',
            items: ['banana', 'coke', 'blueberries']
        }
        return supertest(app)
            .post('/api/savedLunches')
            .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
            .send(newList)
            .expect(201)
            .expect(res => {
                expect(res.body.title).to.eql(newList.title)
            })
            .then(postRes => 
                supertest(app)
                    .get(`/api/savedLunches/${postRes.body.id}`)
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .expect(postRes.body)
                )
        })

        // const requiredFields = ['user_id', 'title', 'items' ]
        // requiredFields.forEach(field => {
        //     const newList = {
        //         user_id: 1,
        //         title: 'test list',
        //         items: ['banana', 'banana', 'banana' ]
        //     }
        //     it(`responds with 400 and an error when the ${field} is missing in the request body`, () => {
        //         delete newList[field]

        //         return supertest(app)
        //         .post('/api/savedLunches')
        //         .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
        //         .send(newList)
        //         .expect(400, {
        //             error: { message: `Missing '${field}' in request body` }
        //         })
        //     })
        // })
})
describe('DELETE /api/savedLunches/:id', () => {
    context('Given no items', () => {
        beforeEach('insert users', () => 
        helpers.seedUsers(
            db,
            testUsers,
        )
    )
        it('responds with 404', () => {
            const id = 123456
            return supertest(app)
                .delete(`/api/savedLunches/${id}`)
                .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                .expect(404)
        })
    })
    context('Given there are lists in the database', () => {
        beforeEach('insert users', () => {
            return db   
                .into('users')
                .insert(testUsers)
        })
        beforeEach('insert Lists', () => {
            return db   
                .into('saved_lunches')
                .insert(testSaved)
        })

        it('responds with 204 and removes the item', () => {
            const idToRemove = 2
            const expectedLists = testSaved.filter(list => list.id !== idToRemove)
            return supertest(app)
                .delete(`/api/savedLunches/${idToRemove}`)
                .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                .expect(204)
                .then(res => 
                    supertest(app)
                        .get('/api/savedLunches')
                        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                        .expect(expectedLists)
                    )
        })
    })
})
describe('PATCH /api/savedLunches/:id', () => {
    context('Given no items', () => {
        beforeEach('insert users', () => 
        helpers.seedUsers(
            db,
            testUsers,
        )
    )
        it('responds with 404', () => {
            const id = 123456
            return supertest(app)
                .patch(`/api/pantry/${id}`)
                .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                .expect(404)
        })
    })
    context('Given there are lists in the database', () => {
        beforeEach('insert users', () => {
            return db   
                .into('users')
                .insert(testUsers)
        })
        beforeEach('insert Lists', () => {
            return db   
                .into('saved_lunches')
                .insert(testSaved)
        })
        it('Responds with 204 and updates the list', () => {
            const idToUpdate = 2
            const updatedList = {
                user_id: 2,
                title: 'updated title',
                items: ['notbanana', 'notbanana', 'notbanana']
            }
            const expectedList = {
                ...testSaved[idToUpdate -1],
                ...updatedList
            }
            return supertest(app)
                .patch(`/api/savedLunches/${idToUpdate}`)
                .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                .send(updatedList)
                .expect(204)
                .then( res => 
                    supertest(app)
                        .get(`/api/savedLunches/${idToUpdate}`)
                        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                        .expect(expectedList)
                    )
        })
    })
})

describe('GET /api/savedLunches/user/:user_id', () => {
    context('Given no lists', () => {
        beforeEach('insert users', () => 
        helpers.seedUsers(
            db,
            testUsers,
        )
    )
        it('responds with 404', () => {
            const user_id = 123456
            return supertest(app)
                .get(`/api/savedLunches/users/${user_id}`)
                .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                .expect(404)
        })
    })
    context('Given there are lists in the database', () => {
        beforeEach('insert users', () => {
            return db   
                .into('users')
                .insert(testUsers)
        })
        beforeEach('insert Lists', () => {
            return db   
                .into('saved_lunches')
                .insert(testSaved)
        })
        it('Responds with 200 and the exptected list', () => {
            const user_id = 1
            const expectedLists = testSaved.filter(list => list.user_id === user_id)
            return supertest(app)
                .get(`/api/savedLunches/users/${user_id}`)
                .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                .expect(200, expectedLists)
        })
    })
})

})