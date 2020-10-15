const { expect } = require('chai')
const knex = require('knex')
const app = require('../src/app')
const supertest = require('supertest')
const helpers = require('./test-helpers')

describe('ItemCategory Endpoints', function() {
    let db

    const {
        testUsers,
        testItems,
        testCategories,
        testItemCategories
    } = helpers.makeItemsFixtures()

    before('make knex instance', () => {
        db = knex({
          client: 'pg',
          connection: process.env.TEST_DATABASE_URL,
        })
        app.set('db', db)
      })

      after('disconnect from db', () => db.destroy())

      after('disconnect from db', () => db.destroy())

      afterEach('cleanup', () => helpers.cleanTables(db))

      describe(`GET /api/itemCategory/`, () => {
          context(`Given no itemCategories`, () => {
              it('responds with 200 and an empty list', () => {
                  return supertest(app)
                    .get('/api/itemCategory/')
                    .expect(200, [])
              })
          })
          context('Given there are itemCategories in the database', () => {
              beforeEach('insert items and categories', () => 
              helpers.seedItemsTables(
                  db,
                  testUsers,
                  testItems,
                  testCategories,
                  testItemCategories,
              )
            )
            it('responds with 200 and all the time categories', () => {
                const expectedItemCategories = testItemCategories
                return supertest(app)
                    .get('/api/itemCategory/')
                    .expect(200, expectedItemCategories)
            })
          })
      })

      describe(`GET /api/itemCategory/id/:id`, () => {
          context('Given no itemCategories', () => {
              it('responds with 404', () => {
                const id = 111111
                return supertest(app)
                    .get(`/api/itemCategory/id/${id}`)
                    .expect(404, {
                        error: { message: `Item to Category entry doesn't exist` }
                    })
              })
          })
          context(`Given there are itemCategories in the database`, () => {
            beforeEach('insert items and categories', () => 
            helpers.seedItemsTables(
                db,
                testUsers,
                testItems,
                testCategories,
                testItemCategories,
            )
          )
                it(`responds with 200 and the specified itemCategory`, () => {
                    const id = 2
                    const expectedItemCategory = testItemCategories[id - 1]
                    return supertest(app)
                        .get(`/api/itemCategory/id/${id}`)
                        .expect(200, expectedItemCategory)
                })
          })
      })

      describe(`GET /api/itemCategory/item_id/:item_id`, () => {
        context('Given no itemCategories', () => {
            it('responds with 200 and an empty list', () => {
              const item_id = 111111
              return supertest(app)
                  .get(`/api/itemCategory/item_id/${item_id}`)
                  .expect(200, [])
            })
        })
        context(`Given there are itemCategories in the database`, () => {
          beforeEach('insert items and categories', () => 
          helpers.seedItemsTables(
              db,
              testUsers,
              testItems,
              testCategories,
              testItemCategories,
          )
        )
              it(`responds with 200 and the specified itemCategory`, () => {
                  const item_id = 2
                  const expectedItemCategory = testItemCategories.filter(item => item.item_id === item_id)
                  return supertest(app)
                      .get(`/api/itemCategory/item_id/${item_id}`)
                      .expect(200, expectedItemCategory)
              })
        })
    })
    describe(`GET /api/itemCategory/category_id/:category_id`, () => {
        context('Given no itemCategories', () => {
            it('responds with 200 and an empty list', () => {
              const category_id = 111111
              return supertest(app)
                  .get(`/api/itemCategory/category_id/${category_id}`)
                  .expect(200, [])
            })
        })
        context(`Given there are itemCategories in the database`, () => {
          beforeEach('insert items and categories', () => 
          helpers.seedItemsTables(
              db,
              testUsers,
              testItems,
              testCategories,
              testItemCategories,
          )
        )
              it(`responds with 200 and the specified itemCategory`, () => {
                  const category_id = 2
                  const expectedItemCategory = testItemCategories.filter(item => item.category_id === category_id)
                  return supertest(app)
                      .get(`/api/itemCategory/category_id/${category_id}`)
                      .expect(200, expectedItemCategory)
              })
        })
    })

    describe(`GET /api/itemCategory/user_id/:user_id`, () => {
        context('Given no itemCategories', () => {
            it('responds with 200 and an empty list', () => {
              const user_id = 111111
              return supertest(app)
                  .get(`/api/itemCategory/user_id/${user_id}`)
                  .expect(200, [])
            })
        })
        context(`Given there are itemCategories in the database`, () => {
          beforeEach('insert items and categories', () => 
          helpers.seedItemsTables(
              db,
              testUsers,
              testItems,
              testCategories,
              testItemCategories,
          )
        )
              it(`responds with 200 and the specified itemCategory`, () => {
                  const user_id = 2
                  const expectedItemCategory = testItemCategories.filter(item => item.user_id === user_id)
                  return supertest(app)
                      .get(`/api/itemCategory/user_id/${user_id}`)
                      .expect(200, expectedItemCategory)
              })
        })
    })

    describe(`POST /api/itemCategory/`, () => {
        context('Given that there are users, items, and categories in the database', () => {
            beforeEach('insert items and categories', () => 
          helpers.seedItemsTables(
              db,
              testUsers,
              testItems,
              testCategories,
          )
        )
        it('Creates a new itemCategory, responding with 201 and the new itemCategory', () => {
            const newItemCategory = {
                item_id: 3,
                category_id: 3,
                user_id: 1
            }
            return supertest(app)
                .post('/api/itemCategory/')
                .send(newItemCategory)
                .expect(201)
                .then(postRes => 
                    supertest(app)
                        .get(`/api/itemCategory/id/${postRes.body.id}`)
                        .expect(postRes.body)
                    )
        })
        })

        const requiredFields = ['item_id', 'category_id', 'user_id']
        requiredFields.forEach(field => {
            const newItemCategory = {
                item_id: 2,
                category_id: 2,
                user_id: 1
            }
        it(`responds with 400 and an error when the ${field} is missing in the request body`, () => {
                delete newItemCategory[field]
        
                return supertest(app)
                .post('/api/itemCategory/')
                .send(newItemCategory)
                .expect(400, {
                    error: { message: `Missing '${field}' in request body`}
                })
            })
            })
    })

    describe('DELETE /api/itemCategory/id/:id', () => {
        context('Given no itemCategories', () => {
            it('responds with 404', () => {
                const id = 12345
                return supertest(app)
                    .delete(`/api/itemCategory/id/${id}`)
                    .expect(404, {
                        error: { message: `Item to Category entry doesn't exist` }
                    })
            })
        })

        context('Given there are itemCategories in the database', () => {
            beforeEach('insert items and categories', () => 
            helpers.seedItemsTables(
                db,
                testUsers,
                testItems,
                testCategories,
                testItemCategories,
            )
          )
          it('responds with 204 and removes the itemCategory', () => {

          })
        })
    })

    describe(`PATCH /api/itemCategory/id/:id`, () => {
        context('Given no itemCategories', () => {
            it('responds with 404', () => {
                const id = 12345
                return supertest(app)
                    .delete(`/api/itemCategory/id/${id}`)
                    .expect(404, {
                        error: { message: `Item to Category entry doesn't exist` }
                    })
            })
        })
        context('Given there are itemCategories in the database', () => {
            beforeEach('insert items and categories', () => 
            helpers.seedItemsTables(
                db,
                testUsers,
                testItems,
                testCategories,
                testItemCategories,
            )
          )
          it('responds with 204 and updates the itemCategory', () => {
              const idToUpdate = 1
              const updatedItemCategory = {
                  item_id: 2,
                  category_id: 2,
                  user_id: 2
              }
              const expectedItemCategory = {
                  ...testItemCategories[idToUpdate - 1],
                  ...updatedItemCategory
              }
              return supertest(app)
                .patch(`/api/itemCategory/id/${idToUpdate}`)
                .send(updatedItemCategory)
                .expect(204)
                .then(res => 
                    supertest(app)
                        .get(`/api/itemCategory/id/${idToUpdate}`)
                        .expect(expectedItemCategory)
                    )
          })
          it(`Responds with 400 when no required fields supplied`, () => {
              const idToUpdate = 2
              return supertest(app)
                .patch(`/api/itemCategory/id/${idToUpdate}`)
                .send({ irrelevantField: 'foo'})
                .expect(400)
          })
        })
    })

})