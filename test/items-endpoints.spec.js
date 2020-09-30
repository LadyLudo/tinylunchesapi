const { expect } = require('chai')
const knex = require('knex')
const app = require('../src/app')
const supertest = require('supertest')
const { makeItemsArray } = require('./items.fixtures')

let db

before('make knex instance', () => {
    db = knex({
        client: 'pg',
        connection: process.env.TEST_DATABASE_URL,
    })
    app.set('db', db)
})

after('disconnect from db', () => db.destroy())

before('clean the table', () => db('items').delete())

afterEach('cleanup', () => db('items').delete())


describe('GET /api/items', function() {
    context('Given no items', () => {
        it('responds with 200 and an empty list', () => {
            return supertest(app)
                .get('/api/items')
                .expect(200, [])
        })
    })
    context('Given that there are items in the database', () => {
        const testItems = makeItemsArray()

        beforeEach('insert items', () => {
            return db
                .into('items')
                .insert(testItems)
        })

        it('Responds with 200 and all of the items', () => {
            return supertest(app)
                .get('/api/items')
                .expect(200, testItems)
        })
    })
})

describe('GET /api/items/:id', () => {
    context('Given no items', () => {
        it('responds with 404', () => {
            const id = 123456
            return supertest(app)
                .get(`/api/items/${id}`)
                .expect(404)
        })
    })
    context('Given there are items in the database', () => {
        const testItems = makeItemsArray()
        
        beforeEach('insert items', () => {
            return db  
                .into('items')
                .insert(testItems)
        })

        it('Responds with 200 and the expected item', () => {
            const id = 2
            const expectedItem = testItems[id -1]
            return supertest(app)
                .get(`/api/items/${id}`)
                .expect(200, expectedItem)
        })
        
    })
})

describe('POST /api/items', () => {
    it('creates an item, responding with 201 and the new item', () => {
        const newItem = {
            item_name: 'blueberries'
        }
        return supertest(app)
            .post('/api/items')
            .send(newItem)
            .expect(201)
            .expect(res => {
                expect(res.body.item_name).to.eql(newItem.item_name)
            })
            .then(postRes => 
                supertest(app)
                    .get(`/api/items/${postRes.body.id}`)
                    .expect(postRes.body)
                )
    })

    const requiredFields = ['item_name']
    requiredFields.forEach(field => {
        const newItem = {
            item_name: 'bread'
        }
        
    it(`responds with 400 and an error when the ${field} is missing in the request body`, () => {
        delete newItem[field]

        return supertest(app)
        .post('/api/items')
        .send(newItem)
        .expect(400, {
            error: { message: `Missing '${field}' in request body`}
        })
    })
    })
    
})

describe('DELETE /api/items/id', () => {

    context('Given no items', () => {
        it('responds with 404', () => {
            const id = 123456
            return supertest(app)
                .delete(`/api/items/${id}`)
                .expect(404, {
                    error: { message: `Item doesn't exist` }
                })
        })
    })

    context('Given there are items in the database', () => {
        const testItems = makeItemsArray()
        
        beforeEach('insert items', () => {
            return db  
                .into('items')
                .insert(testItems)
        })

        it('responds with 204 and removes the item', () => {
            const idToRemove = 2
            const expectedItems = testItems.filter(item => item.id !== idToRemove)
            return supertest(app)
                .delete(`/api/items/${idToRemove}`)
                .expect(204)
                .then(res =>
                    supertest(app)
                        .get('/api/items')
                        .expect(expectedItems)
                )
        })
    })
})

describe('PATCH /api/items/:id', () => {
    context('Given no items', () => {
        it('resonds with 404', () => {
            const id = 123456
            return supertest(app)
                .patch(`/api/items/${id}`)
                .expect(404, { error: { message: `Item doesn't exist` } })
        })
    })

    context('Given there are items in the database', () => {
        const testItems = makeItemsArray()
        
        beforeEach('insert items', () => {
            return db  
                .into('items')
                .insert(testItems)
        })

        it('Responds with 204 and updates the item', () => {
            const idToUpdate = 2
            const updatedItem = {
                item_name: 'gravy'
            }
            const expectedItem = {
                ...testItems[idToUpdate -1],
                ...updatedItem
            }
            return supertest(app)
                .patch(`/api/items/${idToUpdate}`)
                .send(updatedItem)
                .expect(204)
                .then(res => 
                    supertest(app)
                        .get(`/api/items/${idToUpdate}`)
                        .expect(expectedItem)
                )
        })

        it('Responds with 400 when no required fields supplied', () => {
            const idToUpdate = 2
            return supertest(app)
                .patch(`/api/items/${idToUpdate}`)
                .send({ irrelevantField: 'foo' })
                .expect(400, {
                    error: {
                        message: `Request body must contain item_name`
                    }
                })
        })

        it('Responds with 204 when updating only a subset of fields', () => {
            const idToUpdate = 2
            const updatedItem = {
                item_name: 'gravy boat',
            }
            const expectedItem = {
                ...testItems[idToUpdate -1],
                ...updatedItem
            }

            return supertest(app)
                .patch(`/api/items/${idToUpdate}`)
                .send({
                    ...updatedItem,
                    fieldToIgnore: 'should not be in GET response'
                })
                .expect(204)
                .then(res => 
                    supertest(app)
                        .get(`/api/items/${idToUpdate}`)
                        .expect(expectedItem)
                )
        })
    })
})