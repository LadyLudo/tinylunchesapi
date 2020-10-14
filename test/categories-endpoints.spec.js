const { expect } = require('chai')
const knex = require('knex')
const app = require('../src/app')
const supertest = require('supertest')
const helpers = require('./test-helpers')

describe('Categories Endpoints', function () {


    let db

    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DATABASE_URL,
        })
        app.set('db', db)
    })
    
    after('disconnect from db', () => db.destroy())
    
    before('clean the table', () => db('categories').delete())
    
    afterEach('cleanup', () => db('categories').delete())

    describe('GET /api/categories', function() {
        context('Given no categories', () => {
            it('responds with 200 and an empty list', () => {
                return supertest(app)
                    .get('/api/categories')
                    .expect(200, [])
            })
        })
        context('Given that there are items in the database', () => {
            const testCategories = helpers.makeCategoriesArray()
    
            beforeEach('insert categories', () => {
                return db
                    .into('categories')
                    .insert(testCategories)
            })
    
            it('Responds with 200 and all of the items', () => {
                return supertest(app)
                    .get('/api/categories')
                    .expect(200, testCategories)
            })
        })
    })
    describe('GET /api/categories/:id', () => {
        context('Given no categories', () => {
            it('responds with 404', () => {
                const id = 123456
                return supertest(app)
                    .get(`/api/categories/${id}`)
                    .expect(404)
            })
        })
        context('Given there are categories in the database', () => {
            const testCategories = helpers.makeCategoriesArray()
            
            beforeEach('insert categories', () => {
                return db
                    .into('categories')
                    .insert(testCategories)
            })
    
            it('Responds with 200 and the expected category', () => {
                const id = 2
                const expectedCategory = testCategories[id -1]
                return supertest(app)
                    .get(`/api/categories/${id}`)
                    .expect(200, expectedCategory)
            })
            
        })
    })
    
    describe('POST /api/categories', () => {
        it('creates a category, responding with 201 and the new category', () => {
            const newCategory = {
                name: 'special'
            }
            return supertest(app)
                .post('/api/categories')
                .send(newCategory)
                .expect(201)
                .expect(res => {
                    expect(res.body.name).to.eql(newCategory.name)
                })
                .then(postRes => 
                    supertest(app)
                        .get(`/api/categories/${postRes.body.id}`)
                        .expect(postRes.body)
                    )
        })
    
        const requiredFields = ['name']
        requiredFields.forEach(field => {
            const newCategory = {
                name: 'very special'
            }
            
        it(`responds with 400 and an error when the ${field} is missing in the request body`, () => {
            delete newCategory[field]
    
            return supertest(app)
            .post('/api/categories')
            .send(newCategory)
            .expect(400, {
                error: { message: `Missing '${field}' in request body`}
            })
        })
        })
        
    })

    describe('DELETE /api/categories/id', () => {

        context('Given no categories', () => {
            it('responds with 404', () => {
                const id = 123456
                return supertest(app)
                    .delete(`/api/categories/${id}`)
                    .expect(404, {
                        error: { message: `Category doesn't exist` }
                    })
            })
        })
    
        context('Given there are categories in the database', () => {
            const testCategories = helpers.makeCategoriesArray()
            
            beforeEach('insert categories', () => {
                return db
                    .into('categories')
                    .insert(testCategories)
            })
    
            it('responds with 204 and removes the category', () => {
                const idToRemove = 2
                const expectedCategories = testCategories.filter(category => category.id !== idToRemove)
                return supertest(app)
                    .delete(`/api/categories/${idToRemove}`)
                    .expect(204)
                    .then(res =>
                        supertest(app)
                            .get('/api/categories')
                            .expect(expectedCategories)
                    )
            })
        })
    })

    describe('PATCH /api/categories/:id', () => {
        context('Given no categories', () => {
            it('resonds with 404', () => {
                const id = 123456
                return supertest(app)
                    .patch(`/api/categories/${id}`)
                    .expect(404, { error: { message: `Category doesn't exist` } })
            })
        })
    
        context('Given there are categories in the database', () => {
            const testCategories = helpers.makeCategoriesArray()
            
            beforeEach('insert categories', () => {
                return db
                    .into('categories')
                    .insert(testCategories)
            })
    
            it('Responds with 204 and updates the category', () => {
                const idToUpdate = 2
                const updatedCategory = {
                    name: 'specialest'
                }
                const expectedCategory = {
                    ...testCategories[idToUpdate -1],
                    ...updatedCategory
                }
                return supertest(app)
                    .patch(`/api/categories/${idToUpdate}`)
                    .send(updatedCategory)
                    .expect(204)
                    .then(res => 
                        supertest(app)
                            .get(`/api/categories/${idToUpdate}`)
                            .expect(expectedCategory)
                    )
            })
    
            it('Responds with 400 when no required fields supplied', () => {
                const idToUpdate = 2
                return supertest(app)
                    .patch(`/api/categories/${idToUpdate}`)
                    .send({ irrelevantField: 'foo' })
                    .expect(400, {
                        error: {
                            message: `Request body must contain name`
                        }
                    })
            })
    
            it('Responds with 204 when updating only a subset of fields', () => {
                const idToUpdate = 2
                const updatedCategory = {
                    name: 'more special',
                }
                const expectedCategory = {
                    ...testCategories[idToUpdate -1],
                    ...updatedCategory
                }
    
                return supertest(app)
                    .patch(`/api/categories/${idToUpdate}`)
                    .send({
                        ...updatedCategory,
                        fieldToIgnore: 'should not be in GET response'
                    })
                    .expect(204)
                    .then(res => 
                        supertest(app)
                            .get(`/api/categories/${idToUpdate}`)
                            .expect(expectedCategory)
                    )
            })
        })
    })



})